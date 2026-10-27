import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Lot } from '../types';

export default function MyArremates() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWonLots = async () => {
      try {
        const response = await api.get('/lots/won');
        setLots(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWonLots();
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="text-center mt-10">Carregando arremates...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-2 mb-6">Meus Arremates</h2>

      {lots.length === 0 ? (
        <p className="text-gray-500 text-center">Você ainda não arrematou nenhum lote.</p>
      ) : (
        <div className="space-y-6">
          {lots.map((lot) => (
            <div key={lot.id} className="bg-white p-6 rounded shadow flex flex-col md:flex-row gap-6 items-center border-l-4 border-green-500 relative">
              <img src={lot.imageUrl} alt={lot.title} className="h-32 object-contain" />
              
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{lot.title}</h3>
                <p className="text-gray-600 mb-1">Encerrado em: {new Date(lot.endTime).toLocaleString()}</p>
                <p className="text-green-600 font-bold text-2xl">{formatCurrency(lot.currentPrice)}</p>
              </div>

              <div className="flex flex-col gap-2 w-full md:w-auto">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/audit/${lot.id}`);
                    alert('Link de auditoria pública copiado para compartilhar o arremate!');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition whitespace-nowrap"
                >
                  🔗 Compartilhar Comprovante
                </button>
                <Link 
                  to={`/audit/${lot.id}`}
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition text-center whitespace-nowrap"
                >
                  Ver Auditoria
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}