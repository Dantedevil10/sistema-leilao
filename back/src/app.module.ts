import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { Lot } from './lots/entities/lot.entity.js';
import { Bid } from './bids/entities/bid.entity.js';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity.js';
import { AuthModule } from './auth/auth.module.js';
import { WalletModule } from './wallet/wallet.module.js';
import { ExternalApiModule } from './external-api/external-api.module.js';
import { LotsModule } from './lots/lots.module.js';
import { BullModule } from '@nestjs/bullmq';
import { BidsModule } from './bids/bids.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'rootpassword',
      database: 'auction_db',
      entities: [User, Lot, Bid],
      synchronize: true, // Use apenas em dev. Em prod, use migrations.
    }),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    AuthModule,
    WalletModule,
    ExternalApiModule,
    LotsModule,
    BidsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
