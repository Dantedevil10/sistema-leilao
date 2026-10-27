import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import socket from '../services/socket';
import { AuthContext } from '../contexts/AuthContext';
import type { Lot } from '../types';

interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  userId?: string;
  bidderTag?: string; // Usado no histórico inicial
}

export default function LotRoom() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [lot, setLot] = useState<Lot | null>(null);
  const [history, setHistory] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState('');

  // Busca os dados iniciais do lote e histórico
  useEffect(() => {
    const fetchLotData = async () => {
      try {
        const lotRes = await api.get(`/lots/${id}`);
        setLot(lotRes.data);

        // Aproveita o endpoint de auditoria para carregar o histórico de lances
        const historyRes = await api.get(`/bids/audit/${id}`);
        setHistory(historyRes.data.history.reverse()); // Recentes primeiro
      } catch (err) {
        setError('Lote não encontrado.');
      } finally {
        setLoading(false);
      }
    };

    fetchLotData();
  }, [id]);

  // Configuração do WebSocket
  useEffect(() => {
    if (!id) return;

    socket.connect();
    socket.emit('joinLot', { lotId: id });

    socket.on('bidUpdated', (data: { bid: Bid; lot: Lot; timeExtended: boolean }) => {
      setLot(data.lot);
      setHistory((prev) => [data.bid, ...prev]);
      
      if (data.bid.userId === user?.id) {
        setFeedback('Lance aceito! Você está liderando.');
      }
    });

    socket.on('lotEnded', (data: { winnerId: string, finalPrice: number }) => {
      setLot((prev) => prev ? { ...prev, status: 'ENCERRADO', winnerId: data.winnerId } : null);
      if (data.winnerId === user?.id) {
        setFeedback('🎉 LEILÃO ENCERRADO! VOCÊ VENCEU!');
      } else {
        setFeedback('Leilão encerrado.');
      }
    });

    return () => {
      socket.emit('leaveLot', { lotId: id });
      socket.off('bidUpdated');
      socket.off('lotEnded');
      socket.disconnect();
    };
  }, [id, user?.id]);

  // Cronômetro de tempo restante
  useEffect(() => {
    if (!lot) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(lot.endTime).getTime();
      const start = new Date(lot.startTime).getTime();

      if (lot.status === 'ENCERRADO' || now > end) {
        setTimeLeft('Encerrado');
        clearInterval(timer);
      } else if (now < start) {
        setTimeLeft('Ainda não começou');
      } else {
        const distance = end - now;
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s restantes`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lot]);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setFeedback('');
    socket.emit('sendBid', { lotId: id, amount: Number(bidAmount), userId: user?.id }, (response: any) => {
      if (response.status === 'ERROR') {
        setFeedback(response.message); // Exibe recusa do lance
      }
    });
    
    setBidAmount('');
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="text-center mt-10">Carregando sala...</div>;
  if (error || !lot) return <div className="text-center mt-10 text-red-500">{error}</div>;

  const isWinner = lot.winnerId === user?.id;

  return (
    <div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Coluna da Esquerda: Produto e Lance */}
      <div className="md:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded shadow flex flex-col items-center relative">
          <div className={`absolute top-4 right-4 px-3 py-1 font-bold rounded ${lot.status === 'AO_VIVO' ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-500 text-white'}`}>
            {lot.status === 'AO_VIVO' ? timeLeft : 'Encerrado'}
          </div>
          <Link to={`/audit/${id}`} className="mt-2 inline-block text-sm text-blue-600 hover:underline">🔍 Ver Auditoria Pública deste Lote</Link>

          <img src={lot.imageUrl} alt={lot.title} className="max-h-64 object-contain mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-center">{lot.title}</h2>
          <p className="text-gray-600 mb-6 text-center">{lot.description}</p>

          <div className="w-full bg-gray-100 p-4 rounded-lg flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-500 text-sm">Lance Atual</p>
              <p className="text-4xl font-bold text-green-600">{formatCurrency(lot.currentPrice)}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Incremento Mínimo: {formatCurrency(lot.minIncrement)}</p>
            </div>
          </div>

          {/* Feedback Visual: Ganhando / Superado */}
          {user?.role === 'LICITANTE' && lot.status === 'AO_VIVO' && (
            <div className={`w-full p-3 text-center rounded font-bold mb-4 ${isWinner ? 'bg-green-100 text-green-700 border border-green-400' : 'bg-yellow-100 text-yellow-700 border border-yellow-400'}`}>
              {isWinner ? '🏆 Você está ganhando!' : '⚠️ Você foi superado ou ainda não deu lances.'}
            </div>
          )}

          {feedback && <div className="w-full text-center text-sm font-bold text-red-600 mb-4">{feedback}</div>}

          {/* Formulário de Lance (Apenas Licitantes em Lotes Ao Vivo) */}
          {user?.role !== 'LEILOEIRO' && lot.status === 'AO_VIVO' && (
            <form onSubmit={handlePlaceBid} className="w-full flex gap-4">
              <input
                type="number"
                step="0.01"
                min={Number(lot.currentPrice) + (history.length > 0 ? Number(lot.minIncrement) : 0)}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Valor do Lance"
                required
                className="flex-grow border p-3 rounded font-bold text-lg"
              />
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded transition">
                Dar Lance
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Coluna da Direita: Histórico de Lances */}
      <div className="bg-white p-6 rounded shadow h-[80vh] flex flex-col">
        <h3 className="text-xl font-bold border-b pb-2 mb-4 text-gray-800">Histórico Ao Vivo</h3>
        
        <div className="flex-grow overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">Nenhum lance dado ainda. Seja o primeiro!</p>
          ) : (
            history.map((bid, index) => (
              <div key={bid.id} className={`p-3 rounded border ${index === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold ${index === 0 ? 'text-green-700' : 'text-gray-700'}`}>
                    {formatCurrency(bid.amount)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(bid.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {bid.bidderTag || (bid.userId === user?.id ? 'Você' : `Licitante (Final ${bid.userId?.slice(-4) || ''})`)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}