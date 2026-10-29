import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Lot } from '../types';

interface ExternalItem {
  id: number;
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
}

export default function DashboardLeiloeiro() {
  const [activeTab, setActiveTab] = useState<'CREATE' | 'MY_LOTS'>('CREATE');

  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<ExternalItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [selectedItem, setSelectedItem] = useState<ExternalItem | null>(null);
  const [initialPrice, setInitialPrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [myLots, setMyLots] = useState<Lot[]>([]);
  const [walletTotal, setWalletTotal] = useState(0);

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchDashboardData = async () => {
    try {
      const [lotsRes, walletRes] = await Promise.all([
        api.get('/lots/leiloeiro'),
        api.get('/wallet/me'),
      ]);
      setMyLots(lotsRes.data);
      setWalletTotal(walletRes.data.saldoTotal);
    } catch (err) {
      console.error('Erro ao carregar dados do leiloeiro:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSearch(true);
    setFeedback({ type: '', message: '' });
    try {
      const response = await api.get(`/external-items?q=${searchQuery}`);
      setItems(response.data);
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao buscar itens na API externa.' });
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setFeedback({ type: '', message: '' });
    try {
      await api.post('/lots', {
        externalItemId: selectedItem.id.toString(),
        title: selectedItem.title,
        description: selectedItem.description,
        imageUrl: selectedItem.image,
        attributes: { category: selectedItem.category, originalPrice: selectedItem.price },
        initialPrice: Number(initialPrice),
        minIncrement: Number(minIncrement),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      });

      setFeedback({ type: 'success', message: 'Lote criado com sucesso!' });
      setSelectedItem(null);
      setInitialPrice('');
      setMinIncrement('');
      setStartTime('');
      setEndTime('');
      fetchDashboardData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Erro ao criar lote.' });
    }
  };

  const handleCancelLot = async (lotId: string) => {
    if (!window.confirm('Deseja realmente cancelar este lote? (Os lances ativos serão estornados automaticamente)')) return;
    try {
      await api.patch(`/lots/${lotId}/cancel`);
      setFeedback({ type: 'success', message: 'Lote cancelado e estorno realizado com sucesso.' });
      fetchDashboardData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Erro ao cancelar lote.' });
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Painel do Leiloeiro</h2>
        <div className="bg-green-100 border border-green-300 px-6 py-3 rounded-lg text-right w-full md:w-auto shadow-sm">
          <p className="text-xs text-green-800 font-bold uppercase tracking-wider">Total Arrecadado</p>
          <p className="text-3xl font-black text-green-700">{formatCurrency(walletTotal)}</p>
        </div>
      </div>

      {feedback.message && (
        <div className={`p-4 mb-6 rounded ${feedback.type === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-green-100 text-green-700 border border-green-300'}`}>
          {feedback.message}
        </div>
      )}

      <div className="flex border-b mb-6 gap-4">
        <button
          onClick={() => setActiveTab('CREATE')}
          className={`pb-3 px-4 font-bold text-lg transition ${
            activeTab === 'CREATE'
              ? 'border-b-4 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          ➕ Adicionar Novos Produtos
        </button>
        <button
          onClick={() => setActiveTab('MY_LOTS')}
          className={`pb-3 px-4 font-bold text-lg transition ${
            activeTab === 'MY_LOTS'
              ? 'border-b-4 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📦 Meus Lotes e Resultados ({myLots.length})
        </button>
      </div>

      {activeTab === 'CREATE' && (
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Buscar novo item para leilão</h3>
            <p className="text-sm text-gray-500 mb-4">Pesquise produtos na API externa para transformá-los em lotes.</p>
            <form onSubmit={handleSearch} className="flex gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite o nome do produto (deixe em branco para listar todos)"
                className="flex-grow border border-gray-300 p-3 rounded focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loadingSearch}
                className="bg-blue-600 text-white font-bold px-8 py-3 rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loadingSearch ? 'Buscando...' : 'Buscar'}
              </button>
            </form>
          </div>

          {items.length > 0 && !selectedItem && (
            <div className="mb-8">
              <h4 className="text-lg font-bold text-gray-700 mb-4">Itens encontrados ({items.length}):</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
                    <div>
                      <img src={item.image} alt={item.title} className="h-40 object-contain mb-4 mx-auto" />
                      <h4 className="font-bold text-gray-800 line-clamp-2 mb-2" title={item.title}>
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-3">{item.description}</p>
                    </div>
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="w-full bg-indigo-600 text-white font-bold py-2 rounded hover:bg-indigo-700 transition"
                    >
                      Transformar em Lote
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedItem && (
            <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-indigo-600 mb-8">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Item Selecionado</span>
                  <h3 className="text-xl font-bold text-gray-800">{selectedItem.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-red-500 font-semibold"
                >
                  ✕ Cancelar
                </button>
              </div>

              <form onSubmit={handleCreateLot} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Lance Inicial (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={initialPrice}
                    onChange={(e) => setInitialPrice(e.target.value)}
                    placeholder="Ex: 150.00"
                    required
                    className="w-full border border-gray-300 p-2.5 rounded focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Incremento Mínimo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={minIncrement}
                    onChange={(e) => setMinIncrement(e.target.value)}
                    placeholder="Ex: 10.00"
                    required
                    className="w-full border border-gray-300 p-2.5 rounded focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Data e Hora de Início</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full border border-gray-300 p-2.5 rounded focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Data e Hora de Término</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full border border-gray-300 p-2.5 rounded focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2 mt-2">
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3.5 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-md"
                  >
                    🚀 Publicar Lote no Leilão
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'MY_LOTS' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Gerenciar Lotes Criados</h3>
          {myLots.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Você ainda não criou nenhum lote.</p>
          ) : (
            <div className="space-y-4">
              {myLots.map((lot) => (
                <div
                  key={lot.id}
                  className={`p-4 rounded-lg border-l-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                    lot.status === 'AO_VIVO'
                      ? 'border-red-500 bg-red-50/30'
                      : lot.status === 'ENCERRADO'
                      ? 'border-gray-500 bg-gray-50'
                      : lot.status === 'CANCELADO'
                      ? 'border-gray-300 bg-gray-100 opacity-60'
                      : 'border-blue-500 bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img src={lot.imageUrl} alt={lot.title} className="h-16 w-16 object-contain rounded bg-white p-1 border" />
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{lot.title}</h4>
                      <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2 mt-0.5">
                        <span>Status: <span className="font-semibold uppercase">{lot.status}</span></span>
                        
                        {lot.status === 'CANCELADO' ? (
                          <span className="text-red-500 font-bold ml-1">(Lote Cancelado)</span>
                        ) : lot.status === 'ENCERRADO' ? (
                          lot.winnerId ? (
                            <span>
                              | Valor Final Arrematado:{' '}
                              <span className="font-bold text-green-700">{formatCurrency(lot.currentPrice)}</span>
                            </span>
                          ) : (
                            <span className="text-amber-600 font-bold ml-1">
                              | Não Arrematado (Sem Lances)
                            </span>
                          )
                        ) : (
                          <span>
                            | {lot.status === 'AGENDADO' ? 'Lance Inicial' : 'Lance Atual'}:{' '}
                            <span className="font-bold text-green-700">{formatCurrency(lot.currentPrice)}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Início: {new Date(lot.startTime).toLocaleString()} | Fim: {new Date(lot.endTime).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <Link
                      to={`/lot/${lot.id}`}
                      className="bg-gray-100 text-gray-800 px-4 py-2 rounded text-sm font-semibold hover:bg-gray-200 transition"
                    >
                      Acessar Sala
                    </Link>
                    {lot.status !== 'ENCERRADO' && lot.status !== 'CANCELADO' && (
                      <button
                        onClick={() => handleCancelLot(lot.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-red-600 transition"
                      >
                        Cancelar Lote
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}