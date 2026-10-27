import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';

import Vitrine from './pages/Vitrine';

function App() {
  const { user, logout, isAuthenticated } = useContext(AuthContext);

  return (
    <Router>
      <nav className="p-4 bg-blue-600 text-white flex justify-between shadow-md items-center">
        <div className="font-bold text-xl">Casa de Leilões Verzel</div>
        <div className="space-x-4 flex items-center">
          <Link to="/" className="hover:underline">Vitrine</Link>
          <Link to="/audit/fake-id" className="hover:underline">Auditoria</Link>
          
          {isAuthenticated ? (
            <>
              {user?.role === 'LEILOEIRO' && (
                <Link to="/leiloeiro" className="hover:underline">Painel Leiloeiro</Link>
              )}
              {user?.role === 'LICITANTE' && (
                <Link to="/wallet" className="hover:underline">Carteira</Link>
              )}
              <span className="text-sm opacity-75 ml-4">Olá, {user?.name}</span>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded ml-2 transition"
              >
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-white text-blue-600 px-3 py-1 rounded font-semibold hover:bg-gray-100 transition">
              Login
            </Link>
          )}
        </div>
      </nav>

      <main className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Vitrine />} />
          <Route path="/login" element={<Login />} />
          <Route path="/lot/:id" element={<h1 className="text-2xl">Sala do Lote (Ao Vivo)</h1>} />
          <Route path="/leiloeiro" element={<h1 className="text-2xl">Painel do Leiloeiro</h1>} />
          <Route path="/wallet" element={<h1 className="text-2xl">Carteira do Licitante</h1>} />
          <Route path="/audit/:lotId" element={<h1 className="text-2xl">Auditoria do Lote</h1>} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;