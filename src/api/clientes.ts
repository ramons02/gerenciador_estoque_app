import { api } from './client'
import type { Cliente, ClienteInput } from './types'

export function listarClientes(termo?: string): Promise<Cliente[]> {
  const query = termo && termo.trim() ? `?q=${encodeURIComponent(termo.trim())}` : ''
  return api<Cliente[]>(`/api/clientes${query}`)
}

export function criarCliente(input: ClienteInput): Promise<Cliente> {
  return api<Cliente>('/api/clientes', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function atualizarCliente(id: number, input: ClienteInput): Promise<Cliente> {
  return api<Cliente>(`/api/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}