import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

interface AuditHistory {
  id: string;
  amount: number;
  createdAt: string;
  bidderTag: string;
  hash: string;
  previousHash: string;
  isAuthentic: boolean;
}

interface AuditData {
  lotId: string;
  isChainIntact: boolean;
  totalBids: number;
  history: AuditHistory[];
}

export default function Audit() {
  const { lotId } = useParams<{ lotId: string }>();
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const response = await api.get(`/bids/audit/${lotId}`);
        setAudit(response.data);
      } catch (err) {
        setError('Relatório de auditoria não encontrado para este lote.');
      } finally {
        setLoading(false);
      }
    };
    if (lotId) fetchAudit();
  }, [lotId]);

  if (loading) return <div className="text-center mt-10">Gerando relatório criptográfico...</div>;
  if (error || !audit) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto mt-6">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Auditoria Pública de Lote</h2>
        <Link to={`/lot/${lotId}`} className="text-blue-600 hover:underline">Voltar ao Lote</Link>
      </div>

      <div className={`p-6 rounded shadow-md mb-8 ${audit.isChainIntact ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          Status de Integridade: 
          {audit.isChainIntact 
            ? <span className="text-green-700">✅ Íntegro (Sem Adulterações)</span> 
            : <span className="text-red-700">❌ ADULTERADO</span>}
        </h3>
        <p className="text-gray-700">
          Total de lances registrados: <strong>{audit.totalBids}</strong>. 
          {audit.isChainIntact 
            ? ' A cadeia de hash SHA-256 está perfeitamente alinhada.' 
            : ' Ocorreu uma quebra na cadeia criptográfica, indicando modificação direta no banco de dados.'}
        </p>
      </div>

      <div className="space-y-4">
        {audit.history.map((bid, index) => (
          <div key={bid.id} className="bg-white p-4 rounded shadow text-sm border-l-4 border-gray-300">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg text-gray-800">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bid.amount)}
              </span>
              <span className="text-gray-500">{new Date(bid.createdAt).toLocaleString()}</span>
            </div>
            
            <p className="text-gray-600 mb-2">Usuário: <span className="font-mono bg-gray-100 px-1 rounded">{bid.bidderTag}</span></p>
            
            <div className="bg-gray-50 p-2 rounded border font-mono text-xs text-gray-500 break-all">
              <p><strong className="text-gray-700">Hash Atual:</strong> {bid.hash}</p>
              <p><strong className="text-gray-700">Hash Anterior:</strong> {bid.previousHash}</p>
            </div>
            
            <div className="mt-2 text-right">
              {bid.isAuthentic 
                ? <span className="text-green-600 font-bold">✓ Assinatura Válida</span> 
                : <span className="text-red-600 font-bold">⚠ Falha na Assinatura</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}