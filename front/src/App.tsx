import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from './contexts/AuthContext';

import Vitrine from './pages/Vitrine';
import Login from './pages/Login';
import Wallet from './pages/Wallet';
import DashboardLeiloeiro from './pages/DashboardLeiloeiro';
import LotRoom from './pages/LotRoom';
import Audit from './pages/Audit';
import MyArremates from './pages/MyArremates';
import Register from './pages/Register';

function App() {
  const { user, logout, isAuthenticated } = useContext(AuthContext);
  
  // Estado do Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Estado do Pop-up de Aviso do Servidor
  const [showWakeupAlert, setShowWakeupAlert] = useState(true);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 relative">
      
      {/* Pop-up de Aviso sobre Hibernação do Backend */}
      {showWakeupAlert && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full relative border border-blue-200 dark:border-blue-900">
            {/* Botão de Fechar no topo */}
            <button 
              onClick={() => setShowWakeupAlert(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title="Fechar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full text-blue-600 dark:text-blue-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Aviso Importante</h2>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              Nosso sistema utiliza servidores que entram em modo de suspensão quando estão inativos.
              <br/><br/>
              Se o sistema estiver carregando e <strong>não apresentar nenhum erro</strong>, pedimos que aguarde em torno de <strong>50 segundos</strong>. Esse é o tempo necessário para o servidor "acordar" e tudo voltar aos conformes!
            </p>
            
            <button 
              onClick={() => setShowWakeupAlert(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md hover:shadow-lg"
            >
              Entendido, vou aguardar se precisar!
            </button>
          </div>
        </div>
      )}

      <Router>
        {/* Navbar Moderna e com suporte a Dark Mode */}
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                D.<span className="font-light">AUCTIONS</span>
              </span>
            </Link>

            <div className="flex items-center gap-6 font-medium text-sm">
              <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Vitrine</Link>
              
              {isAuthenticated ? (
                <>
                  {user?.role === 'LEILOEIRO' && (
                    <Link to="/leiloeiro" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Painel Leiloeiro</Link>
                  )}
                  {user?.role === 'LICITANTE' && (
                    <>
                      <Link to="/wallet" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Carteira</Link>
                      <Link to="/arremates" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Meus Arremates</Link>
                    </>
                  )}
                  
                  <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
                  
                  <span className="opacity-75">Olá, <span className="font-bold">{user?.name.split(' ')[0]}</span></span>
                  <button 
                    onClick={logout}
                    className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white px-4 py-1.5 rounded-full transition-all"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-blue-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all">
                  Entrar
                </Link>
              )}

              {/* Toggle Dark Mode */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                title={isDarkMode ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Vitrine />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/leiloeiro" element={<DashboardLeiloeiro />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/arremates" element={<MyArremates />} />
            <Route path="/lot/:id" element={<LotRoom />} />
            <Route path="/audit/:lotId" element={<Audit />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;