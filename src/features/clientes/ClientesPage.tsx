import { useEffect, useState } from 'react'
import {
  atualizarCliente,
  criarCliente,
  listarClientes,
} from '../../api/clientes'
import type { Cliente, ClienteInput } from '../../api/types'

const formVazio: ClienteInput = { nome: '', telefone: '', endereco: '', documento: '' }

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [termo, setTermo] = useState('')
  const [form, setForm] = useState<ClienteInput>(formVazio)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  function carregarClientes(termoBusca?: string) {
    setCarregando(true)
    listarClientes(termoBusca)
      .then(setClientes)
      .catch((err: Error) => setErro(err.message))
      .finally(() => setCarregando(false))
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  function alterarForm(campo: keyof ClienteInput, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function preencherEdicao(cliente: Cliente) {
    setEditandoId(cliente.id)
    setErro(null)
    setForm({
      nome: cliente.nome,
      telefone: cliente.telefone ?? '',
      endereco: cliente.endereco ?? '',
      documento: cliente.documento ?? '',
    })
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setForm(formVazio)
    setErro(null)
  }

  async function salvar(event: React.FormEvent) {
    event.preventDefault()
    setErro(null)

    const input: ClienteInput = {
      nome: form.nome.trim(),
      telefone: form.telefone?.trim() || undefined,
      endereco: form.endereco?.trim() || undefined,
      documento: form.documento?.trim() || undefined,
    }

    try {
      if (editandoId === null) {
        await criarCliente(input)
      } else {
        await atualizarCliente(editandoId, input)
      }
      cancelarEdicao()
      carregarClientes(termo)
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  return (
    <div className="pagina">
      <h1>Clientes</h1>

      {erro && <div className="alerta erro">{erro}</div>}

      <form className="card formulario" onSubmit={salvar}>
        <h2>{editandoId === null ? 'Cadastrar cliente' : 'Editar cliente'}</h2>
        <div className="linha-form">
          <label>
            Nome
            <input
              value={form.nome}
              onChange={(e) => alterarForm('nome', e.target.value)}
              required
            />
          </label>
          <label>
            Telefone
            <input
              value={form.telefone}
              onChange={(e) => alterarForm('telefone', e.target.value)}
              placeholder="(11) 99999-0000"
            />
          </label>
          <label>
            Endereco
            <input
              value={form.endereco}
              onChange={(e) => alterarForm('endereco', e.target.value)}
            />
          </label>
          <label>
            Documento (CPF/CNPJ)
            <input
              value={form.documento}
              onChange={(e) => alterarForm('documento', e.target.value)}
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
        <h2>Clientes cadastrados</h2>
        <div className="linha-form" style={{ marginBottom: 12 }}>
          <label>
            Buscar por nome ou telefone
            <input
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  carregarClientes(termo)
                }
              }}
              placeholder="Digite e pressione Enter"
            />
          </label>
          <div className="acoes-form">
            <button type="button" className="botao primario" onClick={() => carregarClientes(termo)}>
              Buscar
            </button>
          </div>
        </div>
        {carregando ? (
          <p>Carregando...</p>
        ) : clientes.length === 0 ? (
          <p>Nenhum cliente encontrado.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Endereco</th>
                <th>Documento</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.telefone ?? '-'}</td>
                  <td>{cliente.endereco ?? '-'}</td>
                  <td>{cliente.documento ?? '-'}</td>
                  <td>
                    <button type="button" className="botao" onClick={() => preencherEdicao(cliente)}>
                      Editar
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