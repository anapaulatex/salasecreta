-- Roteamento de oferta pós-Sala Secreta (regra da Ana):
--   transição de carreira → Academia das Novas Profissões
--   empresária querendo Inteligência Artificial na empresa, até R$5 mil/mês → MNIA
--   demais → mapeamento da mentoria (Paraíso Digital)

alter table public.leads
  add column momento text not null default 'especialista'
    check (momento in ('especialista', 'transicao', 'empresaria')),
  add column faturamento text not null default 'ate_5k'
    check (faturamento in ('nao_faturo', 'ate_5k', 'de_5k_a_10k', 'acima_10k')),
  add column rota text not null default 'mapeamento'
    check (rota in ('academia', 'mnia', 'mapeamento'));
