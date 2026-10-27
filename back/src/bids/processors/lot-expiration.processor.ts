import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
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
    // INJETAMOS A FILA AQUI PARA PODER REAGENDAR DE VERDADE
    @InjectQueue('auction-liquidation') private liquidationQueue: Queue,
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

      const now = new Date();
      const endTime = new Date(lot.endTime);

      // Se o lance estendeu o horário ou a fila disparou milissegundos antes
      if (now < endTime) {
        const delay = endTime.getTime() - now.getTime();
        this.logger.log(`Lote ${lotId} não chegou no fim. Reagendando para daqui a ${delay}ms.`);
        
        // AGORA SIM ELE COLOCA DE VOLTA NA FILA!
        await this.liquidationQueue.add('liquidate', { lotId }, { delay });
        return;
      }

      // Se passou da hora, encerra o lote
      lot.status = LotStatus.ENCERRADO;

      if (lot.winnerId) {
        const winner = await manager.findOne(User, { where: { id: lot.winnerId } });
        const leiloeiro = await manager.findOne(User, { where: { id: lot.leiloeiroId } });

        const finalPrice = Number(lot.currentPrice);

        // Liquidação do Saldo do Licitante e Leiloeiro
        if (winner && leiloeiro) {
          winner.saldoTotal = Number(winner.saldoTotal) - finalPrice;
          winner.saldoComprometido = Number(winner.saldoComprometido) - finalPrice;
          leiloeiro.saldoTotal = Number(leiloeiro.saldoTotal) + finalPrice;

          await manager.save(winner);
          await manager.save(leiloeiro);
        }
      }

      await manager.save(lot);

      // Notifica os clientes via WebSocket que o leilão acabou
      this.bidsGateway.notifyLotEnded(lot.id, lot.winnerId, Number(lot.currentPrice));
      this.logger.log(`Lote ${lotId} encerrado com sucesso.`);
    });
  }
}