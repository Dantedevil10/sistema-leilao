import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Lot } from '../types';

export default function DashboardLeiloeiro() {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [myLots, setMyLots] = useState<Lot[]>([]);
  const [walletTotal, setWalletTotal] = useState(0);
  
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [form, setForm] = useState({ initialPrice: '', minIncrement: '', startTime: '', endTime: '' });

  const fetchData = async () => {
    const [lotsRes, walletRes] = await Promise.all([
      api.get('/lots/leiloeiro'),
      api.get('/wallet/me')
    ]);
    setMyLots(lotsRes.data);
    setWalletTotal(walletRes.data.saldoTotal);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancelLot = async (lotId: string) => {
    if (!window.confirm('Deseja realmente cancelar este lote? (Estornos automáticos serão feitos)')) return;
    try {
      await api.patch(`/lots/${lotId}/cancel`);
      alert('Lote cancelado com sucesso.');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao cancelar lote.');
    }
  };

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/lots', {
        externalItemId: selectedItem.id.toString(),
        title: selectedItem.title,
        description: selectedItem.description,
        imageUrl: selectedItem.image,
        attributes: { category: selectedItem.category },
        initialPrice: Number(form.initialPrice),
        minIncrement: Number(form.minIncrement),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      });
      alert('Lote criado com sucesso!');
      setSelectedItem(null);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar lote.');
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="flex justify-between items-end border-b pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Painel do Leiloeiro</h2>
        <div className="bg-green-100 border border-green-300 px-6 py-2 rounded text-right">
          <p className="text-sm text-green-800 font-bold">Total Arrecadado</p>
          <p className="text-2xl font-black text-green-700">{formatCurrency(walletTotal)}</p>
        </div>
      </div>

      {/* Buscar e Criar Lotes (Resumido para espaço) */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h3 className="text-lg font-bold mb-4">Criar Novo Lote (Busca Fake Store)</h3>
        <div className="flex gap-4 mb-4">
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar na API..." className="flex-grow border p-2 rounded" />
          <button onClick={async () => { const res = await api.get(`/external-items?q=${searchQuery}`); setItems(res.data); }} className="bg-blue-600 text-white px-4 rounded">Buscar API</button>
        </div>
        
        {items.length > 0 && !selectedItem && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.slice(0,4).map(item => (
              <div key={item.id} className="border p-2 rounded text-center">
                <img src={item.image} alt={item.title} className="h-16 mx-auto mb-2" />
                <button onClick={() => setSelectedItem(item)} className="bg-indigo-600 text-white w-full py-1 text-sm rounded">Selecionar</button>
              </div>
            ))}
          </div>
        )}

        {selectedItem && (
          <form onSubmit={handleCreateLot} className="mt-4 p-4 border rounded bg-gray-50 flex flex-wrap gap-4">
            <p className="w-full font-bold">Configurando: {selectedItem.title}</p>
            <input type="number" placeholder="Lance Inicial" onChange={e => setForm({...form, initialPrice: e.target.value})} required className="border p-2 rounded flex-grow" />
            <input type="number" placeholder="Incremento" onChange={e => setForm({...form, minIncrement: e.target.value})} required className="border p-2 rounded flex-grow" />
            <input type="datetime-local" onChange={e => setForm({...form, startTime: e.target.value})} required className="border p-2 rounded flex-grow" />
            <input type="datetime-local" onChange={e => setForm({...form, endTime: e.target.value})} required className="border p-2 rounded flex-grow" />
            <div className="w-full flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded flex-grow">Publicar</button>
              <button type="button" onClick={() => setSelectedItem(null)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancelar</button>
            </div>
          </form>
        )}
      </div>

      <h3 className="text-2xl font-bold mb-4">Meus Lotes e Resultados</h3>
      <div className="space-y-4">
        {myLots.map(lot => (
          <div key={lot.id} className="bg-white p-4 rounded shadow flex justify-between items-center border-l-4 border-indigo-500">
            <div>
              <p className="font-bold text-lg">{lot.title}</p>
              <p className="text-sm text-gray-500">Status: {lot.status} | {lot.status === 'ENCERRADO' ? 'Valor Arrematado' : 'Lance Atual'}: {formatCurrency(lot.currentPrice)}</p>
            </div>
            <div className="flex gap-2">
              <Link to={`/lot/${lot.id}`} className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200">Ver Sala</Link>
              {lot.status !== 'ENCERRADO' && lot.status !== 'CANCELADO' && (
                <button onClick={() => handleCancelLot(lot.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Cancelar Lote</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}