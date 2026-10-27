import React, { useState } from 'react';
import api from '../services/api';

interface ExternalItem {
  id: number;
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
}

export default function DashboardLeiloeiro() {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<ExternalItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado para o formulário de criação de lote
  const [selectedItem, setSelectedItem] = useState<ExternalItem | null>(null);
  const [initialPrice, setInitialPrice] = useState('');
  const [minIncrement, setMinIncrement] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.get(`/external-items?q=${searchQuery}`);
      setItems(response.data);
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao buscar itens.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

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
      setSelectedItem(null); // Fecha o formulário
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Erro ao criar lote.' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-6">
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-2 mb-6">Painel do Leiloeiro</h2>

      {feedback.message && (
        <div className={`p-4 mb-6 rounded ${feedback.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {feedback.message}
        </div>
      )}

      {/* Busca na API Externa */}
      <div className="bg-white p-6 rounded shadow-md mb-8">
        <h3 className="text-xl font-bold mb-4">Buscar novo item para leilão</h3>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite o nome do produto (deixe em branco para listar todos)"
            className="flex-grow border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>

      {/* Grid de Resultados */}
      {items.length > 0 && !selectedItem && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded shadow-md p-4 flex flex-col">
              <img src={item.image} alt={item.title} className="h-32 object-contain mb-4 mx-auto" />
              <h4 className="font-bold text-gray-800 line-clamp-2 mb-2" title={item.title}>{item.title}</h4>
              <p className="text-sm text-gray-500 mt-auto mb-4 line-clamp-3">{item.description}</p>
              <button 
                onClick={() => setSelectedItem(item)}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
              >
                Transformar em Lote
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulário de Criação de Lote */}
      {selectedItem && (
        <div className="bg-white p-6 rounded shadow-md border-t-4 border-indigo-600">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">Configurar Lote: {selectedItem.title}</h3>
            <button onClick={() => setSelectedItem(null)} className="text-gray-500 hover:text-red-500">Cancelar</button>
          </div>
          
          <form onSubmit={handleCreateLot} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Lance Inicial (R$)</label>
              <input type="number" step="0.01" value={initialPrice} onChange={(e) => setInitialPrice(e.target.value)} required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Incremento Mínimo (R$)</label>
              <input type="number" step="0.01" value={minIncrement} onChange={(e) => setMinIncrement(e.target.value)} required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Data e Hora de Início</label>
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Data e Hora de Fim</label>
              <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="w-full border p-2 rounded" />
            </div>
            
            <div className="md:col-span-2 mt-4">
              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition">
                Publicar Lote
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}