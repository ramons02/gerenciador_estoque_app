import { useEffect, useState } from 'react'
import { painelEstoque } from '../../api/relatorios'
import type { EstoqueProduto } from '../../api/types'

export function EstoquePage() {
  const [estoque, setEstoque] = useState<EstoqueProduto[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  function carregar() {
    painelEstoque()
      .then(setEstoque)
      .catch((err: Error) => setErro(err.message))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregar()
  }, [])

  return (
    <div className="pagina">
      <h1>Painel de estoque</h1>

      {erro && <div className="alerta erro">{erro}</div>}

      <div className="card">
        <div className="acoes-form" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}>Patio em tempo real</h2>
          <button type="button" className="botao" onClick={carregar}>
            Atualizar
          </button>
        </div>
        {carregando ? (
          <p>Carregando...</p>
        ) : estoque.length === 0 ? (
          <p>Nenhum produto cadastrado.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Cheios</th>
                <th>Vazios no patio</th>
                <th>Em rua</th>
                <th>Limite minimo</th>
                <th>Situacao</th>
              </tr>
            </thead>
            <tbody>
              {estoque.map((produto) => (
                <tr key={produto.id} className={produto.estoqueBaixo ? 'linha-alerta' : ''}>
                  <td>{produto.nome}</td>
                  <td>{produto.estoqueCheios}</td>
                  <td>{produto.estoqueVazios}</td>
                  <td>{produto.emRua}</td>
                  <td>{produto.limiteMinimo}</td>
                  <td>
                    {produto.estoqueBaixo ? (
                      <span className="badge-alerta">
                        Estoque baixo{produto.sugestaoReposicao > 0
                          ? ` - repor ${produto.sugestaoReposicao}`
                          : ''}
                      </span>
                    ) : (
                      <span className="badge-ok">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}