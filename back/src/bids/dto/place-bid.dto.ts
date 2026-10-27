import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class PlaceBidDto {
  @IsUUID()
  lotId: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}