import { useEffect, useState } from 'react'
import {
  atualizarFornecedor,
  criarFornecedor,
  listarFornecedores,
} from '../../api/fornecedores'
import type { Fornecedor, FornecedorInput } from '../../api/types'
import { mascararTelefoneSeParecerNumero } from '../../utils/mascaras'

const formVazio: FornecedorInput = { nome: '', contato: '' }

export function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [form, setForm] = useState<FornecedorInput>(formVazio)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    listarFornecedores()
      .then(setFornecedores)
      .catch((err: Error) => setErro(err.message))
      .finally(() => setCarregando(false))
  }, [])

  function alterarForm(campo: keyof FornecedorInput, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function preencherEdicao(fornecedor: Fornecedor) {
    setEditandoId(fornecedor.id)
    setErro(null)
    setForm({ nome: fornecedor.nome, contato: fornecedor.contato ?? '' })
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setForm(formVazio)
    setErro(null)
  }

  async function salvar(event: React.FormEvent) {
    event.preventDefault()
    setErro(null)

    const input: FornecedorInput = {
      nome: form.nome.trim(),
      contato: form.contato?.trim() || undefined,
    }

    try {
      if (editandoId === null) {
        await criarFornecedor(input)
      } else {
        await atualizarFornecedor(editandoId, input)
      }
      setFornecedores(await listarFornecedores())
      cancelarEdicao()
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  return (
    <div className="pagina">
      <h1>Fornecedores</h1>

      {erro && <div className="alerta erro">{erro}</div>}

      <form className="card formulario" onSubmit={salvar}>
        <h2>{editandoId === null ? 'Cadastrar fornecedor' : 'Editar fornecedor'}</h2>
        <div className="linha-form">
          <label>
            Nome da distribuidora
            <input
              value={form.nome}
              onChange={(e) => alterarForm('nome', e.target.value)}
              placeholder="Ex.: Ultragaz"
              required
            />
          </label>
          <label>
            Contato
            <input
              value={form.contato}
              onChange={(e) => alterarForm('contato', mascararTelefoneSeParecerNumero(e.target.value))}
              placeholder="Telefone / pessoa de contato"
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
        <h2>Fornecedores cadastrados</h2>
        {carregando ? (
          <p>Carregando...</p>
        ) : fornecedores.length === 0 ? (
          <p>Nenhum fornecedor cadastrado.</p>
        ) : (
          <table className="tabela">
            <thead>
              <tr>
                <th>Distribuidora</th>
                <th>Contato</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fornecedores.map((fornecedor) => (
                <tr key={fornecedor.id}>
                  <td>{fornecedor.nome}</td>
                  <td>{fornecedor.contato ?? '-'}</td>
                  <td>
                    <button
                      type="button"
                      className="botao"
                      onClick={() => preencherEdicao(fornecedor)}
                    >
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