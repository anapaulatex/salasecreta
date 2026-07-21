import type { Pilar } from './types'

/**
 * Teste dos pilares (Etapa 1 do Raio-X) — 4 perguntas de clique rápido.
 * Cada opção pontua um pilar; o pilar com mais pontos é a dor dominante.
 * Mapeia nas fases do método da Ana: Clareza (F1), Tempo (F2),
 * Autoridade (F3), Vendas & Escala (F4-5).
 */

export interface OpcaoTeste {
  pilar: Pilar
  texto: string
}

export interface PerguntaTeste {
  pergunta: string
  opcoes: OpcaoTeste[]
}

export const PERGUNTAS_TESTE: PerguntaTeste[] = [
  {
    pergunta: 'O que mais te trava hoje?',
    opcoes: [
      { pilar: 'clareza', texto: 'Não sei exatamente pra quem eu falo — meu conteúdo sai genérico' },
      { pilar: 'tempo', texto: 'Minha agenda me engole — não sobra tempo pra nada além de atender' },
      { pilar: 'autoridade', texto: 'Sou muito boa no que faço, mas no digital ninguém me vê' },
      { pilar: 'vendas', texto: 'Eu até apareço, mas isso não vira cliente pagante' },
    ],
  },
  {
    pergunta: 'Se caíssem 10 horas livres no seu colo essa semana, você usaria pra…',
    opcoes: [
      { pilar: 'clareza', texto: 'Finalmente decidir meu posicionamento e meu público' },
      { pilar: 'tempo', texto: 'Respirar — colocar em dia o que está atrasado' },
      { pilar: 'autoridade', texto: 'Produzir conteúdo e aparecer mais' },
      { pilar: 'vendas', texto: 'Criar um produto ou oferta pra vender além do atendimento' },
    ],
  },
  {
    pergunta: 'Qual frase parece mais com o seu momento?',
    opcoes: [
      { pilar: 'clareza', texto: 'Faço mil coisas e não sei qual é a minha vitrine principal' },
      { pilar: 'tempo', texto: 'Explico a mesma coisa todo dia, todo mês, todo ano' },
      { pilar: 'autoridade', texto: 'Tem gente com metade da minha experiência e o dobro da minha visibilidade' },
      { pilar: 'vendas', texto: 'Pra ganhar mais, eu teria que trabalhar mais — e não cabe' },
    ],
  },
  {
    pergunta: 'Quando você pensa em Inteligência Artificial no seu negócio, o que vem primeiro?',
    opcoes: [
      { pilar: 'clareza', texto: 'Me ajudar a organizar quem eu sou e o que eu vendo' },
      { pilar: 'tempo', texto: 'Tirar da minha frente as tarefas repetitivas' },
      { pilar: 'autoridade', texto: 'Criar conteúdo que me posicione sem me consumir' },
      { pilar: 'vendas', texto: 'Virar produto: soluções que eu possa vender de forma escalável' },
    ],
  },
]

/** Empate resolve pela prioridade comercial: vendas > clareza > autoridade > tempo */
const PRIORIDADE: Pilar[] = ['vendas', 'clareza', 'autoridade', 'tempo']

export function computarPilar(respostas: Pilar[]): Pilar {
  const pontos = new Map<Pilar, number>()
  for (const r of respostas) pontos.set(r, (pontos.get(r) ?? 0) + 1)
  let vencedor: Pilar = 'vendas'
  let melhor = -1
  for (const p of PRIORIDADE) {
    const total = pontos.get(p) ?? 0
    if (total > melhor) {
      melhor = total
      vencedor = p
    }
  }
  return vencedor
}

export const ROTULO_PILAR: Record<Pilar, string> = {
  clareza: 'Clareza',
  tempo: 'Tempo',
  autoridade: 'Autoridade',
  vendas: 'Vendas & Escala',
}

/** A dor do pilar, na língua da lead — usada no relatório e no admin */
export const DOR_PILAR: Record<Pilar, string> = {
  clareza: 'não saber exatamente pra quem fala — e sair genérica',
  tempo: 'ser engolida pela agenda e pela operação',
  autoridade: 'ser excelente no que faz e invisível no digital',
  vendas: 'depender da própria hora pra faturar — sem produto que escala',
}
