import { api } from './client'
import type {
  BalancoProduto,
  CarregamentoRelatorio,
  EstoqueProduto,
  ResumoDia,
  VendaRelatorio,
} from './types'

export function painelEstoque(): Promise<EstoqueProduto[]> {
  return api<EstoqueProduto[]>('/api/produtos/estoque')
}

export function resumoDia(): Promise<ResumoDia> {
  return api<ResumoDia>('/api/dashboard/dia')
}

export function relatorioVendas(inicio: string, fim: string): Promise<VendaRelatorio[]> {
  return api<VendaRelatorio[]>(`/api/relatorios/vendas?inicio=${inicio}&fim=${fim}`)
}

export function relatorioCarregamentos(inicio: string, fim: string): Promise<CarregamentoRelatorio[]> {
  return api<CarregamentoRelatorio[]>(`/api/relatorios/carregamentos?inicio=${inicio}&fim=${fim}`)
}

export function relatorioBalanco(inicio: string, fim: string): Promise<BalancoProduto[]> {
  return api<BalancoProduto[]>(`/api/relatorios/balanco?inicio=${inicio}&fim=${fim}`)
}

export function urlExportarVendas(inicio: string, fim: string): string {
  return `${apiBase()}/api/relatorios/vendas/exportar?inicio=${inicio}&fim=${fim}`
}

export function urlExportarCarregamentos(inicio: string, fim: string): string {
  return `${apiBase()}/api/relatorios/carregamentos/exportar?inicio=${inicio}&fim=${fim}`
}

export function urlExportarBalanco(inicio: string, fim: string): string {
  return `${apiBase()}/api/relatorios/balanco/exportar?inicio=${inicio}&fim=${fim}`
}

function apiBase(): string {
  return (import.meta.env.VITE_API_URL as string | undefined) ?? ''
}