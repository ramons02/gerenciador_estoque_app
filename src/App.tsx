import { useState } from 'react'
import { CarregamentosPage } from './features/carregamentos/CarregamentosPage'
import { ClientesPage } from './features/clientes/ClientesPage'
import { ConfiguracoesPage } from './features/configuracoes/ConfiguracoesPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { EstoquePage } from './features/estoque/EstoquePage'
import { FornecedoresPage } from './features/fornecedores/FornecedoresPage'
import { ProdutosPage } from './features/produtos/ProdutosPage'
import { RelatoriosPage } from './features/relatorios/RelatoriosPage'
import { VendasPage } from './features/vendas/VendasPage'
import './App.css'

type Pagina =
  | 'dashboard'
  | 'vendas'
  | 'produtos'
  | 'fornecedores'
  | 'clientes'
  | 'carregamentos'
  | 'estoque'
  | 'relatorios'
  | 'configuracoes'

const PAGINAS: { id: Pagina; rotulo: string }[] = [
  { id: 'dashboard', rotulo: 'Dashboard' },
  { id: 'vendas', rotulo: 'Vendas' },
  { id: 'carregamentos', rotulo: 'Chegada de caminhao' },
  { id: 'produtos', rotulo: 'Produtos' },
  { id: 'estoque', rotulo: 'Estoque' },
  { id: 'clientes', rotulo: 'Clientes' },
  { id: 'fornecedores', rotulo: 'Fornecedores' },
  { id: 'relatorios', rotulo: 'Relatorios' },
  { id: 'configuracoes', rotulo: 'Configuracoes' },
]

function App() {
  const [pagina, setPagina] = useState<Pagina>('dashboard')

  return (
    <main className="app">
      <header className="cabecalho">
        <h1>Gerenciador de Estoque</h1>
        <nav className="navegacao">
          {PAGINAS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={pagina === item.id ? 'link-nav ativo' : 'link-nav'}
              onClick={() => setPagina(item.id)}
            >
              {item.rotulo}
            </button>
          ))}
        </nav>
      </header>
      {pagina === 'dashboard' && <DashboardPage />}
      {pagina === 'vendas' && <VendasPage />}
      {pagina === 'carregamentos' && <CarregamentosPage />}
      {pagina === 'produtos' && <ProdutosPage />}
      {pagina === 'estoque' && <EstoquePage />}
      {pagina === 'clientes' && <ClientesPage />}
      {pagina === 'fornecedores' && <FornecedoresPage />}
      {pagina === 'relatorios' && <RelatoriosPage />}
      {pagina === 'configuracoes' && <ConfiguracoesPage />}
    </main>
  )
}

export default App