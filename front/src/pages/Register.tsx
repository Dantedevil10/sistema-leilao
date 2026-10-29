import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'LICITANTE' | 'LEILOEIRO'>('LICITANTE');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
        role,
      });

      alert('Cadastro realizado com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Criar Conta</h2>
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-semibold">Nome Completo</label>
            <input
              type="text"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm font-semibold">E-mail</label>
            <input
              type="email"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm font-semibold">Senha</label>
            <input
              type="password"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm font-semibold">Tipo de Perfil</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'LICITANTE' | 'LEILOEIRO')}
              disabled={loading}
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="LICITANTE">Licitante (Cliente que dá lances)</option>
              <option value="LEILOEIRO">Leiloeiro (Vendedor que cria lotes)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Cadastrando...
              </>
            ) : (
              'Cadastrar'
            )}
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">
            Faça Login
          </Link>
        </p>
      </div>
    </div>
  );
}