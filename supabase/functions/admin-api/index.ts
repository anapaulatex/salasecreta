// Edge Function: admin-api
// Todas as operações do painel /admin passam por aqui, protegidas por senha.
//
// Secrets necessários (supabase secrets set):
//   ADMIN_SENHA=uma-senha-forte

import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { senha, acao, payload } = await req.json()

    if (!senha || senha !== Deno.env.get('ADMIN_SENHA')) {
      return json({ erro: 'Senha incorreta' }, 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    switch (acao) {
      case 'ping':
        return json({ ok: true })

      case 'listar_leads': {
        const { data, error } = await supabase
          .from('leads')
          .select('id, nome, whatsapp, instagram, nicho, momento, faturamento, pilar, rota, status, created_at, relatorios (id)')
          .order('created_at', { ascending: false })
        if (error) throw error
        const leads = (data ?? []).map((l) => ({
          id: l.id,
          nome: l.nome,
          whatsapp: l.whatsapp,
          instagram: l.instagram,
          nicho: l.nicho,
          momento: l.momento,
          faturamento: l.faturamento,
          pilar: l.pilar,
          rota: l.rota,
          status: l.status,
          created_at: l.created_at,
          relatorio_id: l.relatorios?.[0]?.id ?? null,
        }))
        return json({ leads })
      }

      case 'atualizar_status': {
        const { lead_id, status } = payload ?? {}
        if (!['novo', 'foi_pra_sala', 'virou_sessao'].includes(status)) {
          return json({ erro: 'Status inválido' }, 400)
        }
        const { error } = await supabase.from('leads').update({ status }).eq('id', lead_id)
        if (error) throw error
        return json({ ok: true })
      }

      case 'obter_config': {
        const { data, error } = await supabase.from('config').select('*').eq('id', 1).single()
        if (error) throw error
        return json({
          config: {
            sala_dia_hora: data.sala_dia_hora,
            sala_link: data.sala_link,
            convite_texto: data.convite_texto,
            academia_link: data.academia_link,
            mnia_link: data.mnia_link,
          },
        })
      }

      case 'salvar_config': {
        const { sala_dia_hora, sala_link, convite_texto, academia_link, mnia_link } = payload ?? {}
        const { error } = await supabase
          .from('config')
          .update({ sala_dia_hora, sala_link, convite_texto, academia_link, mnia_link, updated_at: new Date().toISOString() })
          .eq('id', 1)
        if (error) throw error
        return json({ ok: true })
      }

      case 'dashboard': {
        const umaSemanaAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        const [{ data: leads }, { data: eventos }] = await Promise.all([
          supabase.from('leads').select('nicho, rota, pilar, created_at'),
          supabase.from('eventos').select('tipo'),
        ])
        const todos = leads ?? []
        const porNicho = new Map<string, number>()
        for (const l of todos) porNicho.set(l.nicho, (porNicho.get(l.nicho) ?? 0) + 1)
        const porRota = new Map<string, number>()
        for (const l of todos) porRota.set(l.rota, (porRota.get(l.rota) ?? 0) + 1)
        const porPilar = new Map<string, number>()
        for (const l of todos) porPilar.set(l.pilar ?? 'vendas', (porPilar.get(l.pilar ?? 'vendas') ?? 0) + 1)
        return json({
          dashboard: {
            totalSemana: todos.filter((l) => l.created_at > umaSemanaAtras).length,
            totalGeral: todos.length,
            porNicho: [...porNicho.entries()]
              .map(([nicho, total]) => ({ nicho, total }))
              .sort((a, b) => b.total - a.total),
            porRota: [...porRota.entries()]
              .map(([rota, total]) => ({ rota, total }))
              .sort((a, b) => b.total - a.total),
            porPilar: [...porPilar.entries()]
              .map(([pilar, total]) => ({ pilar, total }))
              .sort((a, b) => b.total - a.total),
            funil: {
              raioX: todos.length,
              cliquesSala: (eventos ?? []).filter((e) => e.tipo === 'clique_sala').length,
              cliquesOferta: (eventos ?? []).filter((e) => e.tipo === 'clique_oferta').length,
            },
          },
        })
      }

      default:
        return json({ erro: 'Ação desconhecida' }, 400)
    }
  } catch (erro) {
    console.error('admin-api:', erro)
    return json({ erro: erro instanceof Error ? erro.message : 'Erro no servidor' }, 500)
  }
})
