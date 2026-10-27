import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotsService } from './lots.service.js';
import { LotsController } from './lots.controller.js';
import { Lot } from './entities/lot.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Lot])],
  controllers: [LotsController],
  providers: [LotsService],
  exports: [LotsService],
})
export class LotsModule {}