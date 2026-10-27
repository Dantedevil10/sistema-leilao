import { Module } from '@nestjs/common';
import { ExternalApiService } from './external-api.service.js';
import { ExternalApiController } from './external-api.controller.js';

@Module({
  providers: [ExternalApiService],
  controllers: [ExternalApiController],
  exports: [ExternalApiService],
})
export class ExternalApiModule {}