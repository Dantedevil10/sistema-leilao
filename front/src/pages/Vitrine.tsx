import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Lot } from '../types';
import LotCard from '../components/LotCard';

export default function Vitrine() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [carouselLots, setCarouselLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Filtros de exibição
  const [filters, setFilters] = useState({
    AO_VIVO: true,
    AGENDADO: true,
    ENCERRADO: true,
  });

  const fetchLots = async (query = '') => {
    setLoading(true);
    try {
      const response = await api.get(`/lots/vitrine${query ? `?search=${query}` : ''}`);
      const data = response.data;
      setLots(data);
      
      // Sorteia até 5 itens para o carrossel apenas na primeira carga
      if (!query && carouselLots.length === 0) {
        const randomLots = [...data].sort(() => 0.5 - Math.random()).slice(0, 5);
        setCarouselLots(randomLots);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchLots();
  }, []);

  // Busca reativa com Debounce (Dispara ao digitar e limpa sozinho se apagar o input)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLots(search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLots(search);
  };

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const lotesAoVivo = lots.filter(lot => lot.status === 'AO_VIVO');
  const lotesAgendados = lots.filter(lot => lot.status === 'AGENDADO');
  const lotesEncerrados = lots.filter(lot => lot.status === 'ENCERRADO');

  const Section = ({ title, data, isVisible }: { title: string; data: Lot[], isVisible: boolean }) => {
    if (!isVisible || data.length === 0) return null;
    return (
      <div className="mb-10">
        <div className="border-b-2 border-gray-300 pb-2 mb-4 flex items-center gap-2">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">{title}</h2>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs font-bold">
            {data.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map(lot => <LotCard key={lot.id} lot={lot} />)}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* 1. Busca no Topo */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-200 dark:border-gray-700 rounded-md mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Pesquisar lotes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 p-3 rounded-md focus:outline-none focus:border-blue-500 text-gray-800 dark:text-gray-100"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md font-bold transition-colors">
            Buscar
          </button>
        </form>
      </div>

      {/* 2. Carrossel de Destaques Aleatórios (se não estiver buscando) */}
      {!search && carouselLots.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">Destaques</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300">
            {carouselLots.map(lot => (
              <div key={lot.id} className="snap-start shrink-0 w-72">
                <LotCard lot={lot} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Marcadores/Filtros de Exibição */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 mb-6 flex flex-wrap gap-4 items-center">
        <span className="font-bold text-gray-700 dark:text-gray-300 text-sm uppercase">
          Exibir nas listagens:
        </span>

        <label
          className={`flex items-center gap-2 cursor-pointer select-none text-sm font-semibold px-3 py-2 rounded-md border transition-colors ${
            filters.AO_VIVO
              ? 'border-blue-500 text-blue-700 dark:text-blue-300'
              : 'border-transparent text-gray-800 dark:text-gray-200'
          }`}
        >
          <input
            type="checkbox"
            checked={filters.AO_VIVO}
            onChange={() => toggleFilter('AO_VIVO')}
            className="hidden"
          />
          🔴 Ao Vivo
        </label>

        <label
          className={`flex items-center gap-2 cursor-pointer select-none text-sm font-semibold px-3 py-2 rounded-md border transition-colors ${
            filters.AGENDADO
              ? 'border-blue-500 text-blue-700 dark:text-blue-300'
              : 'border-transparent text-gray-800 dark:text-gray-200'
          }`}
        >
          <input
            type="checkbox"
            checked={filters.AGENDADO}
            onChange={() => toggleFilter('AGENDADO')}
            className="hidden"
          />
          🗓️ Agendados
        </label>

        <label
          className={`flex items-center gap-2 cursor-pointer select-none text-sm font-semibold px-3 py-2 rounded-md border transition-colors ${
            filters.ENCERRADO
              ? 'border-blue-500 text-blue-700 dark:text-blue-300'
              : 'border-transparent text-gray-800 dark:text-gray-200'
          }`}
        >
          <input
            type="checkbox"
            checked={filters.ENCERRADO}
            onChange={() => toggleFilter('ENCERRADO')}
            className="hidden"
          />
          🔨 Encerrados
        </label>
      </div>

      {/* 4. Listagem Filtrada */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 font-bold">Carregando lotes...</div>
      ) : lots.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border-2 border-dashed border-gray-300 rounded-md">Nenhum lote corresponde à pesquisa.</div>
      ) : (
        <>
          <Section title="🔴 Ao Vivo Agora" data={lotesAoVivo} isVisible={filters.AO_VIVO} />
          <Section title="🗓️ Em Breve" data={lotesAgendados} isVisible={filters.AGENDADO} />
          <Section title="🔨 Encerrados" data={lotesEncerrados} isVisible={filters.ENCERRADO} />
        </>
      )}
    </div>
  );
}