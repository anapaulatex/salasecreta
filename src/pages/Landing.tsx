import { Link } from 'react-router-dom'
import { Cabecalho, Rodape, SeparadorDourado } from '../components/comum'

const passos = [
  {
    numero: '1',
    titulo: 'Você envia o print',
    texto: 'Tira um print do seu perfil (bio + feed) e me conta seu nicho. Leva menos de 1 minuto — e ninguém pede senha de nada.',
  },
  {
    numero: '2',
    titulo: 'A Inteligência Artificial analisa',
    texto: 'A análise segue os critérios da Ana: bio, temas dos posts, posicionamento e caminho da venda — só com o que está visível no print.',
  },
  {
    numero: '3',
    titulo: 'Você recebe o diagnóstico + direção',
    texto: 'Relatório personalizado com nota por eixo, bio sugerida pronta pra copiar e 3 ideias de conteúdo pros seus melhores clientes.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Cabecalho />

      <main className="mx-auto max-w-5xl px-6">
        {/* Hero */}
        <section className="pt-10 pb-8 text-center md:pt-20">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-soft/30 px-4 py-1.5 text-sm text-gold-deep">
            ✦ Análise gratuita pelos critérios da Ana Tex
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            Descubra em 2 minutos por que seu Instagram ainda não te trouxe os clientes que você
            merece
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-primary/70">
            Pra especialistas com anos de experiência — médicas, advogadas, nutricionistas,
            arquitetas — cujo perfil ainda não conta a autoridade que elas já têm no consultório,
            no escritório, na vida real.
          </p>
          <div className="mt-10">
            <Link to="/raio-x" className="botao-dourado text-lg">
              Fazer meu Raio-X gratuito ✦
            </Link>
          </div>
          <p className="mt-4 text-sm text-primary/50">
            Sem senha, sem cadastro complicado — só o print do seu perfil.
          </p>
        </section>

        <SeparadorDourado texto="como funciona" />

        {/* Como funciona */}
        <section className="grid gap-6 pb-6 md:grid-cols-3">
          {passos.map((p) => (
            <div key={p.numero} className="cartao p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-gold font-display text-2xl font-semibold text-gold-foreground shadow-gold">
                {p.numero}
              </div>
              <h3 className="text-2xl font-semibold">{p.titulo}</h3>
              <p className="mt-3 text-sm leading-relaxed text-primary/70">{p.texto}</p>
            </div>
          ))}
        </section>

        {/* Reforço */}
        <section className="mt-14 rounded-2xl bg-primary px-8 py-12 text-center shadow-gold-lg">
          <p className="font-display text-2xl italic leading-relaxed text-primary-foreground md:text-3xl">
            "Bio não é currículo, é promessa. E quem fala com todo mundo
            <br className="hidden md:block" /> não é lembrada por ninguém."
          </p>
          <p className="mt-4 text-sm tracking-wide text-gold">— Ana Tex</p>
          <div className="mt-8">
            <Link to="/raio-x" className="botao-dourado">
              Quero ver o raio-x do meu perfil
            </Link>
          </div>
        </section>
      </main>

      <Rodape />
    </div>
  )
}
