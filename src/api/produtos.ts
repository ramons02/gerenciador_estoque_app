import { api } from './client'
import type { Carga, Produto, ProdutoInput, Vasilhame } from './types'

export function listarCargas(): Promise<Carga[]> {
  return api<Carga[]>('/api/cargas')
}

export function listarVasilhames(): Promise<Vasilhame[]> {
  return api<Vasilhame[]>('/api/vasilhames')
}

export function listarProdutos(): Promise<Produto[]> {
  return api<Produto[]>('/api/produtos')
}

export function criarProduto(input: ProdutoInput): Promise<Produto> {
  return api<Produto>('/api/produtos', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function atualizarProduto(id: number, input: ProdutoInput): Promise<Produto> {
  return api<Produto>(`/api/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}