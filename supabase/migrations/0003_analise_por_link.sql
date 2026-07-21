-- Análise pelo link do perfil público (coleta via Apify na Edge Function),
-- limitada a 2 análises por @ — o print continua sendo o caminho padrão.

alter table public.leads
  add column origem text not null default 'print' check (origem in ('print', 'link'));

-- Acelera a checagem do limite de análises por @
create index leads_instagram_origem_idx on public.leads (lower(instagram), origem);
