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

  const Section = ({ title, data }: { title: string; data: Lot[] }) => {
    if (data.length === 0) return null;
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold border-b pb-2 mb-4 text-gray-700">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.map(lot => <LotCard key={lot.id} lot={lot} />)}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-2 text-center">Bem-vindo à Casa de Leilões Verzel</h1>
        
        <form onSubmit={handleSearch} className="mt-6 max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Buscar lote por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow border border-gray-300 p-3 rounded focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 rounded hover:bg-blue-700 font-bold">
            Buscar
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center mt-10">Carregando vitrine...</div>
      ) : lots.length === 0 ? (
        <div className="text-center text-gray-500">Nenhum lote encontrado.</div>
      ) : (
        <>
          <Section title="🔴 Ao Vivo Agora" data={lotesAoVivo} />
          <Section title="🗓️ Em Breve (Agendados)" data={lotesAgendados} />
          <Section title="🔨 Encerrados" data={lotesEncerrados} />
        </>
      )}
    </div>
  );
}