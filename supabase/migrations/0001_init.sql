-- Raio-X do Instagram — esquema inicial
-- Rodar com: supabase db push (ou colar no SQL Editor do painel)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text not null,
  instagram text not null,
  nicho text not null,
  consentimento boolean not null default false,
  imagens text[] not null default '{}',
  status text not null default 'novo' check (status in ('novo', 'foi_pra_sala', 'virou_sessao')),
  created_at timestamptz not null default now()
);

create table public.relatorios (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  dados jsonb,
  status text not null default 'pendente' check (status in ('pendente', 'pronto', 'erro')),
  created_at timestamptz not null default now()
);

create table public.config (
  id int primary key default 1 check (id = 1),
  sala_dia_hora text not null default 'Quarta-feira, às 18h (horário de Brasília)',
  sala_link text not null default 'https://lucrocomia.com.br/sala-secreta',
  convite_texto text not null default 'Você acabou de ver o diagnóstico e a direção. Na Sala Secreta desta semana eu mostro AO VIVO como especialistas como você estão fazendo essa virada com Inteligência Artificial — no nicho delas, do jeito delas.',
  updated_at timestamptz not null default now()
);

insert into public.config (id) values (1);

create table public.eventos (
  id uuid primary key default gen_random_uuid(),
  relatorio_id uuid not null references public.relatorios (id) on delete cascade,
  tipo text not null check (tipo in ('clique_sala', 'clique_whatsapp')),
  created_at timestamptz not null default now()
);

create index leads_created_at_idx on public.leads (created_at desc);
create index relatorios_lead_id_idx on public.relatorios (lead_id);
create index eventos_relatorio_id_idx on public.eventos (relatorio_id);

-- ---------------------------------------------------------------------------
-- Storage: bucket privado pros prints
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('prints', 'prints', false);

-- Público (anon) pode SUBIR prints, mas nunca ler os dos outros:
create policy "upload de prints pelo funil"
  on storage.objects for insert to anon
  with check (bucket_id = 'prints');

-- ---------------------------------------------------------------------------
-- RLS: público só insere lead; leitura de relatório só via função pelo uuid
-- ---------------------------------------------------------------------------

alter table public.leads enable row level security;
alter table public.relatorios enable row level security;
alter table public.config enable row level security;
alter table public.eventos enable row level security;

create policy "funil insere lead" on public.leads
  for insert to anon with check (consentimento = true);

create policy "funil atualiza imagens do proprio envio" on public.leads
  for update to anon using (true) with check (true);

-- Config é pública pra leitura (dia/hora e link da Sala aparecem no relatório)
create policy "config publica" on public.config
  for select to anon using (true);

-- Nenhuma policy de select em leads/relatorios/eventos: acesso só via funções.

-- Busca um relatório pelo uuid (o uuid é o segredo do link — sem listagem)
create or replace function public.obter_relatorio(relatorio_id uuid)
returns table (id uuid, dados jsonb, nome text, nicho text, status text, created_at timestamptz)
language sql security definer set search_path = public as $$
  select r.id, r.dados, l.nome, l.nicho, r.status, r.created_at
  from relatorios r
  join leads l on l.id = r.lead_id
  where r.id = relatorio_id and r.status = 'pronto'
$$;

-- Registra clique no funil (só grava, nunca lê)
create or replace function public.registrar_evento(relatorio_id uuid, tipo_evento text)
returns void
language sql security definer set search_path = public as $$
  insert into eventos (relatorio_id, tipo)
  select relatorio_id, tipo_evento
  where tipo_evento in ('clique_sala', 'clique_whatsapp')
    and exists (select 1 from relatorios r where r.id = relatorio_id)
$$;

grant execute on function public.obter_relatorio(uuid) to anon;
grant execute on function public.registrar_evento(uuid, text) to anon;
