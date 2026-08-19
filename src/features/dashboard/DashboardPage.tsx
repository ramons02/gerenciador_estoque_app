import { useEffect, useState, type ReactNode } from 'react'
import { resumoDia } from '../../api/relatorios'
import type { ResumoDia } from '../../api/types'

const ROTULOS_PAGAMENTO: Record<string, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'PIX',
  CARTAO: 'Cartao (credito/debito)',
  FIADO: 'Fiado',
}

const ICONES_PAGAMENTO: Record<string, { icone: ReactNode; cor: string }> = {
  DINHEIRO: {
    icone: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
    cor: 'verde',
  },
  PIX: {
    icone: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
    ),
    cor: 'ciano',
  },
  CARTAO: {
    icone: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20M6 15h4" />
      </svg>
    ),
    cor: 'violeta',
  },
  FIADO: {
    icone: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M9 13h6M9 17h6" />
      </svg>
    ),
    cor: 'ambar',
  },
}

function formatarPreco(valor: string): string {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface DashboardPageProps {
  onNavegar?: (pagina: string) => void
}

export function DashboardPage({ onNavegar }: DashboardPageProps) {
  const [resumo, setResumo] = useState<ResumoDia | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  function carregar() {
    setCarregando(true)
    setErro(null)
    resumoDia()
      .then(setResumo)
      .catch((err: Error) => setErro(err.message))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregar()
  }, [])

  const totalPorPagamento = resumo
    ? Object.entries(resumo.totalPorPagamento).reduce(
        (acc, [forma, total]) => {
          const chave = forma === 'CARTAO_CREDITO' || forma === 'CARTAO_DEBITO' ? 'CARTAO' : forma
          acc[chave] = (acc[chave] ?? 0) + Number(total)
          return acc
        },
        {} as Record<string, number>,
      )
    : {}
  const formasPagamento = Object.entries(totalPorPagamento)
  const unidadesVendidas = resumo
    ? Object.values(resumo.unidadesPorProduto).reduce((soma, qtd) => soma + qtd, 0)
    : 0
  const maxUnidades = resumo ? Math.max(1, ...Object.values(resumo.unidadesPorProduto)) : 1
  const dataHoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })

  return (
    <div className="pagina">
      {erro && <div className="alerta erro">{erro}</div>}

      <section className="hero">
        <div className="hero-conteudo">
          <span className="hero-eyebrow">Resumo do dia</span>
          <h1 className="hero-titulo">
            Bom dia! Tudo <em>sob controle</em> hoje
          </h1>
          <p className="hero-sub">
            Acompanhe o movimento de hoje: vendas, formas de pagamento e alertas do estoque em
            tempo real.
          </p>
          <p className="hero-data">Hoje, {dataHoje}</p>
          <div className="hero-acoes">
            <button
              type="button"
              className="botao primario"
              onClick={() => onNavegar?.('vendas')}
            >
              Nova venda
            </button>
            <button type="button" className="botao" onClick={carregar} disabled={carregando}>
              {carregando ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {carregando || resumo === null ? (
          <div className="hero-destaque">
            <span className="kpi-rotulo">Total faturado hoje</span>
            <div className="skeleton hero-skeleton-titulo" style={{ height: 34, width: '70%' }} />
            <div className="skeleton" style={{ height: 12, width: '55%', marginTop: 12 }} />
          </div>
        ) : (
          <div className="hero-destaque">
            <span className="kpi-rotulo">Total faturado hoje</span>
            <div className="kpi-valor">{formatarPreco(resumo.totalFaturado)}</div>
            <div className="kpi-sub">
              {unidadesVendidas} unidade{unidadesVendidas === 1 ? '' : 's'} vendida
              {unidadesVendidas === 1 ? '' : 's'} em {formasPagamento.length} forma
              {formasPagamento.length === 1 ? '' : 's'} de pagamento
            </div>
          </div>
        )}
      </section>

      {carregando || resumo === null ? (
        <div className="kpi-grid">
          {[1, 2, 3, 4].map((n) => (
            <div className="kpi" key={n}>
              <div className="skeleton" style={{ height: 18, width: '55%' }} />
              <div className="skeleton" style={{ height: 26, width: '70%' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="kpi-grid">
          {formasPagamento.map(([forma, total]) => {
            const conf = ICONES_PAGAMENTO[forma] ?? ICONES_PAGAMENTO.DINHEIRO
            return (
              <div className="kpi" key={forma}>
                <div className="kpi-topo">
                  <span className={`kpi-icone ${conf.cor}`}>{conf.icone}</span>
                  <span className="kpi-rotulo">{ROTULOS_PAGAMENTO[forma] ?? forma}</span>
                </div>
                <span className="kpi-valor">{formatarPreco(total)}</span>
              </div>
            )
          })}
          <div className="kpi">
            <div className="kpi-topo">
              <span className="kpi-icone">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <path d="M3.3 7 12 12l8.7-5M12 22V12" />
                </svg>
              </span>
              <span className="kpi-rotulo">Unidades vendidas</span>
            </div>
            <span className="kpi-valor">{unidadesVendidas}</span>
          </div>
        </div>
      )}

      <div className="painel-grid">
        <div className="card">
          <h2>Produtos mais vendidos hoje</h2>
          {carregando || resumo === null ? (
            <div className="skeleton tabela-skeleton" />
          ) : Object.keys(resumo.unidadesPorProduto).length === 0 ? (
            <p style={{ color: 'var(--cor-texto-suave)' }}>Nenhuma venda hoje.</p>
          ) : (
            <table className="tabela">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produto</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(resumo.unidadesPorProduto).map(([produto, quantidade], idx) => (
                  <tr key={produto}>
                    <td className="ranque-pos">{String(idx + 1).padStart(2, '0')}</td>
                    <td>
                      {produto}
                      <div
                        className="barra-produto"
                        style={{ width: `${Math.max(10, (quantidade / maxUnidades) * 100)}%` }}
                      />
                    </td>
                    <td style={{ fontFamily: 'var(--fonte-mono)', fontWeight: 700 }}>
                      {quantidade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2>Alertas de estoque baixo</h2>
          {carregando || resumo === null ? (
            <div className="skeleton tabela-skeleton" />
          ) : resumo.alertasEstoqueBaixo.length === 0 ? (
            <div className="sem-alertas">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4 12 14.01l-3-3" />
              </svg>
              Nenhum alerta. Estoque dentro do limite.
            </div>
          ) : (
            <div>
              {resumo.alertasEstoqueBaixo.map((alerta) => (
                <div className="alerta-item" key={alerta.id}>
                  <div>
                    <div className="alerta-nome">{alerta.nome}</div>
                    <div className="alerta-det">
                      {alerta.estoqueCheios} cheios / limite {alerta.limiteMinimo}
                    </div>
                  </div>
                  <span className="alerta-reposicao">Reponha {alerta.sugestaoReposicao}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
