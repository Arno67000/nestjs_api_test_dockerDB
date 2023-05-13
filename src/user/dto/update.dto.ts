import { User } from '@prisma/client';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateDto {
  @IsString()
  @IsOptional()
  firstName?: User['firstName'];

  @IsString()
  @IsOptional()
  lastName?: User['lastName'];

  @IsEmail()
  @IsOptional()
  email?: User['email'];
}
