import { useState } from 'react'
import { ProdutosPage } from './features/produtos/ProdutosPage'
import { FornecedoresPage } from './features/fornecedores/FornecedoresPage'
import './App.css'

type Pagina = 'produtos' | 'fornecedores'

function App() {
  const [pagina, setPagina] = useState<Pagina>('produtos')

  return (
    <main className="app">
      <header className="cabecalho">
        <h1>Gerenciador de Estoque</h1>
        <nav className="navegacao">
          <button
            type="button"
            className={pagina === 'produtos' ? 'link-nav ativo' : 'link-nav'}
            onClick={() => setPagina('produtos')}
          >
            Produtos
          </button>
          <button
            type="button"
            className={pagina === 'fornecedores' ? 'link-nav ativo' : 'link-nav'}
            onClick={() => setPagina('fornecedores')}
          >
            Fornecedores
          </button>
        </nav>
      </header>
      {pagina === 'produtos' ? <ProdutosPage /> : <FornecedoresPage />}
    </main>
  )
}

export default App