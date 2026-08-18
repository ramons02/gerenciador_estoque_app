import { useCallback, useEffect, useState } from 'react'
import {
  relatorioBalanco,
  relatorioCarregamentos,
  relatorioVendas,
  urlExportarBalanco,
  urlExportarCarregamentos,
  urlExportarVendas,
} from '../../api/relatorios'
import type { BalancoProduto, CarregamentoRelatorio, VendaRelatorio } from '../../api/types'

type Periodo = 'hoje' | '7dias' | 'mes' | 'personalizado'

function periodoPadrao(): { inicio: string; fim: string } {
  const hoje = new Date()
  return { inicio: hoje.toISOString().slice(0, 10), fim: hoje.toISOString().slice(0, 10) }
}

function calcularPeriodo(tipo: Periodo): { inicio: string; fim: string } {
  const fim = new Date()
  const inicio = new Date()
  if (tipo === '7dias') {
    inicio.setDate(inicio.getDate() - 6)
  } else if (tipo === 'mes') {
    inicio.setDate(1)
  }
  return { inicio: inicio.toISOString().slice(0, 10), fim: fim.toISOString().slice(0, 10) }
}

function formatarPreco(valor: string): string {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function RelatoriosPage() {
  const [periodo, setPeriodo] = useState<Periodo>('hoje')
  const [inicio, setInicio] = useState(periodoPadrao().inicio)
  const [fim, setFim] = useState(periodoPadrao().fim)
  const [vendas, setVendas] = useState<VendaRelatorio[]>([])
  const [carregamentos, setCarregamentos] = useState<CarregamentoRelatorio[]>([])
  const [balanco, setBalanco] = useState<BalancoProduto[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  function aplicarPeriodo() {
    const selecionado = periodo === 'personalizado' ? { inicio, fim } : calcularPeriodo(periodo)
    setInicio(selecionado.inicio)
    setFim(selecionado.fim)
    return selecionado
  }

  const buscarRelatorios = useCallback((i: string, f: string) => {
    setCarregando(true)
    Promise.all([relatorioVendas(i, f), relatorioCarregamentos(i, f), relatorioBalanco(i, f)])
      .then(([v, c, b]) => {
        setVendas(v)
        setCarregamentos(c)
        setBalanco(b)
      })
      .catch((err: Error) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [])

  useEffect(() => {
    const { inicio: i, fim: f } = calcularPeriodo('hoje')
    setInicio(i)
    setFim(f)
    buscarRelatorios(i, f)
  }, [buscarRelatorios])

  function atualizar() {
    const { inicio: i, fim: f } = aplicarPeriodo()
    buscarRelatorios(i, f)
  }

  return (
    <div className="pagina">
      <h1>Relatorios</h1>

      {erro && <div className="alerta erro">{erro}</div>}

      <div className="card">
        <h2>Periodo</h2>
        <div className="linha-form">
          <label>
            Selecao rapida
            <select value={periodo} onChange={(e) => setPeriodo(e.target.value as Periodo)}>
              <option value="hoje">Hoje</option>
              <option value="7dias">Ultimos 7 dias</option>
              <option value="mes">Mes atual</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </label>
          {periodo === 'personalizado' && (
            <>
              <label>
                De
                <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
              </label>
              <label>
                Ate
                <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
              </label>
            </>
          )}
          <div className="acoes-form">
            <button type="button" className="botao primario" onClick={atualizar}>
              Gerar relatorios
            </button>
          </div>
        </div>
      </div>

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <>
          <div className="card">
            <div className="acoes-form" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>Relatorio de vendas</h2>
              <a className="botao" href={urlExportarVendas(inicio, fim)} download>
                Exportar CSV
              </a>
            </div>
            {vendas.length === 0 ? (
              <p>Nenhuma venda no periodo.</p>
            ) : (
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Produto</th>
                    <th>Qtd</th>
                    <th>Valor unitario</th>
                    <th>Total</th>
                    <th>Pagamento</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((venda) => (
                    <tr key={venda.id}>
                      <td>{new Date(venda.dataHora).toLocaleString('pt-BR')}</td>
                      <td>{venda.produto}</td>
                      <td>{venda.quantidade}</td>
                      <td>{formatarPreco(venda.valorUnitario)}</td>
                      <td>{formatarPreco(venda.total)}</td>
                      <td>{venda.formaPagamento}</td>
                      <td>{venda.tipo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <div className="acoes-form" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>Relatorio de carregamentos</h2>
              <a className="botao" href={urlExportarCarregamentos(inicio, fim)} download>
                Exportar CSV
              </a>
            </div>
            {carregamentos.length === 0 ? (
              <p>Nenhum carregamento no periodo.</p>
            ) : (
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Fornecedor</th>
                    <th>Produto</th>
                    <th>Cheios</th>
                    <th>Vazios devolvidos</th>
                    <th>Custo total</th>
                  </tr>
                </thead>
                <tbody>
                  {carregamentos.map((carregamento, i) => (
                    <tr key={i}>
                      <td>{new Date(carregamento.data).toLocaleString('pt-BR')}</td>
                      <td>{carregamento.fornecedor}</td>
                      <td>{carregamento.produto}</td>
                      <td>{carregamento.quantidadeCheios}</td>
                      <td>{carregamento.vaziosDevolvidos}</td>
                      <td>{formatarPreco(carregamento.custoTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <div className="acoes-form" style={{ justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0 }}>Balanco de estoque</h2>
              <a className="botao" href={urlExportarBalanco(inicio, fim)} download>
                Exportar CSV
              </a>
            </div>
            {balanco.length === 0 ? (
              <p>Nenhum produto cadastrado.</p>
            ) : (
              <table className="tabela">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Estoque inicial</th>
                    <th>Entradas</th>
                    <th>Vendas</th>
                    <th>Estoque final</th>
                    <th>Vazios no patio</th>
                    <th>Em rua</th>
                  </tr>
                </thead>
                <tbody>
                  {balanco.map((item) => (
                    <tr key={item.produtoId}>
                      <td>{item.produto}</td>
                      <td>{item.estoqueInicial}</td>
                      <td>{item.entradas}</td>
                      <td>{item.saidas}</td>
                      <td>{item.estoqueFinal}</td>
                      <td>{item.vaziosPatio}</td>
                      <td>{item.emRua}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}