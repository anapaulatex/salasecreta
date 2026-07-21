-- Parte 3 roteada: Academia (transição/sem nada definido), MNIA (empresa que
-- quer automatizar) ou Sala Secreta → mapeamento. Sai o botão de WhatsApp.

alter table public.config
  add column academia_link text not null default 'https://lucrocomia.com.br/academia',
  add column mnia_link text not null default 'https://lucrocomia.com.br/mnia';

alter table public.eventos drop constraint eventos_tipo_check;
alter table public.eventos
  add constraint eventos_tipo_check
  check (tipo in ('clique_sala', 'clique_whatsapp', 'clique_oferta'));

create or replace function public.registrar_evento(relatorio_id uuid, tipo_evento text)
returns void
language sql security definer set search_path = public as $$
  insert into eventos (relatorio_id, tipo)
  select relatorio_id, tipo_evento
  where tipo_evento in ('clique_sala', 'clique_oferta')
    and exists (select 1 from relatorios r where r.id = relatorio_id)
$$;
