import { User } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: User['email'];

  @IsString()
  @IsNotEmpty()
  password: User['hash'];
}
