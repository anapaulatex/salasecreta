-- Teste dos pilares (Etapa 1 do Raio-X): a dor dominante da lead,
-- mapeada nas fases do método da Ana. Calibra a análise e o mapeamento.
--   clareza (Fase 1) · tempo (Fase 2) · autoridade (Fase 3) · vendas (Fases 4-5)

alter table public.leads
  add column pilar text not null default 'vendas'
    check (pilar in ('clareza', 'tempo', 'autoridade', 'vendas'));
