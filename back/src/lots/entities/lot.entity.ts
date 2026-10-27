import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LotStatus } from '../enums/lot-status.enum.js';

@Entity('lots')
export class Lot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  imageUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  attributes: Record<string, any>; // Salva os dados completos da API externa

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  initialPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minIncrement: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentPrice: number;

  @Column({ type: 'enum', enum: LotStatus, default: LotStatus.AGENDADO })
  status: LotStatus;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column()
  leiloeiroId: string;

  @Column({ nullable: true })
  winnerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}