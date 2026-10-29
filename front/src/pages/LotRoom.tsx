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
  bidderTag?: string;
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
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  useEffect(() => {
    const fetchLotData = async () => {
      try {
        const lotRes = await api.get(`/lots/${id}`);
        setLot(lotRes.data);

        const historyRes = await api.get(`/bids/audit/${id}`);
        setHistory(historyRes.data.history.reverse());
      } catch (err) {
        setError('Lote não encontrado.');
      } finally {
        setLoading(false);
      }
    };

    fetchLotData();
  }, [id]);

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

  useEffect(() => {
    if (!lot) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(lot.endTime).getTime();
      const start = new Date(lot.startTime).getTime();

      if (lot.status === 'CANCELADO') {
        setTimeLeft('Cancelado');
        clearInterval(timer);
      } else if (lot.status === 'ENCERRADO' || now > end) {
        setTimeLeft('Encerrado');
        clearInterval(timer);
      } else if (now < start) {
        const distance = start - now;
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`Começa em: ${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`);
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
    setIsSubmittingBid(true);

    socket.emit('sendBid', { lotId: id, amount: Number(bidAmount), userId: user?.id }, (response: any) => {
      setIsSubmittingBid(false);
      
      if (response?.status === 'ERROR') {
        setFeedback(response.message);
      } else {
        setBidAmount('');
      }
    });
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="text-center mt-10">Carregando sala...</div>;
  if (error || !lot) return <div className="text-center mt-10 text-red-500">{error}</div>;

  const isWinner = lot.winnerId === user?.id;

  return (
    <div className="max-w-7xl mx-auto mt-2">
      <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 mb-6 transition">
        ← Voltar à Vitrine
      </Link>

      <Link to={`/audit/${id}`} className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition font-semibold">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        Aceder à Auditoria Pública
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden flex flex-col items-center">
            
            <div className={`absolute top-6 right-6 px-4 py-2 font-black rounded-full shadow-lg text-sm tracking-wider uppercase backdrop-blur-md ${
              lot.status === 'AO_VIVO' ? 'bg-red-500/90 text-white animate-pulse border border-red-400' : 
              lot.status === 'AGENDADO' ? 'bg-blue-500/90 text-white' : 
              lot.status === 'CANCELADO' ? 'bg-gray-500 text-white' :
              'bg-gray-800/90 dark:bg-gray-600/90 text-white'
            }`}>
              {lot.status === 'CANCELADO' ? 'Cancelado' : lot.status === 'ENCERRADO' ? 'Encerrado' : timeLeft}
            </div>

            <div className="w-full h-[400px] flex items-center justify-center p-4">
              <img 
                src={lot.imageUrl} 
                alt={lot.title} 
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
          
          <div className="mt-8 px-2">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white mb-4">{lot.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">{lot.description}</p>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[80vh] min-h-[600px]">
            
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {lot.status === 'AGENDADO' ? 'Lance Inicial' : lot.status === 'CANCELADO' ? 'Lote Cancelado' : lot.status === 'ENCERRADO' ? (lot.winnerId ? 'Valor Final Arrematado' : 'Não Arrematado') : 'Lance Atual'}
              </p>
              {lot.status !== 'CANCELADO' && (
                <p className="text-5xl font-black text-green-500 dark:text-green-400 drop-shadow-sm">
                  {formatCurrency(lot.currentPrice)}
                </p>
              )}
              
              <div className="mt-3 flex justify-between items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                <span>Lances: {history.length}</span>
                <span>Incremento: {formatCurrency(lot.minIncrement)}</span>
              </div>
            </div>

            {user?.role === 'LICITANTE' && lot.status === 'AO_VIVO' && !feedback.includes('erro') && !feedback.includes('recusado') && (
              <div className={`p-4 text-center font-bold text-sm tracking-wide ${
                isWinner ? 'bg-green-500 text-white' : 'bg-yellow-400 text-yellow-900'
              }`}>
                {isWinner ? '🏆 ESTÁ A LIDERAR O LEILÃO!' : '⚠️ FOI ULTRAPASSADO. DÊ UM NOVO LANCE!'}
              </div>
            )}
            
            {feedback && <div className="p-3 text-center text-sm font-bold bg-red-500 text-white animate-pulse">{feedback}</div>}

            {user?.role !== 'LEILOEIRO' && lot.status === 'AO_VIVO' && (
              <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <form onSubmit={handlePlaceBid} className="flex flex-col gap-3">
                  <input
                    type="number"
                    step="0.01"
                    min={Number(lot.currentPrice) + (history.length > 0 ? Number(lot.minIncrement) : 0)}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Introduza o seu valor"
                    required
                    disabled={isSubmittingBid}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white p-4 rounded-xl font-bold text-xl text-center focus:ring-4 focus:ring-green-400/50 focus:border-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  
                  <button 
                    type="submit" 
                    disabled={isSubmittingBid}
                    className={`w-full text-white font-black text-lg py-4 rounded-xl uppercase tracking-wider shadow-lg transition transform flex items-center justify-center gap-2 ${
                      isSubmittingBid 
                        ? 'bg-gray-400 cursor-not-allowed opacity-80' 
                        : 'bg-green-500 hover:bg-green-600 hover:shadow-green-500/30 hover:-translate-y-0.5'
                    }`}
                  >
                    {isSubmittingBid ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando...
                      </>
                    ) : (
                      'Submeter Lance'
                    )}
                  </button>
                </form>
              </div>
            )}

            <div className="flex-grow p-6 overflow-y-auto bg-gray-50 dark:bg-gray-800/30">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Feed de Lances</h3>
              
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-gray-400 text-center italic mt-10">Nenhum lance registado.</p>
                ) : (
                  history.map((bid, index) => (
                    <div key={bid.id} className={`p-4 rounded-xl flex justify-between items-center transition-all ${
                      index === 0 
                        ? 'bg-white dark:bg-gray-700 shadow-md border-l-4 border-green-500' 
                        : 'bg-transparent border border-gray-200 dark:border-gray-600 opacity-70'
                    }`}>
                      <div>
                        <div className={`font-black text-lg ${index === 0 ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {formatCurrency(bid.amount)}
                        </div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                          {bid.bidderTag || (bid.userId === user?.id ? 'Você' : `Participante (...${bid.userId?.slice(-4) || ''})`)}
                        </div>
                      </div>
                      <span className="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-500 dark:text-gray-400">
                        {new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}