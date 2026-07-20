import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obterConfig, obterRelatorio, registrarEvento, resumoWhatsApp } from '../lib/api'
import { configPadrao } from '../lib/demoData'
import type { Config, Relatorio as RelatorioTipo } from '../lib/types'
import { Cabecalho, NotaBolinhas, Rodape, SeparadorDourado } from '../components/comum'

export default function Relatorio() {
  const { id } = useParams<{ id: string }>()
  const [relatorio, setRelatorio] = useState<RelatorioTipo | null>(null)
  const [config, setConfig] = useState<Config>(configPadrao)
  const [carregando, setCarregando] = useState(true)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([obterRelatorio(id), obterConfig()])
      .then(([r, c]) => {
        setRelatorio(r)
        setConfig(c)
      })
      .finally(() => setCarregando(false))
  }, [id])

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="animate-pulse font-display text-3xl text-gold">✦</span>
      </div>
    )
  }

  if (!relatorio) {
    return (
      <div className="min-h-screen">
        <Cabecalho />
        <main className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="text-3xl font-semibold">Não encontrei esse relatório</h1>
          <p className="mt-4 text-primary/70">
            O link pode estar incompleto. Se você acabou de fazer o seu raio-x, confere o link que
            recebeu — ou faz um novo, leva 2 minutos.
          </p>
          <Link to="/raio-x" className="botao-dourado mt-8">Fazer meu Raio-X</Link>
        </main>
        <Rodape />
      </div>
    )
  }

  const d = relatorio.dados

  // Print ilegível ou não é um perfil → pedido carinhoso de reenvio
  if (d.tipo === 'reenvio') {
    return (
      <div className="min-h-screen">
        <Cabecalho />
        <main className="mx-auto max-w-xl px-6 py-20 text-center">
          <span className="text-4xl">💜</span>
          <h1 className="mt-4 text-3xl font-semibold">Preciso de um novo print</h1>
          <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-primary/80">
            {d.mensagemReenvio}
          </p>
          <Link to="/raio-x" className="botao-dourado mt-10">Enviar de novo ✦</Link>
        </main>
        <Rodape />
      </div>
    )
  }

  const partesNome = relatorio.nome.trim().split(/\s+/)
  const primeiroNome =
    partesNome.find((p) => !/^(dr|dra|sr|sra|prof|profa)\.?$/i.test(p)) ?? partesNome[0]

  async function copiarBio() {
    await navigator.clipboard.writeText(d.bioSugerida)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  function abrirSala() {
    void registrarEvento(relatorio!.id, 'clique_sala')
    window.open(config.sala_link, '_blank', 'noopener')
  }

  function receberWhatsApp() {
    void registrarEvento(relatorio!.id, 'clique_whatsapp')
    const texto = encodeURIComponent(resumoWhatsApp(relatorio!, config))
    window.open(`https://wa.me/?text=${texto}`, '_blank', 'noopener')
  }

  return (
    <div className="min-h-screen">
      <Cabecalho />
      <main className="mx-auto max-w-3xl px-6 pb-10">
        {/* Abertura */}
        <section className="pt-6 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-gold-deep">✦ Raio-X do Instagram ✦</p>
          <h1 className="mt-4 text-4xl font-semibold md:text-5xl">{primeiroNome}, aqui está o seu diagnóstico</h1>
          <p className="mx-auto mt-6 max-w-2xl text-left text-lg leading-relaxed text-primary/80 md:text-center">
            {d.reconhecimento}
          </p>
        </section>

        <SeparadorDourado texto="parte 1 · o diagnóstico" />

        {/* Parte 1 — Eixos */}
        <section className="space-y-6">
          {d.eixos.map((eixo) => (
            <article key={eixo.chave} className="cartao p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-3xl font-semibold">{eixo.titulo}</h2>
                <NotaBolinhas nota={eixo.nota} />
              </div>
              <p className="mt-4 leading-relaxed text-primary/80">{eixo.observado}</p>
              <p className="mt-4 rounded-xl bg-gold-soft/30 px-5 py-4 text-sm leading-relaxed text-primary">
                <span className="font-semibold text-gold-deep">Por que isso importa: </span>
                {eixo.porQueImporta}
              </p>
            </article>
          ))}
        </section>

        <SeparadorDourado texto="parte 2 · como deveria ser" />

        {/* Bio sugerida */}
        <section className="cartao p-8">
          <h2 className="text-3xl font-semibold">Sua bio, reescrita</h2>
          <p className="mt-2 text-sm text-primary/60">
            Escrita pra sua especialidade e pro seu público. É só copiar e colar.
          </p>
          <pre className="mt-5 whitespace-pre-wrap rounded-xl border border-gold/30 bg-gold-soft/20 p-5 font-sans leading-relaxed text-primary">
            {d.bioSugerida}
          </pre>
          <button onClick={copiarBio} className="botao-dourado mt-5">
            {copiado ? 'Copiada! ✦' : 'Copiar minha bio nova'}
          </button>
        </section>

        {/* Virada de categoria — o clímax */}
        <section className="mt-8 rounded-2xl bg-primary p-10 shadow-gold-lg">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">✦ a virada de categoria</p>
          <h2 className="mt-3 text-3xl font-semibold text-primary-foreground md:text-4xl">
            A cadeira que está vazia no seu mercado
          </h2>
          <p className="mt-6 font-display text-xl italic leading-relaxed text-primary-foreground/90 md:text-2xl">
            {d.viradaDeCategoria}
          </p>
        </section>

        {/* Ideias de conteúdo */}
        <section className="mt-8">
          <h2 className="text-center text-3xl font-semibold">
            3 conteúdos pros seus clientes de maior potencial
          </h2>
          <p className="mt-2 text-center text-sm text-primary/60">
            Não pro seguidor curioso — pra quem pode te contratar.
          </p>
          <div className="mt-6 space-y-5">
            {d.ideias.map((ideia, i) => (
              <article key={i} className="cartao p-7">
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-gold font-display text-lg font-semibold text-gold-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-2xl font-semibold">{ideia.titulo}</h3>
                    <p className="mt-3 rounded-xl bg-gold-soft/25 px-4 py-3 text-sm italic leading-relaxed text-primary/90">
                      Gancho pronto: "{ideia.gancho}"
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-primary/60">{ideia.porQue}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <SeparadorDourado texto="parte 3 · o próximo passo" />

        {/* Ponte pra Sala Secreta */}
        <section className="cartao overflow-hidden">
          <div className="bg-gold-soft/30 px-8 py-10 text-center md:px-12">
            <span className="text-3xl">✦</span>
            <h2 className="mt-3 text-4xl font-semibold">Sala Secreta</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-primary/80">
              {config.convite_texto}
            </p>
            <p className="mt-6 font-display text-2xl font-semibold text-gold-deep">
              🗓 {config.sala_dia_hora}
            </p>
            <button onClick={abrirSala} className="botao-dourado mt-8 px-12 text-lg">
              Garantir minha vaga na Sala Secreta ✦
            </button>
            <p className="mt-3 text-xs text-primary/50">Ao vivo, no Zoom · vagas limitadas da semana</p>
          </div>
          <div className="border-t border-gold/25 px-8 py-6 text-center">
            <p className="text-sm text-primary/70">Quer guardar esse diagnóstico?</p>
            <button onClick={receberWhatsApp}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-gold/50 bg-card px-6 py-3 font-medium text-primary transition hover:bg-gold-soft/30">
              💬 Receber o resumo no WhatsApp
            </button>
          </div>
        </section>
      </main>
      <Rodape />
    </div>
  )
}
