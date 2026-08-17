import { api } from './client'
import type { Configuracao } from './types'

export function listarConfiguracoes(): Promise<Configuracao[]> {
  return api<Configuracao[]>('/api/configuracoes')
}

export function atualizarConfiguracao(chave: string, valor: string): Promise<Configuracao> {
  return api<Configuracao>(`/api/configuracoes/${chave}`, {
    method: 'PUT',
    body: JSON.stringify({ valor }),
  })
}