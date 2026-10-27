import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ExternalApiService } from './external-api.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('external-items')
@UseGuards(JwtAuthGuard)
export class ExternalApiController {
  constructor(private readonly externalApiService: ExternalApiService) {}

  @Get()
  search(@Query('q') query: string) {
    return this.externalApiService.searchItems(query);
  }

  @Get(':id')
  getItem(@Param('id') id: string) {
    return this.externalApiService.getItemById(id);
  }
}