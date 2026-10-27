
import './App.css'

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
 

  return (
    <Router>
      <nav className="p-4 bg-blue-600 text-white flex justify-between shadow-md">
        <div className="font-bold text-xl">Casa de Leilões Verzel</div>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Vitrine</Link>
          <Link to="/audit/fake-id" className="hover:underline">Auditoria</Link>
          <Link to="/login" className="bg-white text-blue-600 px-3 py-1 rounded">Login</Link>
        </div>
      </nav>

      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<h1 className="text-2xl font-bold">Vitrine de Lotes em breve...</h1>} />
          <Route path="/login" element={<h1 className="text-2xl">Página de Login</h1>} />
          <Route path="/lot/:id" element={<h1 className="text-2xl">Sala do Lote (Ao Vivo)</h1>} />
          <Route path="/leiloeiro" element={<h1 className="text-2xl">Painel do Leiloeiro</h1>} />
          <Route path="/wallet" element={<h1 className="text-2xl">Carteira do Licitante</h1>} />
          <Route path="/audit/:lotId" element={<h1 className="text-2xl">Auditoria do Lote</h1>} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
