import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, Query } from '@nestjs/common';
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

  @Get('vitrine')
  getVitrine(@Query('search') search?: string) {
    return this.lotsService.getVitrine(search);
  }

  @Get('won')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LICITANTE)
  getWonLots(@Request() req: AuthenticatedRequest) {
    return this.lotsService.getWonLots(req.user.id);
  }

  @Get('participated')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LICITANTE)
  getParticipatedLots(@Request() req: AuthenticatedRequest) {
    return this.lotsService.getParticipatedLots(req.user.id);
  }

  @Get('leiloeiro')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LEILOEIRO)
  getLeiloeiroLots(@Request() req: AuthenticatedRequest) {
    return this.lotsService.getLeiloeiroLots(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lotsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LEILOEIRO)
  create(@Request() req: AuthenticatedRequest, @Body() createLotDto: CreateLotDto) {
    return this.lotsService.create(createLotDto, req.user.id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.LEILOEIRO)
  cancel(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.lotsService.cancelLot(id, req.user.id);
  }
}