import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Lot } from './entities/lot.entity.js';
import { LotStatus } from './enums/lot-status.enum.js';
import { CreateLotDto } from './dto/create-lot.dto.js';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { User } from '../users/entities/user.entity.js';
import { Bid } from '../bids/entities/bid.entity.js';

@Injectable()
export class LotsService {
  constructor(
    @InjectRepository(Lot)
    private lotsRepository: Repository<Lot>,
    @InjectQueue('auction-liquidation') private liquidationQueue: Queue,
    private dataSource: DataSource,
  ) {}

  async create(createLotDto: CreateLotDto, leiloeiroId: string) {
    const startTime = new Date(createLotDto.startTime);
    const endTime = new Date(createLotDto.endTime);

    if (startTime >= endTime) throw new BadRequestException('A data de início deve ser anterior à data de término.');

    const lot = this.lotsRepository.create({
      ...createLotDto,
      currentPrice: createLotDto.initialPrice,
      leiloeiroId,
      startTime,
      endTime,
      status: startTime <= new Date() ? LotStatus.AO_VIVO : LotStatus.AGENDADO,
    });

    const savedLot = await this.lotsRepository.save(lot);

    const delay = endTime.getTime() - new Date().getTime();
    if (delay > 0) {
      await this.liquidationQueue.add('liquidate', { lotId: savedLot.id }, { delay });
    }
    return savedLot;
  }

  // Vitrine com Busca e Filtro de Lotes
  async getVitrine(search?: string) {
    const qb = this.lotsRepository.createQueryBuilder('lot')
      .where('lot.status != :status', { status: LotStatus.CANCELADO });

    if (search) {
      qb.andWhere('lot.title ILIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('lot.createdAt', 'DESC');
    const lots = await qb.getMany();

    // Correção Visual em Tempo Real: Força o status correto se a data expirou
    const now = new Date();
    return lots.map(lot => {
      if (lot.status === LotStatus.AO_VIVO && new Date(lot.endTime) < now) {
        lot.status = LotStatus.ENCERRADO;
      }
      return lot;
    });
  }

  async findOne(id: string) {
    const lot = await this.lotsRepository.findOne({ where: { id } });
    if (!lot) throw new NotFoundException('Lote não encontrado');
    return lot;
  }

  // Cancelamento de Lote com Estorno Automático[cite: 6]
  async cancelLot(id: string, leiloeiroId: string) {
    return this.dataSource.transaction(async (manager) => {
      const lot = await manager.findOne(Lot, { where: { id } });
      if (!lot) throw new NotFoundException('Lote não encontrado.');
      if (lot.leiloeiroId !== leiloeiroId) throw new ForbiddenException('Apenas o leiloeiro criador pode cancelar este lote.');
      if (lot.status === LotStatus.ENCERRADO || lot.status === LotStatus.CANCELADO) {
        throw new BadRequestException('Lotes encerrados ou já cancelados não podem ser alterados.');
      }

      // Estorno Automático: Se houver um líder, devolvemos o saldo comprometido dele
      if (lot.winnerId) {
        const winner = await manager.findOne(User, { where: { id: lot.winnerId } });
        if (winner) {
          winner.saldoComprometido = Math.max(0, Number(winner.saldoComprometido) - Number(lot.currentPrice));
          await manager.save(winner);
        }
      }

      lot.status = LotStatus.CANCELADO;
      return manager.save(lot);
    });
  }

  async getWonLots(userId: string) {
    return this.lotsRepository.find({
      where: { winnerId: userId, status: LotStatus.ENCERRADO },
      order: { endTime: 'DESC' },
    });
  }

  // Painel do Leiloeiro: Todos os lotes criados
  async getLeiloeiroLots(leiloeiroId: string) {
    return this.lotsRepository.find({
      where: { leiloeiroId },
      order: { createdAt: 'DESC' },
    });
  }

  // Interface de Itens em que o Licitante deu lance
  async getParticipatedLots(userId: string) {
    const bids = await this.dataSource.getRepository(Bid).find({
      where: { userId },
      select: { lotId: true },
    });

    const lotIds = [...new Set(bids.map(b => b.lotId))];
    if (lotIds.length === 0) return [];

    return this.lotsRepository.find({
      where: { id: In(lotIds) },
      order: { endTime: 'DESC' },
    });
  }
}