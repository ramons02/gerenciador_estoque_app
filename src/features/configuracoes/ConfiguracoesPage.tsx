import { useEffect, useState } from 'react'
import { atualizarConfiguracao, listarConfiguracoes } from '../../api/configuracoes'
import { atualizarVasilhame, listarVasilhames } from '../../api/produtos'
import type { Configuracao, Vasilhame } from '../../api/types'

export function ConfiguracoesPage() {
  const [taxaEntrega, setTaxaEntrega] = useState('')
  const [vasilhames, setVasilhames] = useState<Vasilhame[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    Promise.all([listarConfiguracoes(), listarVasilhames()])
      .then(([configs, vasos]) => {
        setVasilhames(vasos)
        const taxa = configs.find((c: Configuracao) => c.chave === 'taxa_entrega')
        if (taxa) {
          setTaxaEntrega(taxa.valor)
        }
      })
      .catch((err: Error) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [])

  async function salvarTaxa(event: React.FormEvent) {
    event.preventDefault()
    setErro(null)
    setSucesso(null)
    try {
      await atualizarConfiguracao('taxa_entrega', taxaEntrega)
      setSucesso('Taxa de entrega atualizada.')
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  async function salvarCasco(vasilhame: Vasilhame) {
    setErro(null)
    setSucesso(null)
    try {
      await atualizarVasilhame(vasilhame.id, {
        nome: vasilhame.nome,
        precoCasco: vasilhame.precoCasco,
      })
      setSucesso(`Preco do casco de ${vasilhame.nome} atualizado.`)
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  return (
    <div className="pagina">
      <h1>Configuracoes</h1>

      {erro && <div className="alerta erro">{erro}</div>}
      {sucesso && <div className="alerta sucesso">{sucesso}</div>}

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <>
          <form className="card formulario" onSubmit={salvarTaxa}>
            <h2>Taxa de entrega</h2>
            <div className="linha-form">
              <label>
                Valor da taxa (R$)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={taxaEntrega}
                  onChange={(e) => setTaxaEntrega(e.target.value)}
                  required
                />
              </label>
            </div>
            <div className="acoes-form">
              <button type="submit" className="botao primario">
                Salvar taxa
              </button>
            </div>
          </form>

          <div className="card">
            <h2>Preco do casco por vasilhame (venda de vasilhame novo)</h2>
            <table className="tabela">
              <thead>
                <tr>
                  <th>Vasilhame</th>
                  <th>Preco do casco (R$)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {vasilhames.map((vasilhame) => (
                  <tr key={vasilhame.id}>
                    <td>{vasilhame.nome}</td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={vasilhame.precoCasco}
                        onChange={(e) =>
                          setVasilhames((atual) =>
                            atual.map((v) =>
                              v.id === vasilhame.id ? { ...v, precoCasco: e.target.value } : v,
                            ),
                          )
                        }
                      />
                    </td>
                    <td>
                      <button type="button" className="botao" onClick={() => salvarCasco(vasilhame)}>
                        Salvar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}