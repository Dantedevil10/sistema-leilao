import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity.js';
import { AuthModule } from './auth/auth.module.js';
import { WalletModule } from './wallet/wallet.module.js';
import { ExternalApiModule } from './external-api/external-api.module.js';
import { LotsModule } from './lots/lots.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'root',
      password: 'rootpassword',
      database: 'auction_db',
      entities: [User],
      synchronize: true, // Use apenas em dev. Em prod, use migrations.
    }),
    AuthModule,
    WalletModule,
    ExternalApiModule,
    LotsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
