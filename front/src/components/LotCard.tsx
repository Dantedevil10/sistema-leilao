
import { Link } from 'react-router-dom';
import type { Lot } from '../types';

interface LotCardProps {
  lot: Lot;
}

export default function LotCard({ lot }: LotCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const statusConfig = {
    AO_VIVO: { color: 'bg-red-500 text-white animate-pulse', label: 'Ao Vivo' },
    AGENDADO: { color: 'bg-blue-500 text-white', label: 'Agendado' },
    ENCERRADO: { color: 'bg-gray-600 dark:bg-gray-700 text-white', label: 'Encerrado' },
    CANCELADO: { color: 'bg-gray-300 text-gray-700', label: 'Cancelado' }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col transition-all duration-300 transform hover:-translate-y-1 group">
      
      {/* Imagem com Label Flutuante */}
      <div className="relative h-56 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center overflow-hidden p-4">
        <img
          src={lot.imageUrl}
          alt={lot.title}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
        />
        <div className={`absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full shadow-sm tracking-wide uppercase ${statusConfig[lot.status].color}`}>
          {statusConfig[lot.status].label}
        </div>
      </div>
      
      {/* Conteúdo do Cartão */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-2 mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={lot.title}>
          {lot.title}
        </h3>
        
        <div className="mt-auto bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">
            {lot.status === 'AGENDADO' ? 'Lance Inicial' : lot.status === 'ENCERRADO' ? 'Arrematado por' : 'Lance Atual'}
          </p>
          <p className="text-2xl font-black text-green-600 dark:text-green-400">
            {formatCurrency(lot.currentPrice)}
          </p>
        </div>

        <Link
          to={`/lot/${lot.id}`}
          className={`mt-4 block w-full text-center font-bold py-3 rounded-xl transition-all ${
            lot.status === 'AO_VIVO' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg' 
              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
          }`}
        >
          {lot.status === 'ENCERRADO' ? 'Ver Resultado' : 'Ver Detalhes do Lote'}
        </Link>
      </div>
    </div>
  );
}