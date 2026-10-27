export interface Lot {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  initialPrice: number;
  minIncrement: number;
  currentPrice: number;
  status: 'AGENDADO' | 'AO_VIVO' | 'ENCERRADO' | 'CANCELADO';
  startTime: string;
  endTime: string;
  leiloeiroId: string;
  winnerId: string | null;
}