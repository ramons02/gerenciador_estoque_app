export interface Carga {
  id: number
  nome: string
}

export interface Vasilhame {
  id: number
  nome: string
}

export interface Produto {
  id: number
  carga: Carga
  vasilhame: Vasilhame
  precoCusto: string
  precoVenda: string
  limiteMinimo: number
  ativo: boolean
}

export interface ProdutoInput {
  carga: { id: number }
  vasilhame: { id: number }
  precoCusto: string
  precoVenda: string
  limiteMinimo: number
}