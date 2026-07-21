import type { Config, DashboardDados, Lead, Relatorio, RelatorioDados } from './types'

/**
 * Relatório de exemplo — usado em /relatorio/exemplo e no modo demonstração.
 * Persona: Dra. Camila, nutricionista com 15 anos de consultório.
 */
export const relatorioExemplo: RelatorioDados = {
  tipo: 'relatorio',
  reconhecimento:
    'Camila, a primeira coisa que o seu perfil mostra é que você tem bagagem de verdade: 15 anos de consultório aparecem nas fotos, nos atendimentos, no jeito que você fala de nutrição. O problema não é a sua autoridade — é que o seu perfil ainda não conta essa história pra quem chega nele pela primeira vez. Bora ver isso por partes.',
  eixos: [
    {
      chave: 'bio',
      titulo: 'Bio',
      nota: 2,
      observado:
        'Sua bio hoje diz: "Nutricionista · CRN 12345 · Pós em Nutrição Clínica · Atendimento presencial e online". Uma cliente que chega no seu perfil lê isso em 5 segundos e não descobre o principal: o que muda na vida dela se ela te contratar.',
      porQueImporta:
        'Bio não é currículo, é promessa. O CRN comprova que você pode atuar — mas é a promessa que faz a cliente clicar em "seguir" e mandar mensagem.',
      paraNota5:
        'Trocar o currículo pela promessa: uma linha dizendo o que muda na vida da paciente e pra quem, mais um convite claro de próximo passo. A Parte 2 te mostra os 3 elementos que não podem faltar.',
    },
    {
      chave: 'temas',
      titulo: 'Temas dos posts',
      nota: 3,
      observado:
        'No seu feed aparecem posts sobre déficit calórico, janela anabólica e leitura de rótulos. Conteúdo correto, bem-feito — mas escrito na linguagem de quem estudou nutrição. A sua cliente não procura "janela anabólica", ela procura "por que eu emagreço e engordo tudo de novo".',
      porQueImporta:
        'Quando o conteúdo é técnico demais, você está postando pro concorrente, não pro cliente. Quem entende os seus termos é outra nutricionista.',
      paraNota5:
        'Traduzir cada tema técnico pra dor de quem paga: "janela anabólica" vira "por que você emagrece e engorda tudo de novo". As 3 ideias da Parte 2 já saem nessa língua — é seguir o modelo.',
    },
    {
      chave: 'posicionamento',
      titulo: 'Posicionamento',
      nota: 2,
      observado:
        'Olhando o perfil inteiro, dá pra saber que você é nutricionista — mas não dá pra saber qual é a sua especialidade nem pra quem você trabalha. Emagrecimento? Mulheres 40+? Saúde intestinal? O perfil fala com todo mundo ao mesmo tempo.',
      porQueImporta:
        'Quem fala com todo mundo não é lembrada por ninguém. A cliente certa precisa se reconhecer no seu perfil em segundos — "é de mim que ela está falando".',
      paraNota5:
        'Escolher uma especialidade e um público — e assumir nos 3 lugares que a cliente olha primeiro: bio, destaques e os últimos 9 posts do feed. Tudo contando a mesma história.',
    },
    {
      chave: 'caminho',
      titulo: 'Caminho da venda',
      nota: 3,
      observado:
        'Quem se apaixona pelo seu conteúdo encontra um link do WhatsApp na bio — isso é um bom começo. Mas não há destaque explicando como funciona a consulta, nem chamada nos posts convidando pro próximo passo. A pessoa interessada precisa adivinhar o caminho.',
      porQueImporta:
        'Interesse sem caminho vira seguidor parado. Cada post é uma vitrine — e vitrine boa mostra onde fica a porta de entrada.',
      paraNota5:
        'Um caminho só, repetido sempre: destaque "Como funciona" explicando a consulta, link direto e a mesma chamada no fim de todo post. Quem se apaixonar nunca precisa adivinhar o próximo passo.',
    },
  ],
  bioDirecao: {
    promessa:
      'Hoje sua bio lista títulos (CRN, pós, atendimento). A primeira linha precisa prometer o que muda na vida da paciente — emagrecer sem viver de dieta maluca, com acompanhamento de verdade. O CRN entra depois, como prova.',
    publico:
      'Nomear pra quem você trabalha. Pelo seu feed, suas melhores histórias são de mulheres 40+ que já tentaram de tudo — quando a bio diz isso, a paciente certa se reconhece em 5 segundos.',
    chamada:
      'Fechar com UM convite claro de próximo passo. Hoje a bio termina sem porta de entrada — quem se interessa precisa adivinhar o que fazer.',
  },
  viradaDeCategoria:
    'No seu mercado de nutrição, quase ninguém se posicionou como a especialista que domina Inteligência Artificial. Tem milhares de nutricionistas disputando o mesmo feed com as mesmas receitas — mas a cadeira de "nutricionista que usa Inteligência Artificial pra entregar acompanhamento mais próximo, mais rápido e mais personalizado" está vazia na sua cidade. E quem senta primeiro vira referência: é dela que as pacientes falam, é ela que os convites de palestra procuram, é ela que cobra mais sem pedir desculpa.',
  ideias: [
    {
      titulo: 'O plano alimentar que a sua paciente abandona (e por quê)',
      gancho:
        'Se você já pagou nutricionista, seguiu o plano por 3 semanas e abandonou — o problema não foi disciplina. Foi o plano.',
      porQue:
        'Fala direto com a mulher que já tentou e se frustrou — a sua cliente de maior potencial, que valoriza acompanhamento de verdade e paga por ele.',
    },
    {
      titulo: 'Por que emagrecer depois dos 40 é outro jogo',
      gancho:
        'O corpo que você tinha aos 30 respondia a qualquer dieta. O de agora precisa de estratégia — e ninguém te contou isso.',
      porQue:
        'Nomeia a persona pelo momento de vida, não pela técnica. Quem se reconhece aqui chega na consulta pronta pra fechar.',
    },
    {
      titulo: 'O exame que você faz todo ano e ninguém interpreta direito',
      gancho:
        'Você sai do check-up com "tá tudo normal" — e continua inchada, cansada e sem emagrecer. Normal pra quem?',
      porQue:
        'Posiciona você como a especialista que enxerga o que o atendimento apressado não vê — justamente o que a cliente premium procura.',
    },
  ],
}

export const relatorioReenvioExemplo: RelatorioDados = {
  tipo: 'reenvio',
  mensagemReenvio:
    'Me conta uma coisa: acho que o print não chegou direitinho por aqui. A imagem veio embaçada e não consegui ler a sua bio nem ver os seus posts — e eu não vou te entregar uma análise pela metade. Envia de novo pra mim? Vale a tela do seu perfil aberta, daquele jeito que uma cliente veria. Te espero! 💜',
  reconhecimento: '',
  eixos: [],
  bioDirecao: { promessa: '', publico: '', chamada: '' },
  viradaDeCategoria: '',
  ideias: [],
}

export const configPadrao: Config = {
  sala_dia_hora: 'Quarta-feira, às 18h (horário de Brasília)',
  sala_link: 'https://lucrocomia.com.br/sala-secreta',
  convite_texto:
    'Você acabou de ver o diagnóstico e a direção. Na Sala Secreta desta semana eu mostro AO VIVO como especialistas como você estão fazendo essa virada com Inteligência Artificial — no nicho delas, do jeito delas.',
}

const diasAtras = (dias: number) => {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return d.toISOString()
}

export const leadsExemplo: Lead[] = [
  {
    id: 'demo-1',
    nome: 'Dra. Camila Ribeiro',
    whatsapp: '(31) 99876-5432',
    instagram: '@dracamilanutri',
    nicho: 'Nutrição',
    origem: 'print',
    momento: 'especialista',
    faturamento: 'acima_10k',
    rota: 'mapeamento',
    status: 'novo',
    created_at: diasAtras(0),
    relatorio_id: 'exemplo',
  },
  {
    id: 'demo-2',
    nome: 'Fernanda Alves',
    whatsapp: '(11) 98765-4321',
    instagram: '@fernandaalves.adv',
    nicho: 'Advocacia',
    origem: 'print',
    momento: 'transicao',
    faturamento: 'de_5k_a_10k',
    rota: 'academia',
    status: 'foi_pra_sala',
    created_at: diasAtras(1),
    relatorio_id: 'exemplo',
  },
  {
    id: 'demo-3',
    nome: 'Patrícia Moura',
    whatsapp: '(21) 97654-3210',
    instagram: '@arqpatriciamoura',
    nicho: 'Arquitetura',
    origem: 'print',
    momento: 'especialista',
    faturamento: 'de_5k_a_10k',
    rota: 'mapeamento',
    status: 'virou_sessao',
    created_at: diasAtras(2),
    relatorio_id: 'exemplo',
  },
  {
    id: 'demo-4',
    nome: 'Dra. Luciana Freitas',
    whatsapp: '(41) 96543-2109',
    instagram: '@dralucianafreitas',
    nicho: 'Medicina',
    origem: 'print',
    momento: 'empresaria',
    faturamento: 'ate_5k',
    rota: 'mnia',
    status: 'novo',
    created_at: diasAtras(3),
    relatorio_id: 'exemplo',
  },
  {
    id: 'demo-5',
    nome: 'Renata Campos',
    whatsapp: '(51) 95432-1098',
    instagram: '@renatacampos.psi',
    nicho: 'Psicologia',
    origem: 'print',
    momento: 'transicao',
    faturamento: 'nao_faturo',
    rota: 'academia',
    status: 'foi_pra_sala',
    created_at: diasAtras(5),
    relatorio_id: 'exemplo',
  },
]

export const dashboardExemplo: DashboardDados = {
  totalSemana: 4,
  totalGeral: 5,
  porNicho: [
    { nicho: 'Nutrição', total: 1 },
    { nicho: 'Advocacia', total: 1 },
    { nicho: 'Arquitetura', total: 1 },
    { nicho: 'Medicina', total: 1 },
    { nicho: 'Psicologia', total: 1 },
  ],
  porRota: [
    { rota: 'mapeamento', total: 2 },
    { rota: 'academia', total: 2 },
    { rota: 'mnia', total: 1 },
  ],
  funil: { raioX: 5, cliquesSala: 3, cliquesWhatsApp: 2 },
}

export const relatorioExemploCompleto: Relatorio = {
  id: 'exemplo',
  dados: relatorioExemplo,
  nome: 'Dra. Camila Ribeiro',
  nicho: 'Nutrição',
  status: 'pronto',
  created_at: diasAtras(0),
}
