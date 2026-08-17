import { useEffect, useState } from 'react'
import { registrarCarregamento, listarCarregamentos } from '../../api/carregamentos'
import { listarFornecedores } from '../../api/fornecedores'
import { listarProdutos } from '../../api/produtos'
import type { Carregamento, CarregamentoInput, Fornecedor, Produto } from '../../api/types'

interface ItemForm {
  produtoId: string
  quantidadeCheios: string
  vaziosDevolvidos: string
  custoTotal: string
}

const itemVazio: ItemForm = { produtoId: '', quantidadeCheios: '', vaziosDevolvidos: '0', custoTotal: '' }

export function CarregamentosPage() {
  const [carregamentos, setCarregamentos] = useState<Carregamento[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [fornecedorId, setFornecedorId] = useState('')
  const [itens, setItens] = useState<ItemForm[]>([{ ...itemVazio }])
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    Promise.all([listarCarregamentos(), listarFornecedores(), listarProdutos()])
      .then(([c, f, p]) => {
        setCarregamentos(c)
        setFornecedores(f)
        setProdutos(p)
      })
      .catch((err: Error) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [])

  function alterarItem(indice: number, campo: keyof ItemForm, valor: string) {
    setItens((atual) => atual.map((item, i) => (i === indice ? { ...item, [campo]: valor } : item)))
  }

  function adicionarItem() {
    setItens((atual) => [...atual, { ...itemVazio }])
  }

  function removerItem(indice: number) {
    setItens((atual) => (atual.length === 1 ? atual : atual.filter((_, i) => i !== indice)))
  }

  async function salvar(event: React.FormEvent) {
    event.preventDefault()
    setErro(null)
    setSucesso(null)

    const input: CarregamentoInput = {
      fornecedor: { id: Number(fornecedorId) },
      itens: itens.map((item) => ({
        produto: { id: Number(item.produtoId) },
        quantidadeCheios: Number(item.quantidadeCheios),
        vaziosDevolvidos: Number(item.vaziosDevolvidos),
        custoTotal: item.custoTotal,
      })),
    }

    try {
      await registrarCarregamento(input)
      setSucesso('Carregamento registrado com sucesso.')
      setFornecedorId('')
      setItens([{ ...itemVazio }])
      setCarregamentos(await listarCarregamentos())
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  return (
    <div className="pagina">
      <h1>Chegada de caminhao</h1>

      {erro && <div className="alerta erro">{erro}</div>}
      {sucesso && <div className="alerta sucesso">{sucesso}</div>}

      <form className="card formulario" onSubmit={salvar}>
        <h2>Registrar carregamento</h2>
        <div className="linha-form">
          <label>
            Fornecedor (distribuidora)
            <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)} required>
              <option value="">Selecione</option>
              {fornecedores.map((fornecedor) => (
                <option key={fornecedor.id} value={fornecedor.id}>
                  {fornecedor.nome}
                </option>
              ))}
            </select>
          </label>
        </div>

        {itens.map((item, indice) => (
          <div key={indice} className="linha-form" style={{ marginTop: 12 }}>
            <label>
              Produto
              <select
                value={item.produtoId}
                onChange={(e) => alterarItem(indice, 'produtoId', e.target.value)}
                required
              >
                <option value="">Selecione</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.carga.nome} {produto.vasilhame.nome}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Cheios recebidos
              <input
                type="number"
                min="1"
                value={item.quantidadeCheios}
                onChange={(e) => alterarItem(indice, 'quantidadeCheios', e.target.value)}
                required
              />
            </label>
            <label>
              Vazios devolvidos
              <input
                type="number"
                min="0"
                value={item.vaziosDevolvidos}
                onChange={(e) => alterarItem(indice, 'vaziosDevolvidos', e.target.value)}
                placeholder="0"
              />
            </label>
            <label>
              Custo total (R$)
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={item.custoTotal}
                onChange={(e) => alterarItem(indice, 'custoTotal', e.target.value)}
                placeholder="0,00"
                required
              />
            </label>
            <div className="acoes-form">
              <button type="button" className="botao" onClick={() => removerItem(indice)}>
                Remover
              </button>
            </div>
          </div>
        ))}

        <div className="acoes-form">
          <button type="button" className="botao" onClick={adicionarItem}>
            + Adicionar produto
          </button>
          <button type="submit" className="botao primario">
            Registrar carregamento
          </button>
        </div>
      </form>

      <div className="card">
        <h2>Carregamentos registrados</h2>
        {carregando ? (
          <p>Carregando...</p>
        ) : carregamentos.length === 0 ? (
          <p>Nenhum carregamento registrado.</p>
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
              {carregamentos.map((carregamento) =>
                carregamento.itens.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(carregamento.criadoEm).toLocaleString('pt-BR')}</td>
                    <td>{carregamento.fornecedor.nome}</td>
                    <td>{item.produto.carga.nome} {item.produto.vasilhame.nome}</td>
                    <td>{item.quantidadeCheios}</td>
                    <td>{item.vaziosDevolvidos}</td>
                    <td>{Number(item.custoTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}