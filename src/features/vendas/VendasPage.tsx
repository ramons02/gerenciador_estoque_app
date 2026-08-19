import { useEffect, useState } from 'react'
import { listarClientes } from '../../api/clientes'
import { listarConfiguracoes } from '../../api/configuracoes'
import { listarProdutos } from '../../api/produtos'
import { cancelarVenda, lancarVenda, listarVendas } from '../../api/vendas'
import type { Cliente, Produto, Venda, VendaInput } from '../../api/types'
import { FORMAS_PAGAMENTO, TIPOS_VENDA } from '../../api/types'

interface FormState {
  produtoId: string
  quantidade: string
  tipo: string
  formaPagamento: string
  clienteId: string
  vasilhameNovo: boolean
  troca: boolean
}

const formVazio: FormState = {
  produtoId: '',
  quantidade: '1',
  tipo: 'BALCAO',
  formaPagamento: 'DINHEIRO',
  clienteId: '',
  vasilhameNovo: false,
  troca: true,
}

function formatarPreco(valor: number | string): string {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [form, setForm] = useState<FormState>(formVazio)
  const [taxaEntrega, setTaxaEntrega] = useState(0)
  const [formasAtivas, setFormasAtivas] = useState<string[]>(FORMAS_PAGAMENTO.map((f) => f.valor))
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    Promise.all([listarVendas(), listarProdutos(), listarClientes(), listarConfiguracoes()])
      .then(([v, p, c, configs]) => {
        setVendas(v)
        setProdutos(p)
        setClientes(c)
        const taxa = configs.find((config) => config.chave === 'taxa_entrega')
        if (taxa) {
          setTaxaEntrega(Number(taxa.valor))
        }
        const mapeamento: Record<string, string> = {
          pagamento_DINHEIRO: 'DINHEIRO',
          pagamento_PIX: 'PIX',
          pagamento_CARTAO: 'CARTAO_CREDITO',
          pagamento_FIADO: 'FIADO',
        }
        const ativas: string[] = []
        for (const config of configs) {
          if (config.valor === 'true' && mapeamento[config.chave]) {
            ativas.push(mapeamento[config.chave])
          }
        }
        if (ativas.length > 0) {
          setFormasAtivas(ativas)
        }
      })
      .catch((err: Error) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [])

  function alterarForm(campo: keyof FormState, valor: string | boolean) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  const produtoSelecionado = produtos.find((p) => p.id === Number(form.produtoId))

  function calcularTotal(): number {
    if (!produtoSelecionado) return 0
    let unitario = Number(produtoSelecionado.precoVenda)
    if (form.vasilhameNovo) {
      unitario += Number(produtoSelecionado.vasilhame.precoCasco ?? 0)
    }
    let total = unitario * Number(form.quantidade || 0)
    if (form.tipo === 'ENTREGA') {
      total += taxaEntrega
    }
    return total
  }

  const precisaCliente = form.formaPagamento === 'FIADO' || form.vasilhameNovo

  async function salvar(event: React.FormEvent) {
    event.preventDefault()
    setErro(null)
    setSucesso(null)

    const input: VendaInput = {
      produto: { id: Number(form.produtoId) },
      quantidade: Number(form.quantidade),
      tipo: form.tipo as VendaInput['tipo'],
      formaPagamento: form.formaPagamento,
      vasilhameNovo: form.vasilhameNovo,
      ...(precisaCliente && form.clienteId ? { cliente: { id: Number(form.clienteId) } } : {}),
    }

    try {
      await lancarVenda(input)
      setSucesso('Venda lancada com sucesso.')
      setForm((atual) => ({ ...formVazio, clienteId: atual.clienteId }))
      setVendas(await listarVendas())
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  async function cancelar(venda: Venda) {
    if (!window.confirm(`Cancelar a venda de ${venda.quantidade}x ${venda.produto.carga.nome} ${venda.produto.vasilhame.nome}?`)) {
      return
    }
    setErro(null)
    try {
      await cancelarVenda(venda.id)
      setVendas(await listarVendas())
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  return (
    <div className="pagina">
      <h1>Lancar venda</h1>

      {erro && <div className="alerta erro">{erro}</div>}
      {sucesso && <div className="alerta sucesso">{sucesso}</div>}

      <form className="card formulario" onSubmit={salvar}>
        <h2>Venda rapida</h2>
        <div className="linha-form">
          <label>
            Produto
            <select value={form.produtoId} onChange={(e) => alterarForm('produtoId', e.target.value)} required>
              <option value="">Selecione</option>
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>
                  {produto.carga.nome} {produto.vasilhame.nome}
                </option>
              ))}
            </select>
          </label>
          <label>
            Quantidade
            <input
              type="number"
              min="1"
              value={form.quantidade}
              onChange={(e) => alterarForm('quantidade', e.target.value)}
              required
            />
          </label>
          <label>
            Tipo
            <select value={form.tipo} onChange={(e) => alterarForm('tipo', e.target.value)}>
              {TIPOS_VENDA.map((tipo) => (
                <option key={tipo.valor} value={tipo.valor}>
                  {tipo.rotulo}
                </option>
              ))}
            </select>
          </label>
          <label>
            Forma de pagamento
            <select value={form.formaPagamento} onChange={(e) => alterarForm('formaPagamento', e.target.value)}>
              {FORMAS_PAGAMENTO.filter((forma) => formasAtivas.includes(forma.valor)).map(
                (forma) => (
                  <option key={forma.valor} value={forma.valor}>
                    {forma.rotulo}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <div className="linha-form" style={{ marginTop: 12 }}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.troca}
              onChange={(e) => alterarForm('troca', e.target.checked)}
            />
            Venda com troca (cliente devolve vazio)
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.vasilhameNovo}
              onChange={(e) => {
                alterarForm('vasilhameNovo', e.target.checked)
                if (e.target.checked) {
                  alterarForm('troca', false)
                }
              }}
            />
            Vasilhame novo (vende casco + carga)
          </label>
        </div>

        {precisaCliente && (
          <div className="linha-form" style={{ marginTop: 12 }}>
            <label>
              Cliente (obrigatorio para fiado ou vasilhame novo)
              <select value={form.clienteId} onChange={(e) => alterarForm('clienteId', e.target.value)} required>
                <option value="">Selecione</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} {cliente.telefone ? `(${cliente.telefone})` : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        <div className="acoes-form" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="total-venal">
            Total: <strong>{formatarPreco(calcularTotal())}</strong>
          </span>
          <button type="submit" className="botao primario">
            Lancar venda
          </button>
        </div>
      </form>

      <div className="card">
        <h2>Historico de vendas (ultimos 30 dias)</h2>
        {carregando ? (
          <p>Carregando...</p>
        ) : vendas.length === 0 ? (
          <p>Nenhuma venda lancada.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Total</th>
                <th>Pagamento</th>
                <th>Tipo</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((venda) => (
                <tr key={venda.id} className={venda.status === 'CANCELADA' ? 'linha-cancelada' : ''}>
                  <td>{new Date(venda.criadoEm).toLocaleString('pt-BR')}</td>
                  <td>{venda.produto.carga.nome} {venda.produto.vasilhame.nome}</td>
                  <td>{venda.quantidade}</td>
                  <td>{formatarPreco(venda.total)}</td>
                  <td>{venda.formaPagamento}</td>
                  <td>{venda.tipo}</td>
                  <td>{venda.status === 'CANCELADA' ? 'Cancelada' : 'Concluida'}</td>
                  <td>
                    {venda.status !== 'CANCELADA' && (
                      <button type="button" className="botao" onClick={() => cancelar(venda)}>
                        Cancelar
                      </button>
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