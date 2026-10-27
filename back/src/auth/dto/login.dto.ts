// login.dto.ts
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../../users/enums/role.enum.js';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}