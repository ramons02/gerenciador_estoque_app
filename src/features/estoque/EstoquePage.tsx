import { useEffect, useState } from 'react'
import { atualizarLimiteMinimo } from '../../api/produtos'
import { painelEstoque } from '../../api/relatorios'
import type { EstoqueProduto } from '../../api/types'

export function EstoquePage() {
  const [estoque, setEstoque] = useState<EstoqueProduto[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvandoId, setSalvandoId] = useState<number | null>(null)

  function carregar() {
    painelEstoque()
      .then(setEstoque)
      .catch((err: Error) => setErro(err.message))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregar()
  }, [])

  function salvarLimite(id: number, valor: string) {
    const limite = Number(valor)
    if (Number.isNaN(limite) || limite < 0) {
      setErro('O limite minimo nao pode ser negativo.')
      carregar()
      return
    }
    setErro(null)
    setSalvandoId(id)
    atualizarLimiteMinimo(id, limite)
      .then(carregar)
      .catch((err: Error) => setErro(err.message))
      .finally(() => setSalvandoId(null))
  }

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
                  <td>
                    <input
                      type="number"
                      min="0"
                      key={produto.id}
                      defaultValue={produto.limiteMinimo}
                      className="input-limite"
                      disabled={salvandoId === produto.id}
                      onBlur={(e) => salvarLimite(produto.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur()
                        }
                      }}
                    />
                  </td>
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