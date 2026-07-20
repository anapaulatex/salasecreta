// Edge Function: analisar-raio-x
// Recebe { lead_id }, baixa os prints do Storage, faz UMA chamada de visão
// ao Claude e salva o relatório estruturado em `relatorios.dados`.
//
// Secrets necessários (supabase secrets set):
//   ANTHROPIC_API_KEY=sk-ant-...

import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Estrutura fixa do relatório — validada pela API via structured outputs.
const ESQUEMA_RELATORIO = {
  type: 'object',
  additionalProperties: false,
  required: ['tipo', 'mensagemReenvio', 'reconhecimento', 'eixos', 'bioSugerida', 'viradaDeCategoria', 'ideias'],
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
        required: ['chave', 'titulo', 'nota', 'observado', 'porQueImporta'],
        properties: {
          chave: { type: 'string', enum: ['bio', 'temas', 'posicionamento', 'caminho'] },
          titulo: { type: 'string' },
          nota: { type: 'integer', enum: [1, 2, 3, 4, 5] },
          observado: {
            type: 'string',
            description: 'O que foi observado NO PERFIL DELA (citar o que está visível no print). 2-4 frases.',
          },
          porQueImporta: { type: 'string', description: 'Uma linha explicando por que isso importa.' },
        },
      },
    },
    bioSugerida: {
      type: 'string',
      description: 'Bio pronta pra copiar, com quebras de linha (\\n), especialidade + público + chamada. Máx 150 caracteres úteis por linha, 4 linhas.',
    },
    viradaDeCategoria: {
      type: 'string',
      description: 'Texto personalizado no formato: no mercado dela, quase ninguém se posicionou como a especialista que domina Inteligência Artificial; essa cadeira está vazia e quem senta primeiro vira referência.',
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
  return `Você é a Inteligência Artificial oficial do Raio-X do Instagram da mentora Ana Tex — mentora de especialistas (médicas, advogadas, nutricionistas, arquitetas…) que querem se reinventar com Inteligência Artificial. Você analisa prints de perfis do Instagram e devolve um relatório personalizado na voz da Ana.

VOZ DA ANA (siga à risca):
- Tom de amiga mais esperta da sala: leve, direto, acolhedor, sem drama e sem rodeio. Fala como quem diz a verdade tomando café.
- SEMPRE reconhece o ativo primeiro: começa pela autoridade/experiência visível no perfil. Frases como "seu perfil ainda não conta a sua autoridade" são o caminho; "seu perfil é ruim" é PROIBIDO. Nunca humilhe.
- Concreta e específica: cite o que está escrito na bio dela, os temas visíveis nos posts. Nada genérico.
- Escreva SEMPRE "Inteligência Artificial" por extenso. NUNCA "IA".
- Proibido: linguagem corporativa, empilhar adjetivos, CTA agressivo (CORRE!, ÚLTIMA CHANCE), "você merece", "do zero", "mesmo sem saber nada", promessas fáceis, palavras como "incrível", "revolucionário", "imagine", "simplesmente", "literalmente", "basicamente".
- Frases-âncora obrigatórias nos eixos: Bio → "bio não é currículo, é promessa". Temas (se técnico demais) → "você está postando pro concorrente, não pro cliente". Posicionamento (se genérico) → "quem fala com todo mundo não é lembrada por ninguém". Caminho da venda → interesse sem caminho vira seguidor parado.

REGRAS DA ANÁLISE (invioláveis):
1. Analise SÓ o que está visível nos prints: texto da bio, temas aparentes dos posts, presença de rosto/pessoa, link/destaques/chamadas. NUNCA invente métricas (seguidores, engajamento, alcance) que não dá pra ler com clareza no print.
2. Os 4 eixos são fixos: bio ("Bio"), temas ("Temas dos posts"), posicionamento ("Posicionamento"), caminho ("Caminho da venda"). Nota de 1 a 5. Seja justa: reconheça o que já está bom.
3. A Parte 2 entrega direção real e utilizável (bio pronta pra copiar, virada de categoria, 3 ideias com gancho pronto) — mas NUNCA o passo a passo profundo. O COMO completo é a Sala Secreta e a mentoria da Ana.
4. As 3 ideias de conteúdo miram os clientes de MAIOR potencial dela (quem pode contratá-la), não o seguidor curioso. Nomeie a persona pela dor ou momento de vida, nunca com tecnicês.
5. A virada de categoria é o clímax: no mercado/nicho DELA, quase ninguém se posicionou como a especialista que domina Inteligência Artificial — essa cadeira está vazia, e quem senta primeiro vira referência. Personalize com o nicho declarado.
6. Se as imagens estiverem ilegíveis, embaçadas, ou não forem um perfil do Instagram: retorne tipo="reenvio" com mensagemReenvio carinhosa pedindo novo print (a tela do perfil aberta, como uma cliente veria), e deixe os demais campos vazios/lista vazia. Nunca invente uma análise que você não conseguiu fazer.

Responda em português brasileiro.`
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
      .select('id, nome, nicho, instagram, momento, faturamento, imagens, consentimento')
      .eq('id', lead_id)
      .single()
    if (erroLead || !lead) throw new Error('Lead não encontrado')
    if (!lead.consentimento) throw new Error('Sem consentimento')
    if (!lead.imagens?.length) throw new Error('Sem prints enviados')

    // Baixa os prints (máx 3) e converte pra base64
    const blocosImagem = []
    for (const caminho of lead.imagens.slice(0, 3)) {
      const { data: arquivo, error: erroDownload } = await supabase.storage
        .from('prints')
        .download(caminho)
      if (erroDownload || !arquivo) throw new Error(`Não consegui baixar o print ${caminho}`)
      const bytes = new Uint8Array(await arquivo.arrayBuffer())
      let binario = ''
      const passo = 8192
      for (let i = 0; i < bytes.length; i += passo) {
        binario += String.fromCharCode(...bytes.subarray(i, i + passo))
      }
      const extensao = caminho.split('.').pop()?.toLowerCase() ?? 'jpeg'
      const mediaType = extensao === 'png' ? 'image/png' : extensao === 'webp' ? 'image/webp' : 'image/jpeg'
      blocosImagem.push({
        type: 'image' as const,
        source: { type: 'base64' as const, media_type: mediaType, data: btoa(binario) },
      })
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
          content: [
            ...blocosImagem,
            {
              type: 'text',
              text: `Prints do perfil do Instagram de ${lead.nome} (${lead.instagram}), que se declarou como: "${lead.nicho}". Momento declarado: ${
                lead.momento === 'transicao'
                  ? 'em transição de carreira'
                  : lead.momento === 'empresaria'
                    ? 'tem empresa e quer colocar Inteligência Artificial nela'
                    : 'atende clientes como especialista'
              }. Use esse contexto pra calibrar exemplos e a virada de categoria (sem citar faturamento nem rotular a pessoa). Gere o Raio-X completo dela.`,
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
