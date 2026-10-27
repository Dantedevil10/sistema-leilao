import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Bid } from './entities/bid.entity.js';
import { Lot } from '../lots/entities/lot.entity.js';
import { User } from '../users/entities/user.entity.js';
import { LotStatus } from '../lots/enums/lot-status.enum.js';
import * as crypto from 'crypto';

@Injectable()
export class BidsService {
  constructor(
    @InjectRepository(Bid)
    private bidsRepository: Repository<Bid>,
    @InjectRepository(Lot)
    private lotsRepository: Repository<Lot>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  private calculateHash(
    id: string,
    lotId: string,
    userId: string,
    amount: number,
    createdAt: Date,
    previousHash: string,
  ): string {
    const data = `${id}-${lotId}-${userId}-${amount}-${createdAt.toISOString()}-${previousHash || 'GENESIS'}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async placeBid(userId: string, lotId: string, amount: number) {
    return this.dataSource.transaction(async (manager) => {
      const lot = await manager.findOne(Lot, { where: { id: lotId } });
      if (!lot) throw new NotFoundException('Lote não encontrado.');

      const now = new Date();
      if (lot.status !== LotStatus.AO_VIVO || now < lot.startTime || now > lot.endTime) {
        throw new BadRequestException('Lances só são aceitos em lotes ao vivo.');
      }

      if (lot.winnerId === userId) {
        throw new BadRequestException('Você já é o líder do lote.');
      }

      const currentPrice = Number(lot.currentPrice);
      const minIncrement = Number(lot.minIncrement);
      const initialPrice = Number(lot.initialPrice);

      const hasBids = await manager.count(Bid, { where: { lotId } });

      if (hasBids === 0) {
        if (amount < initialPrice) {
          throw new BadRequestException(`O primeiro lance deve ser no mínimo R$ ${initialPrice}`);
        }
      } else {
        const minRequired = currentPrice + minIncrement;
        if (amount < minRequired) {
          throw new BadRequestException(`O lance mínimo aceito é R$ ${minRequired}`);
        }
      }

      // Validação e Ajuste de Saldo do Licitante
      const user = await manager.findOne(User, { where: { id: userId } });
      const saldoTotal = Number(user.saldoTotal);
      const saldoComprometido = Number(user.saldoComprometido);
      const saldoDisponivel = saldoTotal - saldoComprometido;

      if (amount > saldoDisponivel) {
        throw new BadRequestException('Saldo disponível insuficiente.');
      }

      // Estorno do Saldo Comprometido do líder anterior
      if (lot.winnerId) {
        const previousWinner = await manager.findOne(User, { where: { id: lot.winnerId } });
        if (previousWinner) {
          previousWinner.saldoComprometido = Math.max(0, Number(previousWinner.saldoComprometido) - currentPrice);
          await manager.save(previousWinner);
        }
      }

      // Compromete saldo do novo líder
      user.saldoComprometido = saldoComprometido + amount;
      await manager.save(user);

      // Prorrogação Anti-Sniping (+2 min se o lance for feito nos últimos 2 min)
      const twoMinutesInMs = 2 * 60 * 1000;
      let timeExtended = false;
      if (lot.endTime.getTime() - now.getTime() <= twoMinutesInMs) {
        lot.endTime = new Date(now.getTime() + twoMinutesInMs);
        timeExtended = true;
      }

      // Atualiza o Lote
      lot.currentPrice = amount;
      lot.winnerId = userId;
      await manager.save(lot);

      // Gerador da Cadeia de Hash
      const lastBid = await manager.findOne(Bid, {
        where: { lotId },
        order: { createdAt: 'DESC' },
      });

      const previousHash = lastBid ? lastBid.hash : 'GENESIS';
      const bid = manager.create(Bid, {
        lotId,
        userId,
        amount,
        previousHash,
      });

      // Salva temporariamente para obter o ID gerado e timestamp
      const savedBid = await manager.save(bid);
      savedBid.hash = this.calculateHash(
        savedBid.id,
        savedBid.lotId,
        savedBid.userId,
        Number(savedBid.amount),
        savedBid.createdAt,
        savedBid.previousHash,
      );

      await manager.save(savedBid);

      return {
        bid: savedBid,
        lot,
        timeExtended,
      };
    });
  }

  // Verificação Pública de Auditoria (à prova de adulteração)
  async auditLot(lotId: string) {
    const bids = await this.bidsRepository.find({
      where: { lotId },
      order: { createdAt: 'ASC' },
    });

    let isValid = true;
    let expectedPreviousHash = 'GENESIS';

    const auditedHistory = bids.map((bid) => {
      const calculatedHash = this.calculateHash(
        bid.id,
        bid.lotId,
        bid.userId,
        Number(bid.amount),
        bid.createdAt,
        bid.previousHash,
      );

      const hashMatch = calculatedHash === bid.hash;
      const chainValid = bid.previousHash === expectedPreviousHash;

      if (!hashMatch || !chainValid) {
        isValid = false;
      }

      expectedPreviousHash = bid.hash;

      return {
        id: bid.id,
        amount: Number(bid.amount),
        createdAt: bid.createdAt,
        // Anonimização de privacidade para auditoria pública
        bidderTag: `Licitante-...${bid.userId.slice(-4)}`,
        hash: bid.hash,
        previousHash: bid.previousHash,
        isAuthentic: hashMatch && chainValid,
      };
    });

    return {
      lotId,
      isChainIntact: isValid,
      totalBids: bids.length,
      history: auditedHistory,
    };
  }
}