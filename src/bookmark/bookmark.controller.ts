import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { Bookmark, User } from '@prisma/client';
import { PostBookmarkDto, UpdateBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get()
  getAllBookmarks(@GetUser('id') userId: User['id']): Promise<Bookmark[]> {
    return this.bookmarkService.getAllBookmarks(userId);
  }

  @Get(':id')
  getOneBookmark(
    @GetUser('id') userId: User['id'],
    @Param('id', ParseIntPipe) id: Bookmark['id'],
  ) {
    return this.bookmarkService.getOneBookmark(id, userId);
  }

  @Post()
  createBookmark(
    @GetUser('id') userId: User['id'],
    @Body() dto: PostBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(userId, dto);
  }

  @Put(':id')
  updateBookmark(
    @GetUser('id') userId: User['id'],
    @Param('id', ParseIntPipe) id: Bookmark['id'],
    @Body() dto: UpdateBookmarkDto,
  ) {
    return this.bookmarkService.updateBookmark(id, userId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmark(
    @GetUser('id') userId: User['id'],
    @Param('id', ParseIntPipe) id: Bookmark['id'],
  ) {
    return this.bookmarkService.deleteBookmark(id, userId);
  }
}
