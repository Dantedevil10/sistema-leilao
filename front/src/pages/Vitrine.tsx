import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Lot } from '../types';
import LotCard from '../components/LotCard';

export default function Vitrine() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLots = async (query = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/lots/vitrine${query ? `?search=${query}` : ''}`);
      setLots(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLots(search);
  };

  const lotesAoVivo = lots.filter(lot => lot.status === 'AO_VIVO');
  const lotesAgendados = lots.filter(lot => lot.status === 'AGENDADO');
  const lotesEncerrados = lots.filter(lot => lot.status === 'ENCERRADO');

  const Section = ({ title, icon, data }: { title: string; icon: string; data: Lot[] }) => {
    if (data.length === 0) return null;
    return (
      <div className="mb-12">
        <div className="flex items-center gap-3 border-b-2 border-gray-200 dark:border-gray-700 pb-3 mb-6">
          <span className="text-3xl">{icon}</span>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
          <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-bold">
            {data.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {data.map(lot => <LotCard key={lot.id} lot={lot} />)}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Hero Banner Elegante */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-xl p-10 md:p-16 mb-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 relative z-10">
          Descubra itens únicos em leilão.
        </h1>
        <p className="text-blue-100 dark:text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 relative z-10 font-light">
          Acompanhe lotes ao vivo, dispute arremates em tempo real e verifique a autenticidade através de auditoria criptográfica.
        </p>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 relative z-10">
          <input
            type="text"
            placeholder="O que está à procura hoje?"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow bg-white/95 dark:bg-gray-800/95 text-gray-900 dark:text-white border-0 p-4 rounded-xl focus:ring-4 focus:ring-blue-400/50 shadow-lg text-lg"
          />
          <button type="submit" className="bg-blue-500 hover:bg-blue-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg">
            Pesquisar
          </button>
        </form>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      ) : lots.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-20 text-lg">
          Nenhum lote corresponde à sua pesquisa.
        </div>
      ) : (
        <>
          <Section title="A Decorrer Agora" icon="🔴" data={lotesAoVivo} />
          <Section title="Próximos Lotes" icon="🗓️" data={lotesAgendados} />
          <Section title="Leilões Encerrados" icon="🔨" data={lotesEncerrados} />
        </>
      )}
    </div>
  );
}