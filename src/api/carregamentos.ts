import { api } from './client'
import type { Carregamento, CarregamentoInput } from './types'

export function listarCarregamentos(): Promise<Carregamento[]> {
  return api<Carregamento[]>('/api/carregamentos')
}

export function registrarCarregamento(input: CarregamentoInput): Promise<Carregamento> {
  return api<Carregamento>('/api/carregamentos', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}