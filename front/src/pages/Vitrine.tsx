import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Lot } from '../types';
import LotCard from '../components/LotCard';

export default function Vitrine() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLots = async () => {
      try {
        const response = await api.get('/lots/vitrine');
        setLots(response.data);
      } catch (err) {
        setError('Não foi possível carregar a vitrine.');
      } finally {
        setLoading(false);
      }
    };

    fetchLots();
  }, []);

  if (loading) return <div className="text-center mt-10">Carregando vitrine...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  const lotesAoVivo = lots.filter(lot => lot.status === 'AO_VIVO');
  const lotesAgendados = lots.filter(lot => lot.status === 'AGENDADO');
  const lotesEncerrados = lots.filter(lot => lot.status === 'ENCERRADO');

  const Section = ({ title, data }: { title: string; data: Lot[] }) => {
    if (data.length === 0) return null;
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold border-b pb-2 mb-4 text-gray-700">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.map(lot => (
            <LotCard key={lot.id} lot={lot} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Bem-vindo à Casa de Leilões Verzel</h1>
        <p className="text-gray-600">Acompanhe lotes ao vivo, programe-se para os próximos ou veja o histórico.</p>
      </div>

      {lots.length === 0 ? (
        <div className="text-center text-gray-500">Nenhum lote disponível no momento.</div>
      ) : (
        <>
          <Section title="🔴 Ao Vivo Agora" data={lotesAoVivo} />
          <Section title="🗓️ Em Breve (Agendados)" data={lotesAgendados} />
          <Section title="🔨 Encerrados" data={lotesEncerrados} />
        </>
      )}
    </div>
  );
}