// Edge Function: analisar-raio-x
// Recebe { lead_id } e gera o relatório com UMA chamada de visão ao Claude.
// Dois caminhos:
//   origem = 'print' → baixa os prints do Storage
//   origem = 'link'  → coleta o perfil público via Apify (máx. 2 análises por @)
//
// Secrets necessários (supabase secrets set):
//   ANTHROPIC_API_KEY=sk-ant-...
//   APIFY_TOKEN=apify_api_...   (só pro caminho do link)

import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MENSAGEM_LIMITE_LINK =
  'Você já usou as 2 análises pelo link desse perfil. Mas relaxa: me envia o print do seu perfil que o raio-x sai igualzinho. 😉'

// Estrutura fixa do relatório — validada pela API via structured outputs.
const ESQUEMA_RELATORIO = {
  type: 'object',
  additionalProperties: false,
  required: ['tipo', 'mensagemReenvio', 'reconhecimento', 'eixos', 'bioDirecao', 'viradaDeCategoria', 'ideias', 'degrauEscala'],
  properties: {
    tipo: { type: 'string', enum: ['relatorio', 'reenvio'] },
    mensagemReenvio: {
      type: 'string',
      description: 'Só quando tipo=reenvio: pedido carinhoso de novo print, na voz da Ana. Senão, string vazia.',
    },
    reconhecimento: {
      type: 'string',
      description: 'Abertura que reconhece o ativo/autoridade visível no perfil antes de qualquer crítica. 2-4 frases, usando o primeiro nome.',
    },
    eixos: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['chave', 'titulo', 'nota', 'observado', 'porQueImporta', 'paraNota5'],
        properties: {
          chave: { type: 'string', enum: ['bio', 'temas', 'posicionamento', 'caminho'] },
          titulo: { type: 'string' },
          nota: { type: 'integer', enum: [1, 2, 3, 4, 5] },
          observado: {
            type: 'string',
            description: 'O que foi observado NO PERFIL DELA (citar o que está visível). 2-4 frases.',
          },
          porQueImporta: { type: 'string', description: 'Uma linha explicando por que isso importa.' },
          paraNota5: {
            type: 'string',
            description: 'O que falta pra chegar à nota 5 nesse eixo: direção concreta e utilizável hoje (1-2 frases), SEM o passo a passo profundo — o COMO completo é a Sala Secreta e a mentoria. Se a nota já é 5, celebre e diga como manter.',
          },
        },
      },
    },
    bioDirecao: {
      type: 'object',
      additionalProperties: false,
      required: ['promessa', 'publico', 'chamada'],
      description: 'A direção do que a bio dela precisa dizer — NUNCA a bio pronta/reescrita. Cada campo é personalizado com o que foi observado no perfil dela.',
      properties: {
        promessa: {
          type: 'string',
          description: 'O que a primeira linha da bio precisa prometer (o resultado pra cliente), contrastando com o que a bio atual diz. 1-2 frases. Sem escrever a frase pronta da bio.',
        },
        publico: {
          type: 'string',
          description: 'Pra quem a bio precisa falar — o público de maior potencial visível no perfil dela. 1-2 frases.',
        },
        chamada: {
          type: 'string',
          description: 'O próximo passo que a bio precisa convidar (uma chamada única e clara). 1-2 frases. Sem escrever a chamada pronta.',
        },
      },
    },
    viradaDeCategoria: {
      type: 'string',
      description: 'Texto personalizado no formato: no mercado dela, quase ninguém se posicionou como a especialista que domina Inteligência Artificial; essa cadeira está vazia e quem senta primeiro vira referência.',
    },
    degrauEscala: {
      type: 'string',
      description: 'O degrau acima do perfil: como o MÉTODO dela pode virar soluções com Inteligência Artificial vendidas de forma escalável, agregando mais valor — 3-5 frases personalizadas com o nicho e o pilar de dor dela. Cite CATEGORIAS de solução (assistente, programa, produto do método), NUNCA o blueprint/passo a passo. Feche conectando com o caminho das especialistas da mentoria.',
    },
    ideias: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['titulo', 'gancho', 'porQue'],
        properties: {
          titulo: { type: 'string' },
          gancho: { type: 'string', description: 'Gancho pronto pra usar, em primeira pessoa da cliente ou nomeando a persona.' },
          porQue: { type: 'string', description: 'Por que essa ideia atrai o cliente de MAIOR potencial (não o seguidor curioso).' },
        },
      },
    },
  },
} as const

function promptSistema(): string {
  return `Você é a Inteligência Artificial oficial do Raio-X do Instagram da mentora Ana Tex — mentora de especialistas (médicas, advogadas, nutricionistas, arquitetas…) que querem se reinventar com Inteligência Artificial. Você analisa perfis do Instagram (por prints enviados ou por dados coletados do perfil público) e devolve um relatório personalizado na voz da Ana.

VOZ DA ANA (siga à risca):
- Tom de amiga mais esperta da sala: leve, direto, acolhedor, sem drama e sem rodeio. Fala como quem diz a verdade tomando café.
- SEMPRE reconhece o ativo primeiro: começa pela autoridade/experiência visível no perfil. Frases como "seu perfil ainda não conta a sua autoridade" são o caminho; "seu perfil é ruim" é PROIBIDO. Nunca humilhe.
- Concreta e específica: cite o que está escrito na bio dela, os temas visíveis nos posts. Nada genérico.
- Escreva SEMPRE "Inteligência Artificial" por extenso. NUNCA "IA".
- Proibido: linguagem corporativa, empilhar adjetivos, CTA agressivo (CORRE!, ÚLTIMA CHANCE), "você merece", "do zero", "mesmo sem saber nada", promessas fáceis, palavras como "incrível", "revolucionário", "imagine", "simplesmente", "literalmente", "basicamente".
- Frases-âncora obrigatórias nos eixos: Bio → "bio não é currículo, é promessa". Temas (se técnico demais) → "você está postando pro concorrente, não pro cliente". Posicionamento (se genérico) → "quem fala com todo mundo não é lembrada por ninguém". Caminho da venda → interesse sem caminho vira seguidor parado.

REGRAS DA ANÁLISE (invioláveis):
1. Analise SÓ o que foi fornecido: texto da bio, temas dos posts, presença de rosto/pessoa, link/destaques/chamadas. NUNCA invente métricas que não estejam nos dados fornecidos.
2. Os 4 eixos são fixos: bio ("Bio"), temas ("Temas dos posts"), posicionamento ("Posicionamento"), caminho ("Caminho da venda"). Nota de 1 a 5. Seja justa: reconheça o que já está bom.
3. A Parte 2 entrega direção real e utilizável (o que a bio precisa dizer, virada de categoria, 3 ideias com gancho pronto) — mas NUNCA o passo a passo profundo. NUNCA reescreva a bio pronta pela pessoa: entregue a direção dos 3 elementos (promessa, público, chamada); escrever a bio junto é papel da Sala Secreta e da mentoria da Ana.
4. As 3 ideias de conteúdo miram os clientes de MAIOR potencial dela (quem pode contratá-la), não o seguidor curioso. Nomeie a persona pela dor ou momento de vida, nunca com tecnicês.
5. A virada de categoria é o clímax: no mercado/nicho DELA, quase ninguém se posicionou como a especialista que domina Inteligência Artificial — essa cadeira está vazia, e quem senta primeiro vira referência. Personalize com o nicho declarado.
5b. O degrauEscala aponta o horizonte além do perfil: o método dela virando soluções com Inteligência Artificial e venda escalável. Calibre pelo pilar de dor do teste (clareza = "não sei pra quem falo"; tempo = "escrava da agenda"; autoridade = "boa e invisível"; vendas = "dependo da minha hora pra faturar"). O relatório inteiro — abertura, virada e degrau — deve conversar com esse pilar.
6. Se o material estiver ilegível, não for um perfil do Instagram, ou os dados coletados estiverem vazios: retorne tipo="reenvio" com mensagemReenvio carinhosa pedindo o print do perfil (a tela aberta, como uma cliente veria), e deixe os demais campos vazios/lista vazia. Nunca invente uma análise que você não conseguiu fazer.

Responda em português brasileiro.`
}

function contextoMomento(momento: string): string {
  if (momento === 'transicao') return 'em transição de carreira'
  if (momento === 'empresaria') return 'tem empresa e quer colocar Inteligência Artificial nela'
  return 'atende clientes como especialista'
}

async function blocoImagem(bytes: Uint8Array, mediaType: string) {
  let binario = ''
  const passo = 8192
  for (let i = 0; i < bytes.length; i += passo) {
    binario += String.fromCharCode(...bytes.subarray(i, i + passo))
  }
  return {
    type: 'image' as const,
    source: { type: 'base64' as const, media_type: mediaType, data: btoa(binario) },
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { lead_id } = await req.json()
    if (!lead_id) throw new Error('lead_id ausente')

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: lead, error: erroLead } = await supabase
      .from('leads')
      .select('id, nome, nicho, instagram, origem, momento, faturamento, pilar, imagens, consentimento')
      .eq('id', lead_id)
      .single()
    if (erroLead || !lead) throw new Error('Lead não encontrado')
    if (!lead.consentimento) throw new Error('Sem consentimento')

    const conteudo: unknown[] = []
    let descricaoMaterial = ''

    if (lead.origem === 'link') {
      // --- Limite: no máximo 2 análises pelo link por perfil ---
      const { count } = await supabase
        .from('leads')
        .select('id, relatorios!inner(id)', { count: 'exact', head: true })
        .ilike('instagram', lead.instagram)
        .eq('origem', 'link')
        .neq('id', lead.id)
      if ((count ?? 0) >= 2) {
        return new Response(JSON.stringify({ erro: MENSAGEM_LIMITE_LINK }), {
          headers: { ...cors, 'Content-Type': 'application/json' },
        })
      }

      // --- Coleta do perfil público via Apify ---
      const token = Deno.env.get('APIFY_TOKEN')
      if (!token) throw new Error('APIFY_TOKEN não configurado')
      const handle = lead.instagram.replace(/^@/, '').toLowerCase()
      const respostaApify = await fetch(
        `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            directUrls: [`https://www.instagram.com/${handle}/`],
            resultsType: 'details',
            resultsLimit: 1,
            addParentData: false,
          }),
        },
      )
      if (!respostaApify.ok) throw new Error(`Coleta do perfil falhou (${respostaApify.status})`)
      const itens = await respostaApify.json()
      const perfil = Array.isArray(itens) ? itens[0] : null

      if (!perfil || perfil.error || perfil.private) {
        // Perfil privado/não encontrado → relatório de reenvio carinhoso, sem gastar análise
        const dadosReenvio = {
          tipo: 'reenvio',
          mensagemReenvio: perfil?.private
            ? `Fui espiar o ${lead.instagram} e ele está no modo privado — e eu só analiso o que está aberto, combinado? Me envia o print do seu perfil (a tela aberta, como uma cliente veria) que o seu raio-x sai igualzinho. 💜`
            : `Procurei o ${lead.instagram} e não consegui abrir o perfil por aqui. Confere se o @ está certinho — ou me envia o print do seu perfil que a análise sai na hora. 💜`,
          reconhecimento: '',
          eixos: [],
          bioDirecao: { promessa: '', publico: '', chamada: '' },
          viradaDeCategoria: '',
          ideias: [],
        }
        const { data: relatorioReenvio } = await supabase
          .from('relatorios')
          .insert({ lead_id: lead.id, dados: dadosReenvio, status: 'pronto' })
          .select('id')
          .single()
        return new Response(JSON.stringify({ relatorio_id: relatorioReenvio?.id }), {
          headers: { ...cors, 'Content-Type': 'application/json' },
        })
      }

      const posts = (perfil.latestPosts ?? []).slice(0, 8)
      descricaoMaterial = [
        `DADOS COLETADOS DO PERFIL PÚBLICO ${lead.instagram}:`,
        `Nome no perfil: ${perfil.fullName ?? '(vazio)'}`,
        `Bio: ${perfil.biography ?? '(vazia)'}`,
        `Link na bio: ${perfil.externalUrl ?? '(nenhum)'}`,
        `Seguidores: ${perfil.followersCount ?? 'não informado'} · Posts: ${perfil.postsCount ?? 'não informado'}`,
        `Verificada: ${perfil.verified ? 'sim' : 'não'} · Conta business: ${perfil.isBusinessAccount ? 'sim' : 'não'}`,
        '',
        'LEGENDAS DOS ÚLTIMOS POSTS:',
        ...posts.map(
          (p: { caption?: string; type?: string }, i: number) =>
            `${i + 1}. [${p.type ?? 'post'}] ${(p.caption ?? '(sem legenda)').slice(0, 400)}`,
        ),
      ].join('\n')

      // Até 3 imagens dos posts recentes pra análise visual
      const urlsImagens = posts
        .map((p: { displayUrl?: string }) => p.displayUrl)
        .filter(Boolean)
        .slice(0, 3)
      for (const url of urlsImagens) {
        try {
          const r = await fetch(url)
          if (!r.ok) continue
          const bytes = new Uint8Array(await r.arrayBuffer())
          conteudo.push(await blocoImagem(bytes, 'image/jpeg'))
        } catch (_) {
          // imagem indisponível não impede a análise
        }
      }
    } else {
      // --- Caminho original: prints enviados ---
      if (!lead.imagens?.length) throw new Error('Sem prints enviados')
      for (const caminho of lead.imagens.slice(0, 3)) {
        const { data: arquivo, error: erroDownload } = await supabase.storage
          .from('prints')
          .download(caminho)
        if (erroDownload || !arquivo) throw new Error(`Não consegui baixar o print ${caminho}`)
        const bytes = new Uint8Array(await arquivo.arrayBuffer())
        const extensao = caminho.split('.').pop()?.toLowerCase() ?? 'jpeg'
        const mediaType = extensao === 'png' ? 'image/png' : extensao === 'webp' ? 'image/webp' : 'image/jpeg'
        conteudo.push(await blocoImagem(bytes, mediaType))
      }
      descricaoMaterial = 'Prints do perfil do Instagram enviados pela própria pessoa.'
    }

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! })

    // Uma chamada só, com saída estruturada validada pelo esquema
    const resposta = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      system: promptSistema(),
      output_config: { format: { type: 'json_schema', schema: ESQUEMA_RELATORIO } },
      messages: [
        {
          role: 'user',
          // deno-lint-ignore no-explicit-any
          content: [
            ...(conteudo as any[]),
            {
              type: 'text',
              text: `${descricaoMaterial}\n\nPerfil de ${lead.nome} (${lead.instagram}), que se declarou como: "${lead.nicho}". Momento declarado: ${contextoMomento(lead.momento)}. Pilar de dor apontado pelo teste: ${lead.pilar ?? 'vendas'}. Use esse contexto pra calibrar a abertura, os exemplos, a virada de categoria e o degrauEscala (sem citar faturamento nem rotular a pessoa). Gere o Raio-X completo dela.`,
            },
          ],
        },
      ],
    })

    if (resposta.stop_reason === 'refusal') {
      throw new Error('A análise foi recusada pelos filtros de segurança.')
    }
    const blocoTexto = resposta.content.find((b) => b.type === 'text')
    if (!blocoTexto || blocoTexto.type !== 'text') throw new Error('Resposta sem conteúdo')
    const dados = JSON.parse(blocoTexto.text)
    dados.pilar = lead.pilar ?? 'vendas'

    const { data: relatorio, error: erroRelatorio } = await supabase
      .from('relatorios')
      .insert({ lead_id: lead.id, dados, status: 'pronto' })
      .select('id')
      .single()
    if (erroRelatorio || !relatorio) throw new Error('Não consegui salvar o relatório')

    return new Response(JSON.stringify({ relatorio_id: relatorio.id }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (erro) {
    console.error('analisar-raio-x:', erro)
    return new Response(
      JSON.stringify({ erro: erro instanceof Error ? erro.message : 'Erro na análise' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  }
})
