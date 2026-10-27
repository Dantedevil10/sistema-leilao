import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Lot } from '../../lots/entities/lot.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { LotStatus } from '../../lots/enums/lot-status.enum.js';
import { BidsGateway } from '../bids.gateway.js';

@Processor('auction-liquidation')
@Injectable()
export class LotExpirationProcessor extends WorkerHost {
  private readonly logger = new Logger(LotExpirationProcessor.name);

  constructor(
    @InjectRepository(Lot) private lotsRepository: Repository<Lot>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    private dataSource: DataSource,
    private bidsGateway: BidsGateway,
  ) {
    super();
  }

  async process(job: Job<{ lotId: string }>): Promise<any> {
    const { lotId } = job.data;
    this.logger.log(`Processando liquidação do lote: ${lotId}`);

    await this.dataSource.transaction(async (manager) => {
      const lot = await manager.findOne(Lot, { where: { id: lotId } });
      if (!lot || lot.status === LotStatus.ENCERRADO || lot.status === LotStatus.CANCELADO) {
        return;
      }

      // Se houve alteração do horário por Anti-Sniping, adia a execução
      if (new Date() < lot.endTime) {
        this.logger.log(`Lote ${lotId} teve tempo prorrogado. Reagendando encerramento.`);
        return;
      }

      lot.status = LotStatus.ENCERRADO;

      if (lot.winnerId) {
        const winner = await manager.findOne(User, { where: { id: lot.winnerId } });
        const leiloeiro = await manager.findOne(User, { where: { id: lot.leiloeiroId } });

        const finalPrice = Number(lot.currentPrice);

        // Liquidação do Saldo
        if (winner && leiloeiro) {
          winner.saldoTotal = Number(winner.saldoTotal) - finalPrice;
          winner.saldoComprometido = Number(winner.saldoComprometido) - finalPrice;
          leiloeiro.saldoTotal = Number(leiloeiro.saldoTotal) + finalPrice;

          await manager.save(winner);
          await manager.save(leiloeiro);
        }
      }

      await manager.save(lot);

      // Notifica os clientes via WebSocket
      this.bidsGateway.notifyLotEnded(lot.id, lot.winnerId, Number(lot.currentPrice));
    });
  }
}