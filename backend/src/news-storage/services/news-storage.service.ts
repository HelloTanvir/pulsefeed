import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Like, Between, EntityManager, In } from 'typeorm';
import { NewsArticleEntity } from '../entities/news-article.entity';
import { NewsMessage } from 'src/scraper/types/news.type';
import { NewsQueryParamsDto } from '../dto/query-params.dto';
import { NewsArticleResponseDto, NewsArticlesResponseDto } from '../dto/news-response.dto';
import { User } from 'src/user/entities/user.entity';
import { CommentDto } from '../dto/comment.dto';
import { CommentEntity } from '../entities/comment.entity';
import { AddArticleDto } from '../dto/add-article.dto';
import { Queue } from 'bullmq';
import { NOTIFICATION_QUEUE } from 'src/common/constants/queue.constant';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class NewsStorageService {
    private readonly logger = new Logger(NewsStorageService.name);

    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationsQueue: Queue
    ) {}

    async storeNewsArticles(message: NewsMessage): Promise<void> {
        const { articles, portalName, scrapedAt } = message;

        try {
            const urls = articles.map((article) => article.url);
            const existingArticles = await this.entityManager.find(NewsArticleEntity, {
                where: { url: In(urls) },
                select: ['url'],
            });
            const existingUrls = new Set(existingArticles.map((article) => article.url));

            const newArticles = articles
                .filter((article) => !existingUrls.has(article.url))
                .map((article) => {
                    const entity = new NewsArticleEntity({
                        ...article,
                        portal: article.portal.toLowerCase(),
                        section: article.section.toLowerCase(),
                        scrapedAt,
                    });
                    return entity;
                });

            if (newArticles.length === 0) {
                this.logger.log(`No new articles to store from ${portalName}`);
                return;
            }

            await this.entityManager.transaction(async (transactionalEntityManager) => {
                const savedArticles = await transactionalEntityManager.save(newArticles);

                // Queue notifications for all new articles
                const notificationPromises = savedArticles.map((article) =>
                    this.notificationsQueue.add(NOTIFICATION_QUEUE, { article })
                );
                await Promise.all(notificationPromises);

                // Queue notification for the last article
                // await this.notificationsQueue.add(NOTIFICATION_QUEUE, {
                //     article: savedArticles[savedArticles.length - 1],
                // });

                this.logger.log(
                    `Successfully stored ${savedArticles.length} new articles from ${portalName}. ` +
                        `Skipped ${articles.length - savedArticles.length} existing articles.`
                );
            });
        } catch (error) {
            this.logger.error(`Error storing news articles from ${portalName}:`, error);
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

        await this.notificationsQueue.add(NOTIFICATION_QUEUE, { article });

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
