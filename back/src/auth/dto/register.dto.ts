// register.dto.ts
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../../users/enums/role.enum.js';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;
}
