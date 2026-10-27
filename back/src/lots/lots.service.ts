import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lot } from './entities/lot.entity.js';
import { LotStatus } from './enums/lot-status.enum.js';
import { CreateLotDto } from './dto/create-lot.dto.js';

@Injectable()
export class LotsService {
  constructor(
    @InjectRepository(Lot)
    private lotsRepository: Repository<Lot>,
  ) {}

  async create(createLotDto: CreateLotDto, leiloeiroId: string) {
    const startTime = new Date(createLotDto.startTime);
    const endTime = new Date(createLotDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('A data de início deve ser anterior à data de término.');
    }

    const lot = this.lotsRepository.create({
      ...createLotDto,
      currentPrice: createLotDto.initialPrice,
      leiloeiroId,
      startTime,
      endTime,
      status: startTime <= new Date() ? LotStatus.AO_VIVO : LotStatus.AGENDADO,
    });

    return this.lotsRepository.save(lot);
  }

  // Vitrine pública: traz ao vivo, agendados e encerrados. Lotes cancelados não aparecem.
  async getVitrine() {
    return this.lotsRepository.createQueryBuilder('lot')
      .where('lot.status != :status', { status: LotStatus.CANCELADO })
      .orderBy('lot.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string) {
    const lot = await this.lotsRepository.findOne({ where: { id } });
    if (!lot) throw new NotFoundException('Lote não encontrado');
    return lot;
  }

  async cancelLot(id: string, leiloeiroId: string) {
    const lot = await this.findOne(id);

    if (lot.leiloeiroId !== leiloeiroId) {
      throw new ForbiddenException('Apenas o leiloeiro criador pode cancelar este lote.');
    }

    // Regra: Não pode cancelar se já tiver lance ou alterado o preço
    if (Number(lot.currentPrice) > Number(lot.initialPrice)) {
      throw new BadRequestException('Lotes que já receberam lances não podem ser cancelados.');
    }

    lot.status = LotStatus.CANCELADO;
    return this.lotsRepository.save(lot);
  }

  async getWonLots(userId: string) {
    return this.lotsRepository.find({
      where: { winnerId: userId, status: LotStatus.ENCERRADO },
      order: { endTime: 'DESC' },
    });
  }
}