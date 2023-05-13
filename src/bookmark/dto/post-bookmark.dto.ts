import { Bookmark } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PostBookmarkDto {
  @IsString()
  @IsNotEmpty()
  title: Bookmark['title'];

  @IsString()
  @IsNotEmpty()
  link: Bookmark['link'];

  @IsString()
  @IsOptional()
  description?: Bookmark['description'];
}
