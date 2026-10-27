import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service.js';
import { DepositDto } from './dto/deposit.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface.js';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('me')
  getWallet(@Request() req: AuthenticatedRequest) {
    return this.walletService.getWallet(req.user.id);
  }

  @Post('deposit')
  deposit(@Request() req: AuthenticatedRequest, @Body() depositDto: DepositDto) {
    return this.walletService.deposit(req.user.id, depositDto.amount);
  }
}