import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  adminAtualizarStatus,
  adminDashboard,
  adminEntrar,
  adminListarLeads,
  adminObterConfig,
  adminSalvarConfig,
  exportarCsv,
} from '../lib/api'
import { modoDemo } from '../lib/supabase'
import { ROTULO_FATURAMENTO, ROTULO_MOMENTO, ROTULO_ROTA } from '../lib/rota'
import { ROTULO_PILAR } from '../lib/pilares'
import type { Config, DashboardDados, Lead, LeadStatus, Pilar, Rota } from '../lib/types'
import { Cabecalho, Rodape } from '../components/comum'

const ROTULO_STATUS: Record<LeadStatus, string> = {
  novo: 'Novo',
  foi_pra_sala: 'Foi pra Sala',
  virou_sessao: 'Virou sessão',
}

const COR_ROTA: Record<Rota, string> = {
  mapeamento: 'bg-primary/10 text-primary',
  academia: 'bg-gold-soft/60 text-gold-deep',
  mnia: 'bg-gold/20 text-gold-deep',
}

function BadgeRota({ rota, momento, faturamento }: { rota: Rota; momento: string; faturamento: string }) {
  return (
    <span
      title={`${momento} · ${faturamento}`}
      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${COR_ROTA[rota]}`}
    >
      {ROTULO_ROTA[rota]}
    </span>
  )
}

type Aba = 'leads' | 'config' | 'dashboard'

export default function Admin() {
  const [senha, setSenha] = useState('')
  const [autenticada, setAutenticada] = useState(false)
  const [erroLogin, setErroLogin] = useState<string | null>(null)
  const [aba, setAba] = useState<Aba>('leads')

  const [leads, setLeads] = useState<Lead[]>([])
  const [config, setConfig] = useState<Config | null>(null)
  const [dashboard, setDashboard] = useState<DashboardDados | null>(null)
  const [salvandoConfig, setSalvandoConfig] = useState(false)
  const [configSalva, setConfigSalva] = useState(false)

  const carregarTudo = useCallback(async (s: string) => {
    const [ls, cf, db] = await Promise.all([
      adminListarLeads(s),
      adminObterConfig(s),
      adminDashboard(s),
    ])
    setLeads(ls)
    setConfig(cf)
    setDashboard(db)
  }, [])

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setErroLogin(null)
    const ok = await adminEntrar(senha)
    if (!ok) {
      setErroLogin('Senha incorreta.')
      return
    }
    setAutenticada(true)
    void carregarTudo(senha)
  }

  useEffect(() => {
    if (autenticada) void carregarTudo(senha)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba])

  async function mudarStatus(leadId: string, status: LeadStatus) {
    setLeads((ls) => ls.map((l) => (l.id === leadId ? { ...l, status } : l)))
    await adminAtualizarStatus(senha, leadId, status)
  }

  function baixarCsv() {
    const csv = exportarCsv(leads)
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-raio-x-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function salvarConfig(e: React.FormEvent) {
    e.preventDefault()
    if (!config) return
    setSalvandoConfig(true)
    await adminSalvarConfig(senha, config)
    setSalvandoConfig(false)
    setConfigSalva(true)
    setTimeout(() => setConfigSalva(false), 2500)
  }

  if (!autenticada) {
    return (
      <div className="min-h-screen">
        <Cabecalho />
        <main className="mx-auto max-w-sm px-6 py-24">
          <form onSubmit={entrar} className="cartao p-8 text-center">
            <h1 className="text-3xl font-semibold">Admin</h1>
            <p className="mt-2 text-sm text-primary/60">Área da equipe da Ana</p>
            <input type="password" className="campo mt-6" placeholder="Senha" value={senha}
              onChange={(e) => setSenha(e.target.value)} autoFocus />
            {modoDemo && (
              <p className="mt-2 text-xs text-primary/50">Modo demonstração — senha: salasecreta</p>
            )}
            {erroLogin && <p className="mt-3 text-sm text-gold-deep">{erroLogin}</p>}
            <button type="submit" className="botao-dourado mt-6 w-full">Entrar</button>
          </form>
        </main>
        <Rodape />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Cabecalho />
      <main className="mx-auto max-w-5xl px-6 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl font-semibold">Painel do Raio-X</h1>
          <nav className="flex gap-2 rounded-full border border-gold/30 bg-card p-1">
            {(['leads', 'config', 'dashboard'] as Aba[]).map((a) => (
              <button key={a} onClick={() => setAba(a)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  aba === a ? 'bg-gradient-gold text-gold-foreground shadow-gold' : 'text-primary/60 hover:text-primary'
                }`}>
                {a === 'leads' ? 'Leads' : a === 'config' ? 'Sala Secreta' : 'Dashboard'}
              </button>
            ))}
          </nav>
        </div>

        {aba === 'leads' && (
          <section className="cartao mt-8 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gold/20 px-6 py-4">
              <p className="text-sm text-primary/60">{leads.length} leads</p>
              <button onClick={baixarCsv}
                className="rounded-full border border-gold/50 px-4 py-2 text-sm font-medium text-primary transition hover:bg-gold-soft/30">
                ⬇ Exportar CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gold/20 text-xs uppercase tracking-wide text-primary/50">
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-4 py-3">WhatsApp</th>
                    <th className="px-4 py-3">@</th>
                    <th className="px-4 py-3">Nicho</th>
                    <th className="px-4 py-3">Pilar</th>
                    <th className="px-4 py-3">Oferta</th>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Relatório</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b border-gold/10 hover:bg-gold-soft/10">
                      <td className="px-6 py-3 font-medium">{l.nome}</td>
                      <td className="px-4 py-3">{l.whatsapp}</td>
                      <td className="px-4 py-3">{l.instagram}</td>
                      <td className="px-4 py-3">{l.nicho}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-primary/80">
                        {ROTULO_PILAR[l.pilar] ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <BadgeRota
                          rota={l.rota}
                          momento={ROTULO_MOMENTO[l.momento] ?? l.momento}
                          faturamento={ROTULO_FATURAMENTO[l.faturamento] ?? l.faturamento}
                        />
                      </td>
                      <td className="px-4 py-3">{new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3">
                        {l.relatorio_id ? (
                          <Link to={`/relatorio/${l.relatorio_id}`} className="text-gold-deep underline underline-offset-2" target="_blank">
                            abrir ↗
                          </Link>
                        ) : (
                          <span className="text-primary/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select value={l.status}
                          onChange={(e) => mudarStatus(l.id, e.target.value as LeadStatus)}
                          className="rounded-lg border border-gold/40 bg-card px-2 py-1.5 text-sm">
                          {(Object.keys(ROTULO_STATUS) as LeadStatus[]).map((s) => (
                            <option key={s} value={s}>{ROTULO_STATUS[s]}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {aba === 'config' && config && (
          <form onSubmit={salvarConfig} className="cartao mt-8 space-y-6 p-8">
            <h2 className="text-2xl font-semibold">Sala Secreta desta semana</h2>
            <div>
              <label htmlFor="dia" className="rotulo">Dia e hora</label>
              <input id="dia" className="campo" value={config.sala_dia_hora}
                onChange={(e) => setConfig({ ...config, sala_dia_hora: e.target.value })} />
            </div>
            <div>
              <label htmlFor="link" className="rotulo">Link de inscrição</label>
              <input id="link" className="campo" type="url" value={config.sala_link}
                onChange={(e) => setConfig({ ...config, sala_link: e.target.value })} />
            </div>
            <div>
              <label htmlFor="convite" className="rotulo">Texto do convite (aparece no relatório)</label>
              <textarea id="convite" className="campo min-h-32" value={config.convite_texto}
                onChange={(e) => setConfig({ ...config, convite_texto: e.target.value })} />
            </div>
            <button type="submit" disabled={salvandoConfig} className="botao-dourado">
              {configSalva ? 'Salvo! ✦' : salvandoConfig ? 'Salvando…' : 'Salvar configuração'}
            </button>
          </form>
        )}

        {aba === 'dashboard' && dashboard && (
          <section className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="cartao p-6 text-center">
                <p className="text-sm text-primary/60">Raio-X esta semana</p>
                <p className="mt-2 font-display text-5xl font-semibold text-gold-deep">{dashboard.totalSemana}</p>
              </div>
              <div className="cartao p-6 text-center">
                <p className="text-sm text-primary/60">Raio-X no total</p>
                <p className="mt-2 font-display text-5xl font-semibold text-gold-deep">{dashboard.totalGeral}</p>
              </div>
              <div className="cartao p-6 text-center">
                <p className="text-sm text-primary/60">Cliques na Sala Secreta</p>
                <p className="mt-2 font-display text-5xl font-semibold text-gold-deep">{dashboard.funil.cliquesSala}</p>
              </div>
            </div>

            <div className="cartao p-6">
              <h3 className="text-xl font-semibold">Por oferta (pós-Sala Secreta)</h3>
              <p className="mt-1 text-xs text-primary/50">
                Transição de carreira → Academia · Empresária até R$ 5 mil/mês → MNIA · Demais → mapeamento da mentoria
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {(['mapeamento', 'academia', 'mnia'] as Rota[]).map((r) => {
                  const total = dashboard.porRota.find((x) => x.rota === r)?.total ?? 0
                  return (
                    <div key={r} className="rounded-xl bg-gold-soft/20 p-4 text-center">
                      <p className="text-sm text-primary/70">{ROTULO_ROTA[r]}</p>
                      <p className="mt-1 font-display text-4xl font-semibold text-gold-deep">{total}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="cartao p-6">
              <h3 className="text-xl font-semibold">Por pilar de dor (teste da Etapa 1)</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-4">
                {(['vendas', 'clareza', 'autoridade', 'tempo'] as Pilar[]).map((p) => {
                  const total = dashboard.porPilar?.find((x) => x.pilar === p)?.total ?? 0
                  return (
                    <div key={p} className="rounded-xl bg-gold-soft/20 p-4 text-center">
                      <p className="text-sm text-primary/70">{ROTULO_PILAR[p]}</p>
                      <p className="mt-1 font-display text-4xl font-semibold text-gold-deep">{total}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="cartao p-6">
                <h3 className="text-xl font-semibold">Por nicho</h3>
                <ul className="mt-4 space-y-3">
                  {dashboard.porNicho.map((n) => {
                    const max = Math.max(...dashboard.porNicho.map((x) => x.total), 1)
                    return (
                      <li key={n.nicho}>
                        <div className="flex justify-between text-sm">
                          <span>{n.nicho}</span>
                          <span className="text-primary/60">{n.total}</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-gold-soft/40">
                          <div className="h-2 rounded-full bg-gradient-gold" style={{ width: `${(n.total / max) * 100}%` }} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="cartao p-6">
                <h3 className="text-xl font-semibold">Funil</h3>
                <ul className="mt-4 space-y-4">
                  {[
                    { rotulo: 'Raio-X feitos', valor: dashboard.funil.raioX },
                    { rotulo: 'Cliques no botão da Sala', valor: dashboard.funil.cliquesSala },
                    { rotulo: 'Resumos pedidos no WhatsApp', valor: dashboard.funil.cliquesWhatsApp },
                  ].map((etapa, i, arr) => {
                    const base = arr[0].valor || 1
                    return (
                      <li key={etapa.rotulo}>
                        <div className="flex justify-between text-sm">
                          <span>{etapa.rotulo}</span>
                          <span className="text-primary/60">
                            {etapa.valor}{i > 0 && ` · ${Math.round((etapa.valor / base) * 100)}%`}
                          </span>
                        </div>
                        <div className="mt-1 h-3 rounded-full bg-gold-soft/40">
                          <div className="h-3 rounded-full bg-gradient-gold" style={{ width: `${(etapa.valor / base) * 100}%` }} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>
      <Rodape />
    </div>
  )
}
