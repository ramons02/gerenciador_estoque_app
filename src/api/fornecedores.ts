import { api } from './client'
import type { Fornecedor, FornecedorInput } from './types'

export function listarFornecedores(): Promise<Fornecedor[]> {
  return api<Fornecedor[]>('/api/fornecedores')
}

export function criarFornecedor(input: FornecedorInput): Promise<Fornecedor> {
  return api<Fornecedor>('/api/fornecedores', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function atualizarFornecedor(id: number, input: FornecedorInput): Promise<Fornecedor> {
  return api<Fornecedor>(`/api/fornecedores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}