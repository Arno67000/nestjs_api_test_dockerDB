import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { DatabaseService } from '../database/database.service';
import { User } from '@prisma/client';
import { AuthPayload, SignupDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private database: DatabaseService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthPayload> {
    try {
      const user = await this.database.user.create({
        data: { email: dto.email, hash: await argon.hash(dto.password) },
      });
      return {
        id: user.id,
        access_token: await this.signToken(user.id, user.email),
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('User already exists');
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  async signin(dto: SignupDto): Promise<AuthPayload> {
    const user = await this.database.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException('User not found');

    const valid = await argon.verify(user.hash, dto.password);
    if (!valid) throw new ForbiddenException('Invalid password');
    return {
      id: user.id,
      access_token: await this.signToken(user.id, user.email),
    };
  }

  signToken(userId: User['id'], email: User['email']): Promise<string> {
    return this.jwt.signAsync(
      { sub: userId, email },
      { expiresIn: '10h', secret: this.config.get('JWT_SECRET') },
    );
  }
}
