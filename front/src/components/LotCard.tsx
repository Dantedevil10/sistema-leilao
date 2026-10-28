
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
    AO_VIVO: { color: 'bg-red-600 text-white animate-pulse', label: 'Ao Vivo' },
    AGENDADO: { color: 'bg-blue-600 text-white', label: 'Agendado' },
    ENCERRADO: { color: 'bg-gray-600 text-white', label: 'Encerrado' },
    CANCELADO: { color: 'bg-gray-300 text-gray-700', label: 'Cancelado' }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md overflow-hidden shadow border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-200 hover:border-blue-400 group min-w-[280px]">
      
      {/* Imagem com Label Flutuante */}
      <div className="relative h-48 bg-white dark:bg-gray-700 flex items-center justify-center p-4 border-b border-gray-100 dark:border-gray-600">
        <img
          src={lot.imageUrl}
          alt={lot.title}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded shadow-sm uppercase ${statusConfig[lot.status].color}`}>
          {statusConfig[lot.status].label}
        </div>
      </div>
      
      {/* Conteúdo do Cartão */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors" title={lot.title}>
          {lot.title}
        </h3>
        
        <div className="mt-auto bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 uppercase font-bold mb-1">
            {lot.status === 'AGENDADO' ? 'Lance Inicial' : lot.status === 'ENCERRADO' ? 'Arrematado por' : 'Lance Atual'}
          </p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
            {formatCurrency(lot.currentPrice)}
          </p>
        </div>

        <Link
          to={`/lot/${lot.id}`}
          className={`mt-3 block w-full text-center font-bold py-2 rounded text-sm transition-colors ${
            lot.status === 'AO_VIVO' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {lot.status === 'ENCERRADO' ? 'Ver Resultado' : 'Acessar Lote'}
        </Link>
      </div>
    </div>
  );
}