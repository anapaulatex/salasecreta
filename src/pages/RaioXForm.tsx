import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { enviarRaioX } from '../lib/api'
import { ROTULO_FATURAMENTO, ROTULO_MOMENTO } from '../lib/rota'
import type { Faturamento, Momento } from '../lib/types'
import { Cabecalho, Rodape } from '../components/comum'

const MENSAGENS_ANALISE = [
  'Lendo a sua bio com os olhos de uma cliente…',
  'Conferindo se dá pra saber a sua especialidade em 5 segundos…',
  'Olhando os temas dos seus posts — pro cliente ou pro concorrente?',
  'Procurando o caminho da venda: link, destaques, chamada…',
  'Escrevendo uma bio nova pra você copiar…',
  'Separando 3 ideias de conteúdo pros seus melhores clientes…',
  'Quase lá — caprichando no seu relatório ✦',
]

function mascaraWhatsApp(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)
  if (numeros.length <= 2) return numeros
  if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
}

function TelaAnalisando() {
  const [indice, setIndice] = useState(0)
  useEffect(() => {
    const timer = setInterval(
      () => setIndice((i) => Math.min(i + 1, MENSAGENS_ANALISE.length - 1)),
      2600,
    )
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-10 flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-gold/20 border-t-gold" style={{ animationDuration: '1.6s' }} />
        <span className="font-display text-4xl text-gold">✦</span>
      </div>
      <h1 className="text-3xl font-semibold md:text-4xl">Analisando o seu perfil…</h1>
      <p key={indice} className="mt-6 max-w-md text-lg text-primary/70 transition-opacity">
        {MENSAGENS_ANALISE[indice]}
      </p>
      <div className="mt-10 flex gap-2">
        {MENSAGENS_ANALISE.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-6 rounded-full transition ${i <= indice ? 'bg-gradient-gold' : 'bg-gold-soft'}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function RaioXForm() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('')
  const [nicho, setNicho] = useState('')
  const [momento, setMomento] = useState<Momento | ''>('')
  const [faturamento, setFaturamento] = useState<Faturamento | ''>('')
  const [consentiu, setConsentiu] = useState(false)
  const [imagens, setImagens] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const inputArquivo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const urls = imagens.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [imagens])

  function adicionarImagens(lista: FileList | null) {
    if (!lista) return
    const novas = [...imagens, ...Array.from(lista)].slice(0, 3)
    setImagens(novas)
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    if (imagens.length === 0) {
      setErro('Me envia pelo menos 1 print do seu perfil — sem ele não tem raio-x. 😉')
      return
    }
    if (!consentiu) {
      setErro('Falta marcar a autorização da análise ali embaixo.')
      return
    }
    setAnalisando(true)
    try {
      const relatorioId = await enviarRaioX({
        nome,
        whatsapp,
        instagram,
        nicho,
        momento: momento as Momento,
        faturamento: faturamento as Faturamento,
        imagens,
      })
      navigate(`/relatorio/${relatorioId}`)
    } catch (err) {
      setAnalisando(false)
      setErro(err instanceof Error ? err.message : 'Algo deu errado. Tenta de novo?')
    }
  }

  if (analisando) return <TelaAnalisando />

  return (
    <div className="min-h-screen">
      <Cabecalho />
      <main className="mx-auto max-w-2xl px-6 pb-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-semibold md:text-5xl">Me conta sobre você</h1>
          <p className="mt-4 text-primary/70">
            Preenche rapidinho e envia o print do seu perfil — a análise leva cerca de 2 minutos.
          </p>
        </div>

        <form onSubmit={enviar} className="cartao space-y-6 p-8">
          <div>
            <label htmlFor="nome" className="rotulo">Seu nome</label>
            <input id="nome" className="campo" required value={nome} placeholder="Como você quer ser chamada"
              onChange={(e) => setNome(e.target.value)} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="whatsapp" className="rotulo">WhatsApp</label>
              <input id="whatsapp" className="campo" required inputMode="tel" placeholder="(11) 99999-9999"
                value={whatsapp} onChange={(e) => setWhatsapp(mascaraWhatsApp(e.target.value))} />
            </div>
            <div>
              <label htmlFor="instagram" className="rotulo">Seu @ do Instagram</label>
              <input id="instagram" className="campo" required placeholder="@seuperfil" value={instagram}
                onChange={(e) => {
                  const v = e.target.value.trim()
                  setInstagram(v && !v.startsWith('@') ? `@${v}` : v)
                }} />
            </div>
          </div>

          <div>
            <label htmlFor="nicho" className="rotulo">Sua profissão ou nicho</label>
            <input id="nicho" className="campo" required placeholder="Ex.: nutricionista, advogada de família, arquiteta…"
              value={nicho} onChange={(e) => setNicho(e.target.value)} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="momento" className="rotulo">Seu momento agora</label>
              <select id="momento" className="campo" required value={momento}
                onChange={(e) => setMomento(e.target.value as Momento)}>
                <option value="" disabled>Escolhe o que mais parece com você</option>
                {(Object.keys(ROTULO_MOMENTO) as Momento[]).map((m) => (
                  <option key={m} value={m}>{ROTULO_MOMENTO[m]}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="faturamento" className="rotulo">Faturamento mensal hoje</label>
              <select id="faturamento" className="campo" required value={faturamento}
                onChange={(e) => setFaturamento(e.target.value as Faturamento)}>
                <option value="" disabled>Me conta sem medo — fica entre nós</option>
                {(Object.keys(ROTULO_FATURAMENTO) as Faturamento[]).map((f) => (
                  <option key={f} value={f}>{ROTULO_FATURAMENTO[f]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span className="rotulo">Print do seu perfil (bio + feed) — até 3 imagens</span>
            <input ref={inputArquivo} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => { adicionarImagens(e.target.files); e.target.value = '' }} />
            <button type="button" onClick={() => inputArquivo.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-gold/50 bg-gold-soft/20 px-4 py-8 text-center transition hover:border-gold hover:bg-gold-soft/40">
              <span className="block text-3xl">📱</span>
              <span className="mt-2 block font-medium text-primary/80">
                {imagens.length === 0 ? 'Toque pra escolher os prints' : 'Adicionar mais um print'}
              </span>
              <span className="mt-1 block text-xs text-primary/50">
                Vale a tela do perfil aberta, do jeito que uma cliente veria
              </span>
            </button>
            {previews.length > 0 && (
              <div className="mt-4 flex gap-3">
                {previews.map((url, i) => (
                  <div key={url} className="relative">
                    <img src={url} alt={`Print ${i + 1}`} className="h-28 w-20 rounded-lg border border-gold/40 object-cover" />
                    <button type="button" aria-label="Remover print"
                      onClick={() => setImagens(imagens.filter((_, j) => j !== i))}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground shadow">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-gold-soft/20 p-4 text-sm text-primary/80">
            <input type="checkbox" checked={consentiu} onChange={(e) => setConsentiu(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[hsl(32,55%,48%)]" />
            <span>
              Autorizo a análise do meu perfil e o contato da equipe da Ana Tex pelo WhatsApp
              informado.
            </span>
          </label>

          {erro && (
            <p className="rounded-xl border border-gold-deep/40 bg-gold-soft/40 px-4 py-3 text-sm text-primary">
              {erro}
            </p>
          )}

          <button type="submit" className="botao-dourado w-full text-lg">
            Analisar meu perfil agora ✦
          </button>
          <p className="text-center text-xs text-primary/50">
            A gente nunca pede a sua senha — a análise usa só o print que você enviou.
          </p>
        </form>
      </main>
      <Rodape />
    </div>
  )
}
