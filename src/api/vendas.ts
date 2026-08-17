import { api } from './client'
import type { Venda, VendaInput } from './types'

export function listarVendas(): Promise<Venda[]> {
  return api<Venda[]>('/api/vendas')
}

export function lancarVenda(input: VendaInput): Promise<Venda> {
  return api<Venda>('/api/vendas', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function cancelarVenda(id: number): Promise<Venda> {
  return api<Venda>(`/api/vendas/${id}/cancelar`, { method: 'POST' })
}