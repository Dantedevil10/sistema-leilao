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
import { SeedModule } from './seed/seed.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'leilaodb',
      entities: [User, Lot, Bid],
      synchronize: true, // Use apenas em dev. Em prod, use migrations.
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),
    AuthModule,
    WalletModule,
    ExternalApiModule,
    LotsModule,
    BidsModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
