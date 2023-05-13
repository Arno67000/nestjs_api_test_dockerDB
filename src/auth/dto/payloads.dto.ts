import { User } from '@prisma/client';

export interface JwtPayload {
  sub: User['id'];
  email: User['email'];
  iat: number;
  exp: number;
}

export interface AuthPayload {
  id: User['id'];
  access_token: string;
}
