import type { Faturamento, Momento, Rota } from './types'

/**
 * Roteamento de oferta (regra da Ana):
 * - Transição de carreira OU ainda sem nada definido (não fatura) → Academia das Novas Profissões
 * - Tem empresa e quer automatizar com Inteligência Artificial (até R$5 mil/mês) → MNIA
 * - Demais → Sala Secreta → mapeamento da mentoria (Paraíso Digital)
 */
export function classificarRota(momento: Momento, faturamento: Faturamento): Rota {
  if (momento === 'empresaria') {
    return faturamento === 'nao_faturo' || faturamento === 'ate_5k' ? 'mnia' : 'mapeamento'
  }
  if (momento === 'transicao' || faturamento === 'nao_faturo') return 'academia'
  return 'mapeamento'
}

export const ROTULO_ROTA: Record<Rota, string> = {
  academia: 'Academia das Novas Profissões',
  mnia: 'MNIA',
  mapeamento: 'Mapeamento (Paraíso)',
}

export const ROTULO_MOMENTO: Record<Momento, string> = {
  especialista: 'Atendo clientes como especialista',
  transicao: 'Estou em transição de carreira',
  empresaria: 'Tenho empresa e quero colocar Inteligência Artificial nela',
}

export const ROTULO_FATURAMENTO: Record<Faturamento, string> = {
  nao_faturo: 'Ainda não faturo',
  ate_5k: 'Até R$ 5 mil por mês',
  de_5k_a_10k: 'Entre R$ 5 mil e R$ 10 mil por mês',
  acima_10k: 'Acima de R$ 10 mil por mês',
}
