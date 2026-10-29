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

  async getVitrine(search?: string) {
    const qb = this.lotsRepository.createQueryBuilder('lot')
      .where('lot.status != :status', { status: LotStatus.CANCELADO });

    if (search) {
      qb.andWhere('lot.title ILIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('lot.createdAt', 'DESC');
    const lots = await qb.getMany();

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

  async cancelLot(id: string, leiloeiroId: string) {
    return this.dataSource.transaction(async (manager) => {
      const lot = await manager.findOne(Lot, { where: { id } });
      if (!lot) throw new NotFoundException('Lote não encontrado.');
      if (lot.leiloeiroId !== leiloeiroId) throw new ForbiddenException('Apenas o leiloeiro criador pode cancelar este lote.');
      if (lot.status === LotStatus.ENCERRADO || lot.status === LotStatus.CANCELADO) {
        throw new BadRequestException('Lotes encerrados ou já cancelados não podem ser alterados.');
      }

      const winnerId = lot.winnerId;
      lot.status = LotStatus.CANCELADO;
      await manager.save(lot);

      if (winnerId) {
        const winner = await manager.findOne(User, { where: { id: winnerId } });
        if (winner) {
          const winnerActiveLots = await manager.find(Lot, {
            where: { winnerId, status: LotStatus.AO_VIVO },
          });
          winner.saldoComprometido = winnerActiveLots.reduce((acc, l) => acc + Number(l.currentPrice), 0);
          await manager.save(winner);
        }
      }

      return lot;
    });
  }

  async getWonLots(userId: string) {
    return this.lotsRepository.find({
      where: { winnerId: userId, status: LotStatus.ENCERRADO },
      order: { endTime: 'DESC' },
    });
  }

  async getLeiloeiroLots(leiloeiroId: string) {
    return this.lotsRepository.find({
      where: { leiloeiroId },
      order: { createdAt: 'DESC' },
    });
  }

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