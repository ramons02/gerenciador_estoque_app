import { useEffect, useState } from 'react'
import {
  atualizarProduto,
  criarCarga,
  criarProduto,
  criarVasilhame,
  listarCargas,
  listarProdutos,
  listarVasilhames,
} from '../../api/produtos'
import type { Carga, Produto, ProdutoInput, Vasilhame } from '../../api/types'

interface FormState {
  cargaId: string
  vasilhameId: string
  precoCusto: string
  precoVenda: string
  limiteMinimo: string
}

const formVazio: FormState = {
  cargaId: '',
  vasilhameId: '',
  precoCusto: '',
  precoVenda: '',
  limiteMinimo: '0',
}

function formatarPreco(valor: string): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor))
}

const VASILHAME_POR_CARGA: Record<string, string> = {
  Gas: 'P13',
  Agua: 'Galão 20L',
}

export function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [cargas, setCargas] = useState<Carga[]>([])
  const [vasilhames, setVasilhames] = useState<Vasilhame[]>([])
  const [form, setForm] = useState<FormState>(formVazio)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [novaCargaAberta, setNovaCargaAberta] = useState(false)
  const [novaCargaNome, setNovaCargaNome] = useState('')
  const [novoVasilhameAberto, setNovoVasilhameAberto] = useState(false)
  const [novoVasilhameNome, setNovoVasilhameNome] = useState('')
  const [novoVasilhamePrecoCasco, setNovoVasilhamePrecoCasco] = useState('0')

  useEffect(() => {
    Promise.all([listarProdutos(), listarCargas(), listarVasilhames()])
      .then(([listaProdutos, listaCargas, listaVasilhames]) => {
        setProdutos(listaProdutos)
        setCargas(listaCargas)
        setVasilhames(listaVasilhames)
      })
      .catch((err: Error) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [])

  function alterarForm(campo: keyof FormState, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function preencherEdicao(produto: Produto) {
    setEditandoId(produto.id)
    setErro(null)
    setForm({
      cargaId: String(produto.carga.id),
      vasilhameId: String(produto.vasilhame.id),
      precoCusto: produto.precoCusto,
      precoVenda: produto.precoVenda,
      limiteMinimo: String(produto.limiteMinimo),
    })
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setForm(formVazio)
    setErro(null)
  }

  async function confirmarNovaCarga() {
    const nome = novaCargaNome.trim()
    if (!nome) return
    setErro(null)
    try {
      const criada = await criarCarga(nome)
      setCargas(await listarCargas())
      setNovaCargaAberta(false)
      setNovaCargaNome('')
      alterarForm('cargaId', String(criada.id))
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  async function confirmarNovoVasilhame() {
    const nome = novoVasilhameNome.trim()
    if (!nome) return
    setErro(null)
    try {
      const criado = await criarVasilhame(nome, novoVasilhamePrecoCasco || '0')
      setVasilhames(await listarVasilhames())
      setNovoVasilhameAberto(false)
      setNovoVasilhameNome('')
      setNovoVasilhamePrecoCasco('0')
      alterarForm('vasilhameId', String(criado.id))
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  async function salvar(event: React.FormEvent) {
    event.preventDefault()
    setErro(null)

    const input: ProdutoInput = {
      carga: { id: Number(form.cargaId) },
      vasilhame: { id: Number(form.vasilhameId) },
      precoCusto: form.precoCusto,
      precoVenda: form.precoVenda,
      limiteMinimo: Number(form.limiteMinimo),
    }

    try {
      if (editandoId === null) {
        await criarProduto(input)
      } else {
        await atualizarProduto(editandoId, input)
      }
      const lista = await listarProdutos()
      setProdutos(lista)
      cancelarEdicao()
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  return (
    <div className="pagina">
      <h1>Produtos</h1>

      {erro && <div className="alerta erro">{erro}</div>}

      <form className="card formulario" onSubmit={salvar}>
        <h2>{editandoId === null ? 'Cadastrar produto' : 'Editar produto'}</h2>
        <div className="linha-form">
          <label>
            Carga
            <select
              value={form.cargaId}
              onChange={(e) => {
                const valor = e.target.value
                if (valor === 'nova') {
                  setNovaCargaAberta(true)
                  return
                }
                setNovaCargaAberta(false)
                alterarForm('cargaId', valor)
                const carga = cargas.find((c) => c.id === Number(valor))
                if (!carga) return
                const nomeVasilhame = VASILHAME_POR_CARGA[carga.nome]
                if (!nomeVasilhame) return
                const vasilhame = vasilhames.find((v) => v.nome === nomeVasilhame)
                if (vasilhame) {
                  alterarForm('vasilhameId', String(vasilhame.id))
                }
              }}
              required
            >
              <option value="">Selecione</option>
              {cargas.map((carga) => (
                <option key={carga.id} value={carga.id}>
                  {carga.nome}
                </option>
              ))}
              <option value="nova">Nova carga...</option>
            </select>
            {novaCargaAberta && (
              <div className="nova-opcao">
                <input
                  type="text"
                  placeholder="Nome da nova carga"
                  value={novaCargaNome}
                  onChange={(e) => setNovaCargaNome(e.target.value)}
                />
                <button type="button" className="botao primario" onClick={confirmarNovaCarga}>
                  Criar carga
                </button>
                <button type="button" className="botao" onClick={() => setNovaCargaAberta(false)}>
                  Cancelar
                </button>
              </div>
            )}
          </label>
          <label>
            Vasilhame
            <select
              value={form.vasilhameId}
              onChange={(e) => {
                const valor = e.target.value
                if (valor === 'nova') {
                  setNovoVasilhameAberto(true)
                  return
                }
                setNovoVasilhameAberto(false)
                alterarForm('vasilhameId', valor)
              }}
              required
            >
              <option value="">Selecione</option>
              {vasilhames.map((vasilhame) => (
                <option key={vasilhame.id} value={vasilhame.id}>
                  {vasilhame.nome}
                </option>
              ))}
              <option value="nova">Novo vasilhame...</option>
            </select>
            {novoVasilhameAberto && (
              <div className="nova-opcao">
                <input
                  type="text"
                  placeholder="Nome do novo vasilhame"
                  value={novoVasilhameNome}
                  onChange={(e) => setNovoVasilhameNome(e.target.value)}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Preco do casco (R$)"
                  value={novoVasilhamePrecoCasco}
                  onChange={(e) => setNovoVasilhamePrecoCasco(e.target.value)}
                />
                <button type="button" className="botao primario" onClick={confirmarNovoVasilhame}>
                  Criar vasilhame
                </button>
                <button type="button" className="botao" onClick={() => setNovoVasilhameAberto(false)}>
                  Cancelar
                </button>
              </div>
            )}
          </label>
          <label>
            Preco de custo (R$)
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.precoCusto}
              onChange={(e) => alterarForm('precoCusto', e.target.value)}
              placeholder="0,00"
              required
            />
          </label>
          <label>
            Preco de venda (R$)
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.precoVenda}
              onChange={(e) => alterarForm('precoVenda', e.target.value)}
              placeholder="0,00"
              required
            />
          </label>
          <label>
            Limite minimo de estoque
            <input
              type="number"
              min="0"
              value={form.limiteMinimo}
              onChange={(e) => alterarForm('limiteMinimo', e.target.value)}
              required
            />
          </label>
        </div>
        <div className="acoes-form">
          <button type="submit" className="botao primario">
            {editandoId === null ? 'Cadastrar' : 'Salvar alteracoes'}
          </button>
          {editandoId !== null && (
            <button type="button" className="botao" onClick={cancelarEdicao}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="card">
        <h2>Produtos cadastrados</h2>
        {carregando ? (
          <p>Carregando...</p>
        ) : produtos.length === 0 ? (
          <p>Nenhum produto cadastrado.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preco de custo</th>
                <th>Preco de venda</th>
                <th>Limite minimo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
                <tr key={produto.id}>
                  <td>{produto.carga.nome} {produto.vasilhame.nome}</td>
                  <td>{formatarPreco(produto.precoCusto)}</td>
                  <td>{formatarPreco(produto.precoVenda)}</td>
                  <td>{produto.limiteMinimo}</td>
                  <td>
                    <button
                      type="button"
                      className="botao"
                      onClick={() => preencherEdicao(produto)}
                    >
                      Editar precos
                    </button>
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