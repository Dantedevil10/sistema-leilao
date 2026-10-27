import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { BidsService } from './bids.service.js';
import { PlaceBidDto } from './dto/place-bid.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface.js';

@Controller('bids')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  placeBid(@Request() req: AuthenticatedRequest, @Body() placeBidDto: PlaceBidDto) {
    return this.bidsService.placeBid(req.user.id, placeBidDto.lotId, placeBidDto.amount);
  }

  // Rota pública sem login para Auditoria
  @Get('audit/:lotId')
  auditLot(@Param('lotId') lotId: string) {
    return this.bidsService.auditLot(lotId);
  }
}