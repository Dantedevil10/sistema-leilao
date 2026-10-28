import { useEffect, useState } from 'react';
import api from '../services/api';


interface WalletData {
  saldoTotal: number;
  saldoComprometido: number;
  saldoDisponivel: number;
}

export default function Wallet() {
  
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWallet = async () => {
    try {
      const response = await api.get('/wallet/me');
      setWallet(response.data);
    } catch (err) {
      setError('Erro ao carregar a carteira.');
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/wallet/deposit', { amount: Number(depositAmount) });
      setDepositAmount('');
      fetchWallet(); // Recarrega os dados após depósito
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao depositar.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (!wallet) return <div className="text-center mt-10">Carregando carteira...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Minha Carteira</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow-md border-t-4 border-blue-500">
          <p className="text-gray-500 text-sm">Saldo Total</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(wallet.saldoTotal)}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-md border-t-4 border-yellow-500">
          <p className="text-gray-500 text-sm" title="Retido em lances que você está ganhando">Saldo Comprometido</p>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(wallet.saldoComprometido)}</p>
        </div>
        <div className="bg-white p-6 rounded shadow-md border-t-4 border-green-500">
          <p className="text-gray-500 text-sm">Saldo Disponível</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(wallet.saldoDisponivel)}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow-md">
        <h3 className="text-xl font-bold text-gray-700 mb-4">Adicionar Fundos Simulados</h3>
        <form onSubmit={handleDeposit} className="flex gap-4">
          <input
            type="number"
            min="1"
            step="0.01"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Valor ex: 1000.00"
            className="flex-grow border border-gray-300 p-2 rounded focus:outline-none focus:border-green-500"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
          >
            Depositar
          </button>
        </form>
      </div>
    </div>
  );
}