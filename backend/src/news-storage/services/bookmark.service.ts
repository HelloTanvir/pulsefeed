import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BookmarkEntity } from '../entities/bookmark.entity';
import { NewsArticleEntity } from '../entities/news-article.entity';
import { CreateBookmarkDto, BookmarkResponseDto } from '../dto/bookmark.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class BookmarkService {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager
    ) {}

    async createBookmark(
        userId: string,
        createBookmarkDto: CreateBookmarkDto
    ): Promise<BookmarkResponseDto> {
        const article = await this.entityManager.findOneBy(NewsArticleEntity, {
            id: createBookmarkDto.articleId,
        });

        if (!article) {
            throw new NotFoundException('Article not found.');
        }

        // Check if bookmark already exists
        const existingBookmark = await this.entityManager.findOne(BookmarkEntity, {
            where: {
                user: { id: userId },
                article: { id: article.id },
            },
            relations: {
                article: true,
                user: true,
            },
        });

        if (existingBookmark) {
            throw new ConflictException('Article already bookmarked');
        }

        const user = await this.entityManager.findOneBy(User, { id: userId });

        const bookmark = new BookmarkEntity({
            user,
            article,
            note: createBookmarkDto.note,
        });

        const savedBookmark = await this.entityManager.save(bookmark);
        return this.transformToResponseDto(savedBookmark);
    }

    async getBookmarks(userId: string): Promise<BookmarkResponseDto[]> {
        const bookmarks = await this.entityManager.find(BookmarkEntity, {
            where: { user: { id: userId } },
            relations: {
                article: true,
                user: true,
            },
            order: { createdAt: 'DESC' },
        });

        return bookmarks.map((bookmark) => this.transformToResponseDto(bookmark));
    }

    async removeBookmark(userId: string, bookmarkId: string): Promise<void> {
        const bookmark = await this.entityManager.findOne(BookmarkEntity, {
            where: {
                id: bookmarkId,
                user: { id: userId },
            },
            relations: {
                user: true,
            },
        });

        if (!bookmark) {
            throw new NotFoundException('Bookmark not found');
        }

        await this.entityManager.remove(bookmark);
    }

    async updateBookmarkNote(
        userId: string,
        bookmarkId: string,
        note: string
    ): Promise<BookmarkResponseDto> {
        const bookmark = await this.entityManager.findOne(BookmarkEntity, {
            where: {
                id: bookmarkId,
                user: { id: userId },
            },
            relations: {
                article: true,
                user: true,
            },
        });

        if (!bookmark) {
            throw new NotFoundException('Bookmark not found');
        }

        bookmark.note = note;
        const updatedBookmark = await this.entityManager.save(bookmark);
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
