import { SetMetadata } from '@nestjs/common';
import { Role } from '../users/enums/role.enum.js';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);