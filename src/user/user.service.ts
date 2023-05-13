import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { User } from '@prisma/client';
import { UpdateDto } from './dto';

@Injectable()
export class UserService {
  constructor(private database: DatabaseService) {}

  async updateUser(userId: number, data: UpdateDto): Promise<User> {
    const user = await this.database.user.update({
      where: { id: userId },
      data,
    });
    delete user.hash;
    return user;
  }
}
