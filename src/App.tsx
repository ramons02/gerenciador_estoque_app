import { ProdutosPage } from './features/produtos/ProdutosPage'
import './App.css'

function App() {
  return (
    <main className="app">
      <header className="cabecalho">
        <h1>Gerenciador de Estoque</h1>
      </header>
      <ProdutosPage />
    </main>
  )
}

export default App