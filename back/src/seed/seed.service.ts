import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Lot } from '../lots/entities/lot.entity.js';
import * as bcrypt from 'bcrypt';

import { Role } from '../users/enums/role.enum.js';
import { LotStatus } from '../lots/enums/lot-status.enum.js';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Lot)
        private readonly lotRepository: Repository<Lot>,
    ) {}

    // Este método roda automaticamente após a API subir
    async onApplicationBootstrap() {
        await this.seedDatabase();
    }

    private async seedDatabase() {
    // 1. Verifica se o banco já tem dados (para não duplicar)
    const hasUsers = await this.userRepository.count();
    if (hasUsers > 0) {
      console.log('🌱 [Seed] Banco já populado, ignorando inserção de dados falsos.');
      return;
    }

    console.log('🌱 [Seed] Banco vazio detectado. Inserindo dados base...');

    // 2. Criação de Utilizadores Base
    const defaultPassword = await bcrypt.hash('123456', 10);

    const leiloeiro = this.userRepository.create({
        name: 'João Leiloeiro',
        email: 'admin@leilao.com',
        passwordHash: defaultPassword,
        role: Role.LEILOEIRO,
        saldoTotal: 5000,
        saldoComprometido: 0,
    });

    const licitante1 = this.userRepository.create({
        name: 'Carlos Licitante (Rico)',
        email: 'carlos@email.com',
        passwordHash: defaultPassword,
        role: Role.LICITANTE,
        saldoTotal: 15000,
        saldoComprometido: 0,
    });

    const licitante2 = this.userRepository.create({
        name: 'Maria Licitante',
        email: 'maria@email.com',
        passwordHash: defaultPassword,
        role: Role.LICITANTE,
        saldoTotal: 3000,
        saldoComprometido: 0,
    });

    await this.userRepository.save([leiloeiro, licitante1, licitante2]);

    // 3. Criação de Lotes Base
    const agora = new Date();
    const duasHorasFrente = new Date(agora.getTime() + 2 * 60 * 60 * 1000);
    const duasHorasAtras = new Date(agora.getTime() - 2 * 60 * 60 * 1000);

    const loteAoVivo = this.lotRepository.create({
      title: 'Rolex Submariner Vintage',
      description:'Relógio de pulso clássico em perfeito estado de conservação.',
      imageUrl:'https://images.unsplash.com/photo-1523170335258-f5ed11844a49',
      initialPrice: 2000,
      minIncrement: 100,
      currentPrice: 2000,
      startTime: agora,
      endTime: duasHorasFrente,
      status: LotStatus.AO_VIVO,
      leiloeiroId: leiloeiro.id,
    });

    const loteAgendado = this.lotRepository.create({
      title: 'Mesa de Carvalho Maciço',
      description: 'Mesa de jantar rústica para 8 lugares.',
      imageUrl:'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc',
      initialPrice: 500,
      minIncrement: 25,
      currentPrice: 500,
      startTime: duasHorasFrente,
      endTime: new Date(
        agora.getTime() + 4 * 60 * 60 * 1000,
      ),
      status: LotStatus.AGENDADO,
      leiloeiroId: leiloeiro.id,
    });

    const loteEncerrado = this.lotRepository.create({
      title: 'Quadro A. Tarsila',
      description: 'Réplica autorizada de obra modernista.',
      imageUrl:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
      initialPrice: 800,
      minIncrement: 50,
      currentPrice: 1200,
      startTime: duasHorasAtras,
      endTime: agora,
      status: LotStatus.ENCERRADO,
      winnerId: licitante2.id,
      leiloeiroId: leiloeiro.id,
    });

    await this.lotRepository.save([loteAoVivo, loteAgendado, loteEncerrado]);

    console.log('✅ [Seed] Dados injetados com sucesso! O sistema está pronto.');
  }
}