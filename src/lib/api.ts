import { modoDemo, supabase } from './supabase'
import {
  configPadrao,
  dashboardExemplo,
  leadsExemplo,
  relatorioExemplo,
  relatorioExemploCompleto,
} from './demoData'
import { classificarRota, ROTULO_FATURAMENTO, ROTULO_MOMENTO, ROTULO_ROTA } from './rota'
import { ROTULO_PILAR } from './pilares'
import type {
  Config,
  DashboardDados,
  Faturamento,
  Lead,
  LeadStatus,
  Momento,
  Origem,
  Pilar,
  Relatorio,
  RelatorioDados,
  Rota,
} from './types'

// ---------------------------------------------------------------------------
// Modo demonstração: tudo em localStorage, sem backend e sem gastar análise.
// ---------------------------------------------------------------------------

const LS_LEADS = 'raiox_demo_leads'
const LS_LINK_USOS = 'raiox_demo_link_usos'
const LS_RELATORIOS = 'raiox_demo_relatorios'
const LS_CONFIG = 'raiox_demo_config'
const LS_EVENTOS = 'raiox_demo_eventos'

function lsLer<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave)
    return bruto ? (JSON.parse(bruto) as T) : padrao
  } catch {
    return padrao
  }
}

function lsSalvar(chave: string, valor: unknown) {
  localStorage.setItem(chave, JSON.stringify(valor))
}

function uuid(): string {
  return crypto.randomUUID()
}

// ---------------------------------------------------------------------------
// Envio do Raio-X
// ---------------------------------------------------------------------------

export interface EnvioRaioX {
  nome: string
  whatsapp: string
  instagram: string
  nicho: string
  momento: Momento
  faturamento: Faturamento
  pilar: Pilar
  origem: Origem
  imagens: File[]
}

/** Normaliza @/link pro nome de usuário puro, em minúsculas. */
export function extrairHandle(entrada: string): string {
  return entrada
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/[/?#].*$/, '')
    .replace(/^@/, '')
    .toLowerCase()
}

export const MENSAGEM_LIMITE_LINK =
  'Você já usou as 2 análises pelo link desse perfil. Mas relaxa: me envia o print do seu perfil que o raio-x sai igualzinho. 😉'

/** Envia o formulário + prints e dispara a análise. Retorna o id do relatório. */
export async function enviarRaioX(envio: EnvioRaioX): Promise<string> {
  if (modoDemo || !supabase) {
    // Limite de 2 análises pelo link por perfil (no modo real, o servidor confere no banco)
    if (envio.origem === 'link') {
      const usos = lsLer<Record<string, number>>(LS_LINK_USOS, {})
      const handle = extrairHandle(envio.instagram)
      if ((usos[handle] ?? 0) >= 2) throw new Error(MENSAGEM_LIMITE_LINK)
      usos[handle] = (usos[handle] ?? 0) + 1
      lsSalvar(LS_LINK_USOS, usos)
    }
    // Simula o tempo da análise e gera um relatório de exemplo personalizado com o nome/nicho.
    await new Promise((r) => setTimeout(r, 6500))
    const relatorioId = uuid()
    const primeiroNome = envio.nome.trim().split(/\s+/)[0]
    const dados: RelatorioDados = {
      ...relatorioExemplo,
      reconhecimento: relatorioExemplo.reconhecimento.replace('Camila', primeiroNome),
      pilar: envio.pilar,
    }
    const relatorios = lsLer<Record<string, Relatorio>>(LS_RELATORIOS, {})
    relatorios[relatorioId] = {
      id: relatorioId,
      dados,
      nome: envio.nome,
      nicho: envio.nicho,
      status: 'pronto',
      created_at: new Date().toISOString(),
    }
    lsSalvar(LS_RELATORIOS, relatorios)

    const leads = lsLer<Lead[]>(LS_LEADS, [...leadsExemplo])
    leads.unshift({
      id: uuid(),
      nome: envio.nome,
      whatsapp: envio.whatsapp,
      instagram: envio.instagram,
      nicho: envio.nicho,
      origem: envio.origem,
      momento: envio.momento,
      faturamento: envio.faturamento,
      pilar: envio.pilar,
      rota: classificarRota(envio.momento, envio.faturamento),
      status: 'novo',
      created_at: new Date().toISOString(),
      relatorio_id: relatorioId,
    })
    lsSalvar(LS_LEADS, leads)
    return relatorioId
  }

  // --- Modo real (Supabase) ---
  const { data: lead, error: erroLead } = await supabase
    .from('leads')
    .insert({
      nome: envio.nome,
      whatsapp: envio.whatsapp,
      instagram: envio.instagram,
      nicho: envio.nicho,
      origem: envio.origem,
      momento: envio.momento,
      faturamento: envio.faturamento,
      pilar: envio.pilar,
      rota: classificarRota(envio.momento, envio.faturamento),
      consentimento: true,
    })
    .select('id')
    .single()
  if (erroLead || !lead) throw new Error(erroLead?.message ?? 'Não consegui registrar o envio.')

  if (envio.origem === 'print') {
    const caminhos: string[] = []
    for (const [i, arquivo] of envio.imagens.entries()) {
      const extensao = arquivo.name.split('.').pop() ?? 'jpg'
      const caminho = `${lead.id}/${i + 1}.${extensao}`
      const { error: erroUpload } = await supabase.storage.from('prints').upload(caminho, arquivo)
      if (erroUpload) throw new Error('Não consegui enviar o print. Tenta de novo?')
      caminhos.push(caminho)
    }
    await supabase.from('leads').update({ imagens: caminhos }).eq('id', lead.id)
  }

  const { data, error } = await supabase.functions.invoke('analisar-raio-x', {
    body: { lead_id: lead.id },
  })
  if (data?.erro) throw new Error(data.erro)
  if (error || !data?.relatorio_id) {
    throw new Error('A análise não terminou. Tenta enviar de novo em instantes?')
  }
  return data.relatorio_id as string
}

// ---------------------------------------------------------------------------
// Relatório
// ---------------------------------------------------------------------------

export async function obterRelatorio(id: string): Promise<Relatorio | null> {
  if (id === 'exemplo') return relatorioExemploCompleto

  if (modoDemo || !supabase) {
    const relatorios = lsLer<Record<string, Relatorio>>(LS_RELATORIOS, {})
    return relatorios[id] ?? null
  }

  const { data, error } = await supabase.rpc('obter_relatorio', { relatorio_id: id })
  if (error || !data || data.length === 0) return null
  const linha = Array.isArray(data) ? data[0] : data
  return {
    id: linha.id,
    dados: linha.dados as RelatorioDados,
    nome: linha.nome,
    nicho: linha.nicho,
    status: linha.status,
    created_at: linha.created_at,
  }
}

export async function obterConfig(): Promise<Config> {
  if (modoDemo || !supabase) return lsLer<Config>(LS_CONFIG, configPadrao)
  const { data } = await supabase.from('config').select('*').limit(1).maybeSingle()
  if (!data) return configPadrao
  return {
    sala_dia_hora: data.sala_dia_hora,
    sala_link: data.sala_link,
    convite_texto: data.convite_texto,
  }
}

export async function registrarEvento(
  relatorioId: string,
  tipo: 'clique_sala' | 'clique_whatsapp',
): Promise<void> {
  if (modoDemo || !supabase) {
    const eventos = lsLer<{ relatorio_id: string; tipo: string; em: string }[]>(LS_EVENTOS, [])
    eventos.push({ relatorio_id: relatorioId, tipo, em: new Date().toISOString() })
    lsSalvar(LS_EVENTOS, eventos)
    return
  }
  await supabase.rpc('registrar_evento', { relatorio_id: relatorioId, tipo_evento: tipo })
}

/** Monta o resumo do relatório formatado pro WhatsApp. */
export function resumoWhatsApp(relatorio: Relatorio, config: Config): string {
  const d = relatorio.dados
  const linhas = [
    `✦ *Raio-X do Instagram — ${relatorio.nome}*`,
    '',
    ...d.eixos.map((e) => `*${e.titulo}:* ${'●'.repeat(e.nota)}${'○'.repeat(5 - e.nota)} (${e.nota}/5)`),
    '',
    `*O que a sua bio precisa dizer:*`,
    `✦ A promessa: ${d.bioDirecao?.promessa ?? d.bioSugerida ?? ''}`,
    ...(d.bioDirecao ? [`✦ Pra quem: ${d.bioDirecao.publico}`, `✦ O próximo passo: ${d.bioDirecao.chamada}`] : []),
    '',
    `*A virada:* ${d.viradaDeCategoria}`,
    '',
    `🗓 *Sala Secreta:* ${config.sala_dia_hora}`,
    `Inscrição: ${config.sala_link}`,
  ]
  return linhas.join('\n')
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

async function chamarAdmin<T>(senha: string, acao: string, payload?: unknown): Promise<T> {
  if (!supabase) throw new Error('Sem backend configurado')
  const { data, error } = await supabase.functions.invoke('admin-api', {
    body: { senha, acao, payload },
  })
  if (error) throw new Error('Não foi possível falar com o servidor.')
  if (data?.erro) throw new Error(data.erro)
  return data as T
}

const SENHA_DEMO = 'salasecreta'

export async function adminEntrar(senha: string): Promise<boolean> {
  if (modoDemo) return senha === SENHA_DEMO
  try {
    await chamarAdmin(senha, 'ping')
    return true
  } catch {
    return false
  }
}

export async function adminListarLeads(senha: string): Promise<Lead[]> {
  if (modoDemo) {
    // Backfill de leads salvos antes do roteamento de oferta existir
    return lsLer<Lead[]>(LS_LEADS, [...leadsExemplo]).map((l) => ({
      ...l,
      origem: l.origem ?? 'print',
      momento: l.momento ?? 'especialista',
      faturamento: l.faturamento ?? 'ate_5k',
      pilar: l.pilar ?? 'vendas',
      rota: l.rota ?? 'mapeamento',
    }))
  }
  const { leads } = await chamarAdmin<{ leads: Lead[] }>(senha, 'listar_leads')
  return leads
}

export async function adminAtualizarStatus(
  senha: string,
  leadId: string,
  status: LeadStatus,
): Promise<void> {
  if (modoDemo) {
    const leads = lsLer<Lead[]>(LS_LEADS, [...leadsExemplo])
    lsSalvar(
      LS_LEADS,
      leads.map((l) => (l.id === leadId ? { ...l, status } : l)),
    )
    return
  }
  await chamarAdmin(senha, 'atualizar_status', { lead_id: leadId, status })
}

export async function adminObterConfig(senha: string): Promise<Config> {
  if (modoDemo) return lsLer<Config>(LS_CONFIG, configPadrao)
  const { config } = await chamarAdmin<{ config: Config }>(senha, 'obter_config')
  return config
}

export async function adminSalvarConfig(senha: string, config: Config): Promise<void> {
  if (modoDemo) {
    lsSalvar(LS_CONFIG, config)
    return
  }
  await chamarAdmin(senha, 'salvar_config', config)
}

export async function adminDashboard(senha: string): Promise<DashboardDados> {
  if (modoDemo) {
    const leads = lsLer<Lead[]>(LS_LEADS, [...leadsExemplo])
    const eventos = lsLer<{ tipo: string }[]>(LS_EVENTOS, [])
    const umaSemanaAtras = Date.now() - 7 * 24 * 60 * 60 * 1000
    const porNicho = new Map<string, number>()
    for (const l of leads) porNicho.set(l.nicho, (porNicho.get(l.nicho) ?? 0) + 1)
    const porRota = new Map<Rota, number>()
    for (const l of leads) porRota.set(l.rota, (porRota.get(l.rota) ?? 0) + 1)
    const porPilar = new Map<Pilar, number>()
    for (const l of leads) porPilar.set(l.pilar ?? 'vendas', (porPilar.get(l.pilar ?? 'vendas') ?? 0) + 1)
    return {
      totalSemana: leads.filter((l) => new Date(l.created_at).getTime() > umaSemanaAtras).length,
      totalGeral: leads.length,
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
        raioX: leads.length,
        cliquesSala:
          eventos.filter((e) => e.tipo === 'clique_sala').length + dashboardExemplo.funil.cliquesSala,
        cliquesWhatsApp:
          eventos.filter((e) => e.tipo === 'clique_whatsapp').length +
          dashboardExemplo.funil.cliquesWhatsApp,
      },
    }
  }
  const { dashboard } = await chamarAdmin<{ dashboard: DashboardDados }>(senha, 'dashboard')
  return dashboard
}

export function exportarCsv(leads: Lead[]): string {
  const cabecalho = ['Nome', 'WhatsApp', 'Instagram', 'Nicho', 'Pilar', 'Momento', 'Faturamento', 'Oferta', 'Data', 'Status', 'Relatório']
  const linhas = leads.map((l) =>
    [
      l.nome,
      l.whatsapp,
      l.instagram,
      l.nicho,
      ROTULO_PILAR[l.pilar] ?? l.pilar ?? '',
      ROTULO_MOMENTO[l.momento] ?? l.momento,
      ROTULO_FATURAMENTO[l.faturamento] ?? l.faturamento,
      ROTULO_ROTA[l.rota] ?? l.rota,
      new Date(l.created_at).toLocaleDateString('pt-BR'),
      l.status,
      l.relatorio_id ? `${window.location.origin}/relatorio/${l.relatorio_id}` : '',
    ]
      .map((c) => `"${String(c).replaceAll('"', '""')}"`)
      .join(';'),
  )
  return [cabecalho.join(';'), ...linhas].join('\n')
}
