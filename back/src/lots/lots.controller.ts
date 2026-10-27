import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { LotsService } from './lots.service.js';
import { CreateLotDto } from './dto/create-lot.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '../users/enums/role.enum.js';

import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface.js';

@Controller('lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  // Rota pública para carregar a Vitrine
  @Get('vitrine')
  getVitrine() {
    return this.lotsService.getVitrine();
  }

  @Get('won')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LICITANTE)
  getWonLots(@Request() req: AuthenticatedRequest) {
    return this.lotsService.getWonLots(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lotsService.findOne(id);
  }

  // Apenas LEILOEIRO cria lotes
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LEILOEIRO)
  create(@Request() req: AuthenticatedRequest, @Body() createLotDto: CreateLotDto) {
    return this.lotsService.create(createLotDto, req.user.id);
  }

  // Apenas LEILOEIRO cancela lotes
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LEILOEIRO)
  cancel(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.lotsService.cancelLot(id, req.user.id);
  }


}