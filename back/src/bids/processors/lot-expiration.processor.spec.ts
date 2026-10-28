import { Test, TestingModule } from '@nestjs/testing';
import { LotExpirationProcessor } from './lot-expiration.processor.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lot } from '../../lots/entities/lot.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { DataSource } from 'typeorm';
import { BidsGateway } from '../bids.gateway.js';
import { Job, Queue } from 'bullmq';

import { jest, describe, beforeEach, it, expect } from '@jest/globals';


describe('LotExpirationProcessor - Transações Financeiras e Encerramento', () => {
  let processor: LotExpirationProcessor;
  
  // Mocks blindados com "as any" para contornar o rigor do @jest/globals
  const mockManagerSave = jest.fn() as any;
  const mockManagerFindOne = jest.fn() as any;
  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb: any) => cb({
      findOne: mockManagerFindOne,
      save: mockManagerSave,
    })) as any,
  };
  const mockBidsGateway = { notifyLotEnded: jest.fn() as any };
  const mockQueue = { add: jest.fn() as any };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LotExpirationProcessor,
        { provide: getRepositoryToken(Lot), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: DataSource, useValue: mockDataSource },
        { provide: BidsGateway, useValue: mockBidsGateway },
        { provide: 'BullQueue_auction-liquidation', useValue: mockQueue },
      ],
    }).compile();

    processor = module.get<LotExpirationProcessor>(LotExpirationProcessor);
  });

  it('1. Deve encerrar lote SEM VENCEDOR (nenhuma transferência financeira)', async () => {
    const lotWithoutWinner = { id: 'lot-1', status: 'AO_VIVO', endTime: new Date(Date.now() - 10000), winnerId: null, currentPrice: 100 };
    mockManagerFindOne.mockResolvedValueOnce(lotWithoutWinner); // Retorna o lote

    await processor.process({ data: { lotId: 'lot-1' } } as Job);

    // O status do lote deve ter sido alterado para ENCERRADO
    expect(lotWithoutWinner.status).toBe('ENCERRADO');
    // Manager deve salvar apenas o LOTE (não pode salvar nenhum User porque não há transação)
    expect(mockManagerSave).toHaveBeenCalledTimes(1);
    expect(mockBidsGateway.notifyLotEnded).toHaveBeenCalledWith('lot-1', null, 100);
  });

  it('2. Deve encerrar lote COM VENCEDOR (debitar cliente e pagar leiloeiro)', async () => {
    const lotWithWinner = { id: 'lot-2', status: 'AO_VIVO', endTime: new Date(Date.now() - 10000), winnerId: 'user-vencedor', leiloeiroId: 'user-leiloeiro', currentPrice: 500 };
    const vencedor = { id: 'user-vencedor', saldoTotal: 1000, saldoComprometido: 500 };
    const leiloeiro = { id: 'user-leiloeiro', saldoTotal: 2000 };

    mockManagerFindOne
      .mockResolvedValueOnce(lotWithWinner) // 1ª chamada busca o Lote
      .mockResolvedValueOnce(vencedor)      // 2ª chamada busca Vencedor
      .mockResolvedValueOnce(leiloeiro);    // 3ª chamada busca Leiloeiro

    await processor.process({ data: { lotId: 'lot-2' } } as Job);

    // O saldo do vencedor deve ser debitado no Total e no Comprometido
    expect(vencedor.saldoTotal).toBe(500); // 1000 - 500
    expect(vencedor.saldoComprometido).toBe(0); // 500 - 500

    // O saldo do leiloeiro deve ser creditado no Total
    expect(leiloeiro.saldoTotal).toBe(2500); // 2000 + 500

    // Deve ter salvo o Vencedor, Leiloeiro e o Lote (3 vezes)
    expect(mockManagerSave).toHaveBeenCalledTimes(3);
  });
});