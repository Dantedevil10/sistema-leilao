
import { Link } from 'react-router-dom';
import type { Lot } from '../types';

interface LotCardProps {
  lot: Lot;
}

export default function LotCard({ lot }: LotCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const statusColors = {
    AO_VIVO: 'bg-red-500 text-white animate-pulse',
    AGENDADO: 'bg-blue-500 text-white',
    ENCERRADO: 'bg-gray-500 text-white',
    CANCELADO: 'bg-gray-300 text-gray-700'
  };

  const statusLabels = {
    AO_VIVO: 'Ao Vivo',
    AGENDADO: 'Agendado',
    ENCERRADO: 'Encerrado',
    CANCELADO: 'Cancelado'
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition hover:shadow-lg">
      <div className="relative h-48 bg-gray-100 flex items-center justify-center">
        <img
          src={lot.imageUrl}
          alt={lot.title}
          className="max-h-full max-w-full object-contain p-2"
        />
        <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded ${statusColors[lot.status]}`}>
          {statusLabels[lot.status]}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-800 line-clamp-2 mb-2" title={lot.title}>
          {lot.title}
        </h3>
        
        <div className="mt-auto">
          <p className="text-sm text-gray-500">
            {lot.status === 'AGENDADO' ? 'Lance Inicial' : 'Lance Atual'}:
          </p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(lot.currentPrice)}
          </p>
        </div>

        <Link
          to={`/lot/${lot.id}`}
          className="mt-4 block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded transition"
        >
          {lot.status === 'ENCERRADO' ? 'Ver Resultado' : 'Ver Lote'}
        </Link>
      </div>
    </div>
  );
}