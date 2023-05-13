import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Bookmark, User } from '@prisma/client';
import { PostBookmarkDto, UpdateBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private database: DatabaseService) {}

  getAllBookmarks(userId: User['id']) {
    return this.database.bookmark.findMany({ where: { userId } });
  }

  getOneBookmark(id: Bookmark['id'], userId: User['id']) {
    return this.database.bookmark.findFirst({ where: { id, userId } });
  }

  async createBookmark(
    userId: User['id'],
    dto: PostBookmarkDto,
  ): Promise<Bookmark> {
    return await this.database.bookmark.create({ data: { userId, ...dto } });
  }

  async updateBookmark(
    id: Bookmark['id'],
    userId: User['id'],
    data: UpdateBookmarkDto,
  ): Promise<Bookmark> {
    const bookmark = await this.database.bookmark.findUnique({ where: { id } });
    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }
    return this.database.bookmark.update({ where: { id }, data });
  }

  async deleteBookmark(id: Bookmark['id'], userId: User['id']) {
    const bookmark = await this.database.bookmark.findUnique({ where: { id } });
    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }
    await this.database.bookmark.delete({ where: { id } });
  }
}
