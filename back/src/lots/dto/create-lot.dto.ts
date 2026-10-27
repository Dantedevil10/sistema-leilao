import { IsString, IsNumber, IsPositive, IsDateString, IsOptional, IsObject } from 'class-validator';

export class CreateLotDto {
  @IsString()
  externalItemId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  imageUrl: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, any>;

  @IsNumber()
  @IsPositive()
  initialPrice: number;

  @IsNumber()
  @IsPositive()
  minIncrement: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}