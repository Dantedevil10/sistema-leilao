import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LotCard from './LotCard';
import type { Lot } from '../types';

describe('Componente LotCard', () => {
  const mockLot: Lot = {
    id: 'lote-xyz',
    title: 'Relógio de Bolso Antigo',
    description: 'Relógio clássico.',
    imageUrl: 'http://imagem.com/relogio.jpg',
    initialPrice: 100,
    minIncrement: 10,
    currentPrice: 1500.50,
    status: 'AO_VIVO',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 10000).toISOString(),
    leiloeiroId: 'leiloeiro-1',
    winnerId: null,
  };

  it('deve renderizar o título e o preço formatado em BRL', () => {
    // Envolvemos no BrowserRouter porque o LotCard contém um <Link>
    render(
      <BrowserRouter>
        <LotCard lot={mockLot} />
      </BrowserRouter>
    );

    // Verifica se o título aparece
    expect(screen.getByText('Relógio de Bolso Antigo')).toBeInTheDocument();
    
    // Verifica se o preço formatado (com vírgula e símbolo) está na tela
    expect(screen.getByText(/1\.500,50/)).toBeInTheDocument();
    
    // Verifica a etiqueta de status
    expect(screen.getByText('Ao Vivo')).toBeInTheDocument();
  });

  it('deve exibir "Arrematado por" se o status for ENCERRADO', () => {
    const encerradoLot = { ...mockLot, status: 'ENCERRADO' as const };
    
    render(
      <BrowserRouter>
        <LotCard lot={encerradoLot} />
      </BrowserRouter>
    );

    expect(screen.getByText('Arrematado por')).toBeInTheDocument();
    expect(screen.getByText('Ver Resultado')).toBeInTheDocument();
  });
});