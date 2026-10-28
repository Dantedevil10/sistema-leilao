import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Lot } from '../types';

export default function MyArremates() {
  const [wonLots, setWonLots] = useState<Lot[]>([]);
  const [participatedLots, setParticipatedLots] = useState<Lot[]>([]);
  const [activeTab, setActiveTab] = useState<'WON' | 'PARTICIPATED'>('WON');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wonRes, partRes] = await Promise.all([
          api.get('/lots/won'),
          api.get('/lots/participated')
        ]);
        setWonLots(wonRes.data);
        setParticipatedLots(partRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="text-center mt-10">Carregando seus registros...</div>;

  const renderLotList = (lots: Lot[], isWonTab: boolean) => {
    if (lots.length === 0) return <p className="text-gray-500 text-center py-10">Nenhum lote encontrado nesta categoria.</p>;
    
    return lots.map((lot) => (
      <div key={lot.id} className={`bg-white p-6 rounded shadow flex flex-col md:flex-row gap-6 items-center border-l-4 ${isWonTab ? 'border-green-500' : 'border-blue-500'} relative mb-4`}>
        <img src={lot.imageUrl} alt={lot.title} className="h-24 object-contain w-24" />
        <div className="flex-grow">
          <h3 className="text-lg font-bold text-gray-800">{lot.title}</h3>
          <p className="text-sm text-gray-500">Status: {lot.status}</p>
          <p className={`font-bold text-xl ${isWonTab ? 'text-green-600' : 'text-gray-700'}`}>
            Lance Final / Atual: {formatCurrency(lot.currentPrice)}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {isWonTab && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/audit/${lot.id}`);
                alert('Link de comprovante copiado!');
              }}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
            >🔗 Comprovante</button>
          )}
          <Link to={`/lot/${lot.id}`} className="bg-gray-100 text-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-200 text-center">
            Acessar Sala
          </Link>
        </div>
      </div>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Painel do Licitante</h2>

      <div className="flex border-b mb-6 gap-4">
        <button 
          className={`pb-2 font-bold ${activeTab === 'WON' ? 'border-b-4 border-green-500 text-green-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('WON')}
        >🏆 Meus Arremates Vencidos</button>
        <button 
          className={`pb-2 font-bold ${activeTab === 'PARTICIPATED' ? 'border-b-4 border-blue-500 text-blue-700' : 'text-gray-500'}`}
          onClick={() => setActiveTab('PARTICIPATED')}
        >📜 Lotes que dei lance</button>
      </div>

      <div>
        {activeTab === 'WON' ? renderLotList(wonLots, true) : renderLotList(participatedLots, false)}
      </div>
    </div>
  );
}