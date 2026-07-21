export type EixoChave = 'bio' | 'temas' | 'posicionamento' | 'caminho'

export interface Eixo {
  chave: EixoChave
  titulo: string
  nota: 1 | 2 | 3 | 4 | 5
  observado: string
  porQueImporta: string
}

export interface IdeiaConteudo {
  titulo: string
  gancho: string
  porQue: string
}

export interface RelatorioDados {
  tipo: 'relatorio' | 'reenvio'
  /** Preenchido quando tipo === 'reenvio': pedido carinhoso de novo print */
  mensagemReenvio?: string
  /** Abertura que reconhece o ativo — nunca começa pelo problema */
  reconhecimento: string
  eixos: Eixo[]
  bioSugerida: string
  viradaDeCategoria: string
  ideias: IdeiaConteudo[]
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
  funil: { raioX: number; cliquesSala: number; cliquesWhatsApp: number }
}
