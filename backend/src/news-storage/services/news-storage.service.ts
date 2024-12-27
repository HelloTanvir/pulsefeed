import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Like, Between, EntityManager } from 'typeorm';
import { NewsArticleEntity } from '../entities/news-article.entity';
import { NewsMessage } from 'src/scraper/types/news.type';
import { NewsQueryParamsDto } from '../dto/query-params.dto';
import { NewsArticleResponseDto, NewsArticlesResponseDto } from '../dto/news-response.dto';
import { User } from 'src/user/entities/user.entity';
import { CommentDto } from '../dto/comment.dto';
import { CommentEntity } from '../entities/comment.entity';
import { AddArticleDto } from '../dto/add-article.dto';

@Injectable()
export class NewsStorageService {
    private readonly logger = new Logger(NewsStorageService.name);

    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager
    ) {}

    async storeNewsArticles(message: NewsMessage): Promise<void> {
        try {
            const articles = message.articles.map((article) => {
                const entity = new NewsArticleEntity({});
                entity.title = article.title;
                entity.content = article.content;
                entity.url = article.url;
                entity.author = article.author;
                entity.portal = article.portal.toLowerCase();
                entity.section = article.section.toLowerCase();
                entity.imageUrl = article.imageUrl;
                entity.publishedAt = article.publishedAt;
                entity.scrapedAt = message.scrapedAt;
                return entity;
            });

            await this.entityManager.save(articles);

            this.logger.log(
                `Successfully stored ${articles.length} articles from ${message.portalName}`
            );
        } catch (error) {
            this.logger.error('Error storing news articles:', error);
            throw error;
        }
    }

    async addArticle(userId: string, articleDto: AddArticleDto): Promise<NewsArticleResponseDto> {
        const user = await this.entityManager.findOneBy(User, { id: userId });

        const article = new NewsArticleEntity({
            ...articleDto,
            author: user.name,
        });

        await this.entityManager.save(article);

        return article;
    }

    async findArticles(queryParams: NewsQueryParamsDto): Promise<NewsArticlesResponseDto> {
        const { search, portal, section, fromDate, toDate, limit, offset, sortBy, sortOrder } =
            queryParams;

        // Build query conditions
        const whereConditions: any = {};

        if (search) {
            whereConditions.title = Like(`%${search}%`);
        }

        if (portal) {
            whereConditions.portal = portal.toLowerCase();
        }

        if (section) {
            whereConditions.section = section.toLowerCase();
        }

        if (fromDate && toDate) {
            whereConditions.publishedAt = Between(fromDate, toDate);
        }

        // Get total count
        const total = await this.entityManager.count(NewsArticleEntity, {
            where: whereConditions,
        });

        // Get paginated results
        const articles = await this.entityManager.find(NewsArticleEntity, {
            where: whereConditions,
            order: {
                [sortBy]: sortOrder,
            },
            skip: offset,
            take: limit,
        });

        return {
            data: articles,
            total,
            limit,
            offset,
        };
    }

    async getPortals(): Promise<string[]> {
        const result = await this.entityManager.find(NewsArticleEntity, {
            select: ['portal'],
            order: {
                portal: 'ASC',
            },
        });

        return [...new Set(result.map((item) => item.portal))];
    }

    async getSections(): Promise<string[]> {
        const result = await this.entityManager.find(NewsArticleEntity, {
            select: ['section'],
            order: {
                section: 'ASC',
            },
        });

        return [...new Set(result.map((item) => item.section))];
    }

    async getArticleById(id: string): Promise<NewsArticleEntity | null> {
        return this.entityManager.findOneBy(NewsArticleEntity, { id });
    }

    async likeArticle(id: string, userId: string): Promise<NewsArticleEntity> {
        const article = await this.entityManager.findOneOrFail(NewsArticleEntity, {
            where: { id },
        });
        const user = await this.entityManager.findOneBy(User, { id: userId });

        article.likedBy = [...new Set([...(article.likedBy || []), user])];
        await this.entityManager.save(article);

        return article;
    }

    async commentOnArticle(
        id: string,
        userId: string,
        commentDto: CommentDto
    ): Promise<NewsArticleEntity> {
        const article = await this.entityManager.findOneOrFail(NewsArticleEntity, {
            where: { id },
        });
        const user = await this.entityManager.findOneBy(User, { id: userId });

        const comment = new CommentEntity({});
        comment.content = commentDto.content;
        comment.user = user;
        comment.article = article;

        await this.entityManager.save(comment);

        article.comments = [...new Set([...(article.comments || []), comment])];
        await this.entityManager.save(article);

        return article;
    }
}
