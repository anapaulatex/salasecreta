import { Link } from 'react-router-dom'

export function Marca({ escura = false }: { escura?: boolean }) {
  return (
    <Link to="/" className="inline-flex items-baseline gap-2">
      <span className={`font-display text-2xl font-semibold ${escura ? 'text-primary-foreground' : 'text-primary'}`}>
        Ana Tex
      </span>
      <span className="text-gold text-lg">✦</span>
      <span className={`font-sans text-sm tracking-wide ${escura ? 'text-primary-foreground/70' : 'text-primary/60'}`}>
        Raio-X do Instagram
      </span>
    </Link>
  )
}

export function Cabecalho() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
      <Marca />
    </header>
  )
}

export function SeparadorDourado({ texto }: { texto?: string }) {
  return (
    <div className="linha-dourada my-10">
      {texto ? (
        <span className="font-display text-lg italic text-gold-deep">{texto}</span>
      ) : (
        <span aria-hidden>✦</span>
      )}
    </div>
  )
}

export function NotaBolinhas({ nota }: { nota: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`Nota ${nota} de 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-3.5 w-3.5 rounded-full transition ${
            i <= nota ? 'bg-gradient-gold shadow-gold' : 'border border-gold/50 bg-gold-soft/30'
          }`}
        />
      ))}
      <span className="ml-2 font-display text-lg text-gold-deep">{nota}/5</span>
    </div>
  )
}

export function Rodape() {
  return (
    <footer className="mt-20 border-t border-gold/25 bg-gold-soft/20">
      <div className="mx-auto max-w-5xl px-6 py-10 text-center">
        <p className="font-display text-lg text-primary">Ana Tex ✦ Sala Secreta</p>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-primary/60">
          Privacidade: a análise usa somente o print que você envia — a gente nunca pede a sua
          senha do Instagram e não acessa o seu perfil. Seus dados servem apenas pra gerar o seu
          relatório e pro contato da equipe, com o seu consentimento.
        </p>
        <p className="mt-4 text-xs text-primary/40">
          © {new Date().getFullYear()} Ana Tex · Feito com Inteligência Artificial e carinho
        </p>
      </div>
    </footer>
  )
}
