export interface Carga {
  id: number
  nome: string
}

export interface Vasilhame {
  id: number
  nome: string
  precoCasco: string
}

export interface Produto {
  id: number
  carga: Carga
  vasilhame: Vasilhame
  precoCusto: string
  precoVenda: string
  limiteMinimo: number
  estoqueCheios: number
  estoqueVazios: number
  ativo: boolean
}

export interface ProdutoInput {
  carga: { id: number }
  vasilhame: { id: number }
  precoCusto: string
  precoVenda: string
  limiteMinimo: number
}

export interface Fornecedor {
  id: number
  nome: string
  contato?: string
  ativo: boolean
}

export interface FornecedorInput {
  nome: string
  contato?: string
}

export interface Cliente {
  id: number
  nome: string
  telefone?: string
  endereco?: string
  ativo: boolean
}

export interface ClienteInput {
  nome: string
  telefone?: string
  endereco?: string
}

export interface CarregamentoItemInput {
  produto: { id: number }
  quantidadeCheios: number
  vaziosDevolvidos: number
  custoTotal: string
}

export interface CarregamentoInput {
  fornecedor: { id: number }
  itens: CarregamentoItemInput[]
}

export interface CarregamentoItem {
  id: number
  produto: Produto
  quantidadeCheios: number
  vaziosDevolvidos: number
  custoTotal: string
  custoUnitario: string
}

export interface Carregamento {
  id: number
  fornecedor: Fornecedor
  itens: CarregamentoItem[]
  criadoEm: string
}

export interface VendaInput {
  produto: { id: number }
  cliente?: { id: number }
  quantidade: number
  tipo: 'BALCAO' | 'ENTREGA'
  formaPagamento: string
  vasilhameNovo: boolean
}

export interface Venda {
  id: number
  produto: Produto
  cliente?: Cliente
  quantidade: number
  tipo: string
  formaPagamento: string
  valorUnitario: string
  total: string
  status: string
  vasilhameNovo: boolean
  criadoEm: string
}

export interface EstoqueProduto {
  id: number
  nome: string
  estoqueCheios: number
  estoqueVazios: number
  emRua: number
  limiteMinimo: number
  estoqueBaixo: boolean
  sugestaoReposicao: number
}

export interface VendaRelatorio {
  id: number
  dataHora: string
  produto: string
  quantidade: number
  valorUnitario: string
  total: string
  formaPagamento: string
  tipo: string
  status: string
}

export interface CarregamentoRelatorio {
  data: string
  fornecedor: string
  produto: string
  quantidadeCheios: number
  vaziosDevolvidos: number
  custoTotal: string
  custoUnitario: string
}

export interface BalancoProduto {
  produtoId: number
  produto: string
  estoqueInicial: number
  entradas: number
  saidas: number
  estoqueFinal: number
  vaziosPatio: number
  emRua: number
}

export interface ResumoDia {
  totalFaturado: string
  totalPorPagamento: Record<string, string>
  unidadesPorProduto: Record<string, number>
  alertasEstoqueBaixo: EstoqueProduto[]
}

export interface Configuracao {
  id: number
  chave: string
  valor: string
}

export const FORMAS_PAGAMENTO = [
  { valor: 'DINHEIRO', rotulo: 'Dinheiro' },
  { valor: 'PIX', rotulo: 'PIX' },
  { valor: 'CARTAO_CREDITO', rotulo: 'Cartao (credito/debito)' },
  { valor: 'FIADO', rotulo: 'Fiado' },
] as const

export const CONFIG_FORMAS_PAGAMENTO = [
  { chave: 'pagamento_DINHEIRO', rotulo: 'Dinheiro' },
  { chave: 'pagamento_PIX', rotulo: 'PIX' },
  { chave: 'pagamento_CARTAO', rotulo: 'Cartao (credito/debito)' },
  { chave: 'pagamento_FIADO', rotulo: 'Fiado' },
] as const

export const TIPOS_VENDA = [
  { valor: 'BALCAO', rotulo: 'Balcao' },
  { valor: 'ENTREGA', rotulo: 'Entrega' },
] as const