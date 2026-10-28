import { Test, TestingModule } from '@nestjs/testing';
import { BidsService } from './bids.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bid } from './entities/bid.entity.js';
import { Lot } from '../lots/entities/lot.entity.js';
import { User } from '../users/entities/user.entity.js';
import { DataSource } from 'typeorm';

describe('BidsService - Regras de Auditoria', () => {
  let service: BidsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidsService,
        // Fazendo mock dos repositórios para testar a regra de negócio isolada
        { provide: getRepositoryToken(Bid), useValue: {} },
        { provide: getRepositoryToken(Lot), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: DataSource, useValue: {} },
      ],
    }).compile();

    service = module.get<BidsService>(BidsService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve gerar um Hash SHA-256 determinístico para a cadeia de auditoria', () => {
    // Dados simulados de um lance
    const bidId = 'uuid-simulado-123';
    const lotId = 'lot-1';
    const userId = 'user-1';
    const amount = 500.50;
    const createdAt = new Date('2026-10-28T10:00:00Z');
    const previousHash = 'GENESIS';

    // Como o método calculateHash é privado, usamos um type assertion para testá-lo
    const hash1 = (service as any).calculateHash(bidId, lotId, userId, amount, createdAt, previousHash);
    const hash2 = (service as any).calculateHash(bidId, lotId, userId, amount, createdAt, previousHash);

    // Validações
    expect(hash1).toBeDefined();
    expect(hash1).toEqual(hash2); // Deve ser exatamente igual se os dados não mudaram (Determinístico)
    expect(hash1).toHaveLength(64); // SHA-256 gera sempre uma string de 64 caracteres hexadecimais
  });

  it('deve gerar um Hash diferente se qualquer valor (ex: cêntimo adulterado) mudar', () => {
    const createdAt = new Date();
    
    // Hash original (Lance autêntico)
    const hashOriginal = (service as any).calculateHash('id', 'lot', 'user', 500.00, createdAt, 'GENESIS');
    
    // Hash fraudulento (Alguém alterou direto no banco para 500.01)
    const hashAdulterado = (service as any).calculateHash('id', 'lot', 'user', 500.01, createdAt, 'GENESIS');

    expect(hashOriginal).not.toEqual(hashAdulterado);
  });
});