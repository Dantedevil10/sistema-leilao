import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service.js';
import { User } from '../users/entities/user.entity.js';
import { Lot } from '../lots/entities/lot.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Lot])],
  providers: [SeedService],
})
export class SeedModule {}