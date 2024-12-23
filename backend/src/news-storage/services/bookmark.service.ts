import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookmarkEntity } from '../entities/bookmark.entity';
import { NewsArticleEntity } from '../entities/news-article.entity';
import { CreateBookmarkDto, BookmarkResponseDto } from '../dto/bookmark.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class BookmarkService {
    constructor(
        private readonly userService: UserService,
        @InjectRepository(BookmarkEntity)
        private readonly bookmarkRepository: Repository<BookmarkEntity>,
        @InjectRepository(NewsArticleEntity)
        private readonly newsRepository: Repository<NewsArticleEntity>
    ) {}

    async createBookmark(
        userId: string,
        createBookmarkDto: CreateBookmarkDto
    ): Promise<BookmarkResponseDto> {
        const article = await this.newsRepository.findOneBy({
            id: createBookmarkDto.articleId,
        });

        if (!article) {
            throw new NotFoundException('Article not found');
        }

        const user = await this.userService.findOneUserById(userId);

        // Check if bookmark already exists
        const existingBookmark = await this.bookmarkRepository.findOne({
            where: {
                user: { id: user.id },
                article: { id: article.id },
            },
            relations: ['article'],
        });

        if (existingBookmark) {
            throw new ConflictException('Article already bookmarked');
        }

        const bookmark = this.bookmarkRepository.create({
            user,
            article,
            note: createBookmarkDto.note,
        });

        const savedBookmark = await this.bookmarkRepository.save(bookmark);
        return this.transformToResponseDto(savedBookmark);
    }

    async getBookmarks(userId: string): Promise<BookmarkResponseDto[]> {
        const bookmarks = await this.bookmarkRepository.find({
            where: { user: { id: userId } },
            relations: ['article'],
            order: { createdAt: 'DESC' },
        });

        return bookmarks.map((bookmark) => this.transformToResponseDto(bookmark));
    }

    async removeBookmark(userId: string, bookmarkId: string): Promise<void> {
        const bookmark = await this.bookmarkRepository.findOne({
            where: {
                id: bookmarkId,
                user: { id: userId },
            },
        });

        if (!bookmark) {
            throw new NotFoundException('Bookmark not found');
        }

        await this.bookmarkRepository.remove(bookmark);
    }

    async updateBookmarkNote(
        userId: string,
        bookmarkId: string,
        note: string
    ): Promise<BookmarkResponseDto> {
        const bookmark = await this.bookmarkRepository.findOne({
            where: {
                id: bookmarkId,
                user: { id: userId },
            },
            relations: ['article'],
        });

        if (!bookmark) {
            throw new NotFoundException('Bookmark not found');
        }

        bookmark.note = note;
        const updatedBookmark = await this.bookmarkRepository.save(bookmark);
        return this.transformToResponseDto(updatedBookmark);
    }

    private transformToResponseDto(bookmark: BookmarkEntity): BookmarkResponseDto {
        return {
            id: bookmark.id,
            article: {
                id: bookmark.article.id,
                title: bookmark.article.title,
                url: bookmark.article.url,
                portal: bookmark.article.portal,
                section: bookmark.article.section,
                publishedAt: bookmark.article.publishedAt,
            },
            createdAt: bookmark.createdAt,
            note: bookmark.note,
        };
    }
}
