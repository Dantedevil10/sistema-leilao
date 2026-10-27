import { Request } from 'express';
import { Role } from '../../users/enums/role.enum.js';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: Role;
  };
}