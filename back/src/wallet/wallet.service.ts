import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async deposit(userId: string, amount: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    user.saldoTotal = Number(user.saldoTotal) + Number(amount);
    await this.usersRepository.save(user);

    return this.getWallet(userId);
  }

  async getWallet(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const saldoTotal = Number(user.saldoTotal);
    const saldoComprometido = Number(user.saldoComprometido);
    const saldoDisponivel = saldoTotal - saldoComprometido;

    return {
      saldoTotal,
      saldoComprometido,
      saldoDisponivel,
    };
  }
}