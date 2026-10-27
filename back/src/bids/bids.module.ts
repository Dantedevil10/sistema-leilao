import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { Bid } from './entities/bid.entity.js';
import { Lot } from '../lots/entities/lot.entity.js';
import { User } from '../users/entities/user.entity.js';
import { BidsService } from './bids.service.js';
import { BidsController } from './bids.controller.js';
import { BidsGateway } from './bids.gateway.js';
import { LotExpirationProcessor } from './processors/lot-expiration.processor.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bid, Lot, User]),
    BullModule.registerQueue({
      name: 'auction-liquidation',
    }),
  ],
  controllers: [BidsController],
  providers: [BidsService, BidsGateway, LotExpirationProcessor],
  exports: [BidsService],
})
export class BidsModule {}