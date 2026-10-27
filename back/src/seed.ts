import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity.js';
import { Lot } from './lots/entities/lot.entity.js';
import { Role } from './users/enums/role.enum.js';
import { LotStatus } from './lots/enums/lot-status.enum.js';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepository = dataSource.getRepository(User);
  const lotRepository = dataSource.getRepository(Lot);

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Criar Leiloeiro
  let leiloeiro = await userRepository.findOne({ where: { email: 'leiloeiro@verzel.com' } });
  if (!leiloeiro) {
    leiloeiro = await userRepository.save(
      userRepository.create({
        name: 'Leiloeiro Oficial',
        email: 'leiloeiro@verzel.com',
        passwordHash,
        role: Role.LEILOEIRO,
      }),
    );
  }

  // 2. Criar Cliente 1
  let cliente1 = await userRepository.findOne({ where: { email: 'cliente1@verzel.com' } });
  if (!cliente1) {
    cliente1 = await userRepository.save(
      userRepository.create({
        name: 'Cliente Um',
        email: 'cliente1@verzel.com',
        passwordHash,
        role: Role.LICITANTE,
        saldoTotal: 5000,
      }),
    );
  }

  // 3. Criar Cliente 2
  let cliente2 = await userRepository.findOne({ where: { email: 'cliente2@verzel.com' } });
  if (!cliente2) {
    cliente2 = await userRepository.save(
      userRepository.create({
        name: 'Cliente Dois',
        email: 'cliente2@verzel.com',
        passwordHash,
        role: Role.LICITANTE,
        saldoTotal: 3000,
      }),
    );
  }

  // 4. Criar Lote Ao Vivo
  const now = new Date();
  const startTime = new Date(now.getTime() - 1000 * 60 * 5); // Iniciado há 5 mins
  const endTime = new Date(now.getTime() + 1000 * 60 * 60); // Termina em 1 hora

  const lotCount = await lotRepository.count();
  if (lotCount === 0) {
    await lotRepository.save(
      lotRepository.create({
        title: 'Mochila Tecnológica Foldsack No. 1',
        description: 'Mochila perfeita para uso diário e notebooks de até 15 polegadas.',
        imageUrl: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
        attributes: { category: "men's clothing", rating: { rate: 3.9, count: 120 } },
        initialPrice: 100,
        minIncrement: 10,
        currentPrice: 100,
        status: LotStatus.AO_VIVO,
        startTime,
        endTime,
        leiloeiroId: leiloeiro.id,
      }),
    );
  }

  console.log('Seed de dados finalizado com sucesso!');
  await app.close();
}

bootstrap();