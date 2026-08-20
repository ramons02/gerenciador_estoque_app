import { api } from './client'
import type { Carga, Produto, ProdutoInput, Vasilhame } from './types'

export function listarCargas(): Promise<Carga[]> {
  return api<Carga[]>('/api/cargas')
}

export function criarCarga(nome: string): Promise<Carga> {
  return api<Carga>('/api/cargas', {
    method: 'POST',
    body: JSON.stringify({ nome }),
  })
}

export function listarVasilhames(): Promise<Vasilhame[]> {
  return api<Vasilhame[]>('/api/vasilhames')
}

export function criarVasilhame(nome: string, precoCasco: string): Promise<Vasilhame> {
  return api<Vasilhame>('/api/vasilhames', {
    method: 'POST',
    body: JSON.stringify({ nome, precoCasco }),
  })
}

export function atualizarVasilhame(id: number, input: { nome: string; precoCasco: string }): Promise<Vasilhame> {
  return api<Vasilhame>(`/api/vasilhames/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
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

export function atualizarLimiteMinimo(id: number, limiteMinimo: number): Promise<Produto> {
  return api<Produto>(`/api/produtos/${id}/limite-minimo`, {
    method: 'PUT',
    body: JSON.stringify({ limiteMinimo }),
  })
}