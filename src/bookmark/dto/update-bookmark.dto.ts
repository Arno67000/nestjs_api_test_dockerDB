import { Bookmark } from '@prisma/client';
import { IsString, IsOptional } from 'class-validator';

export class UpdateBookmarkDto {
  @IsString()
  @IsOptional()
  title?: Bookmark['title'];

  @IsString()
  @IsOptional()
  link?: Bookmark['link'];

  @IsString()
  @IsOptional()
  description?: Bookmark['description'];
}
