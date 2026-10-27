import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { Role } from '../enums/role.enum.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.LICITANTE })
  role: Role;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  saldoTotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  saldoComprometido: number;

  @CreateDateColumn()
  createdAt: Date;
}