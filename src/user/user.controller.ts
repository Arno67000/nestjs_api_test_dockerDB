import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';

import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { UpdateDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  getUser(@GetUser() user: User) {
    return user;
  }

  @Put()
  updateUser(@GetUser('id') userId: User['id'], @Body() dto: UpdateDto) {
    return this.userService.updateUser(userId, dto);
  }
}
