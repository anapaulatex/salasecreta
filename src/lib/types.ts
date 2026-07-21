export type EixoChave = 'bio' | 'temas' | 'posicionamento' | 'caminho'

export interface Eixo {
  chave: EixoChave
  titulo: string
  nota: 1 | 2 | 3 | 4 | 5
  observado: string
  porQueImporta: string
  /** Direção concreta do que falta pra nota 5 — sem o passo a passo profundo */
  paraNota5: string
}

export interface IdeiaConteudo {
  titulo: string
  gancho: string
  porQue: string
}

/** Pilar de dor identificado no teste (Etapa 1) — mapeia nas fases do método da Ana */
export type Pilar = 'clareza' | 'tempo' | 'autoridade' | 'vendas'

/** Direção personalizada da bio — o QUE ela precisa dizer, nunca a bio pronta */
export interface DirecaoBio {
  promessa: string
  publico: string
  chamada: string
}

export interface RelatorioDados {
  tipo: 'relatorio' | 'reenvio'
  /** Preenchido quando tipo === 'reenvio': pedido carinhoso de novo print */
  mensagemReenvio?: string
  /** Abertura que reconhece o ativo — nunca começa pelo problema */
  reconhecimento: string
  eixos: Eixo[]
  bioDirecao: DirecaoBio
  /** Legado (relatórios antigos entregavam a bio pronta — regra mudou em 20/07/2026) */
  bioSugerida?: string
  viradaDeCategoria: string
  ideias: IdeiaConteudo[]
  /** O degrau acima do perfil: soluções com Inteligência Artificial + venda escalável no método dela */
  degrauEscala?: string
  /** Ecoa o pilar do teste pra personalizar a abertura do relatório */
  pilar?: Pilar
}

export type LeadStatus = 'novo' | 'foi_pra_sala' | 'virou_sessao'

/** Momento declarado no formulário — alimenta o roteamento de oferta */
export type Momento = 'especialista' | 'transicao' | 'empresaria'

export type Faturamento = 'nao_faturo' | 'ate_5k' | 'de_5k_a_10k' | 'acima_10k'

/** Pra qual oferta essa lead vai depois da Sala Secreta / mapeamento */
export type Rota = 'academia' | 'mnia' | 'mapeamento'

/** Como o perfil foi analisado: print enviado ou coleta pelo link público */
export type Origem = 'print' | 'link'

export interface Lead {
  id: string
  nome: string
  whatsapp: string
  instagram: string
  nicho: string
  origem: Origem
  momento: Momento
  faturamento: Faturamento
  pilar: Pilar
  rota: Rota
  status: LeadStatus
  created_at: string
  relatorio_id: string | null
}

export interface Config {
  sala_dia_hora: string
  sala_link: string
  convite_texto: string
}

export interface Relatorio {
  id: string
  dados: RelatorioDados
  nome: string
  nicho: string
  status: 'pendente' | 'pronto' | 'erro'
  created_at: string
}

export interface DashboardDados {
  totalSemana: number
  totalGeral: number
  porNicho: { nicho: string; total: number }[]
  porRota: { rota: Rota; total: number }[]
  porPilar: { pilar: Pilar; total: number }[]
  funil: { raioX: number; cliquesSala: number; cliquesWhatsApp: number }
}
