import { useEffect, useState } from 'react'
import { resumoDia } from '../../api/relatorios'
import type { ResumoDia } from '../../api/types'

const ROTULOS_PAGAMENTO: Record<string, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'PIX',
  CARTAO_CREDITO: 'Cartao de credito',
  CARTAO_DEBITO: 'Cartao de debito',
  FIADO: 'Fiado',
}

function formatarPreco(valor: string): string {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function DashboardPage() {
  const [resumo, setResumo] = useState<ResumoDia | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  function carregar() {
    setCarregando(true)
    resumoDia()
      .then(setResumo)
      .catch((err: Error) => setErro(err.message))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregar()
  }, [])

  return (
    <div className="pagina">
      <h1>Resumo do dia</h1>

      {erro && <div className="alerta erro">{erro}</div>}

      <div className="card">
        <div className="acoes-form" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Dashboard</h2>
          <button type="button" className="botao" onClick={carregar}>
            Atualizar
          </button>
        </div>
        {carregando || resumo === null ? (
          <p>Carregando...</p>
        ) : (
          <>
            <div className="cartoes-grid">
              <div className="cartao-destaque">
                <span className="cartao-rotulo">Total faturado hoje</span>
                <span className="cartao-valor">{formatarPreco(resumo.totalFaturado)}</span>
              </div>
              {Object.entries(resumo.totalPorPagamento).map(([forma, total]) => (
                <div className="cartao" key={forma}>
                  <span className="cartao-rotulo">{ROTULOS_PAGAMENTO[forma] ?? forma}</span>
                  <span className="cartao-valor">{formatarPreco(total)}</span>
                </div>
              ))}
            </div>

            <h2>Unidades vendidas hoje</h2>
            {Object.keys(resumo.unidadesPorProduto).length === 0 ? (
              <p>Nenhuma venda hoje.</p>
            ) : (
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(resumo.unidadesPorProduto).map(([produto, quantidade]) => (
                    <tr key={produto}>
                      <td>{produto}</td>
                      <td>{quantidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <h2>Alertas de estoque baixo</h2>
            {resumo.alertasEstoqueBaixo.length === 0 ? (
              <p>Nenhum alerta. Estoque dentro do limite.</p>
            ) : (
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Cheios</th>
                    <th>Limite</th>
                    <th>Reposicao sugerida</th>
                  </tr>
                </thead>
                <tbody>
                  {resumo.alertasEstoqueBaixo.map((alerta) => (
                    <tr key={alerta.id} className="linha-alerta">
                      <td>{alerta.nome}</td>
                      <td>{alerta.estoqueCheios}</td>
                      <td>{alerta.limiteMinimo}</td>
                      <td>{alerta.sugestaoReposicao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  )
}