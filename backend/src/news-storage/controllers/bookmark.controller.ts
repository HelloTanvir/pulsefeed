import {
    Controller,
    Get,
    Post,
    Delete,
    Patch,
    Body,
    Param,
    HttpStatus,
    HttpCode,
} from '@nestjs/common';
import { BookmarkService } from '../services/bookmark.service';
import { CreateBookmarkDto, BookmarkResponseDto } from '../dto/bookmark.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';

@ApiTags('Bookmarks')
@Controller('bookmarks')
export class BookmarkController {
    constructor(private readonly bookmarkService: BookmarkService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiBearerAuth()
    async createBookmark(
        @GetCurrentUser('userId') userId: string,
        @Body() createBookmarkDto: CreateBookmarkDto
    ): Promise<BookmarkResponseDto> {
        return this.bookmarkService.createBookmark(userId, createBookmarkDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getBookmarks(@GetCurrentUser('userId') userId: string): Promise<BookmarkResponseDto[]> {
        return this.bookmarkService.getBookmarks(userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async removeBookmark(
        @GetCurrentUser('userId') userId: string,
        @Param('id') id: string
    ): Promise<void> {
        await this.bookmarkService.removeBookmark(userId, id);
    }

    @Patch(':id/note')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async updateNote(
        @GetCurrentUser('userId') userId: string,
        @Param('id') id: string,
        @Body('note') note: string
    ): Promise<BookmarkResponseDto> {
        return this.bookmarkService.updateBookmarkNote(userId, id, note);
    }
}
