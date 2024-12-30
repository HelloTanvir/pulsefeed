import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Like, Between, EntityManager, In, Not, IsNull } from 'typeorm';
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
import { SimilarityService } from './similarity.service';

@Injectable()
export class NewsStorageService {
    private readonly logger = new Logger(NewsStorageService.name);

    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        @InjectQueue(NOTIFICATION_QUEUE) private readonly notificationsQueue: Queue,
        private readonly similarityService: SimilarityService
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
            url: 'none',
            portal: '_admin',
            createdByAdmin: true,
            section: articleDto.section.toLowerCase(),
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
        const whereConditions: any = {
            //skipping articles without image
            imageUrl: Not(IsNull()),
        };

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
            relations: {
                likedBy: true,
                comments: true,
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
        const article = await this.entityManager.findOne(NewsArticleEntity, {
            where: { id },
            relations: {
                likedBy: true,
                comments: {
                    user: true,
                },
            },
        });

        if (!article) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }

        return article;
    }

    async getSimilarArticles(id: string): Promise<NewsArticlesResponseDto> {
        const similarArticles = await this.similarityService.findSimilarArticles(id);

        return {
            data: similarArticles,
            total: similarArticles.length,
            limit: similarArticles.length,
            offset: 0,
        };
    }

    async likeArticle(id: string, userId: string): Promise<NewsArticleEntity> {
        const article = await this.entityManager.findOneOrFail(NewsArticleEntity, {
            where: { id },
        });
        const user = await this.entityManager.findOneBy(User, { id: userId });

        const isAlreadyLiked = article.likedBy.some((u) => u.id === user.id);
        if (isAlreadyLiked) {
            // Unlike the article
            article.likedBy = article.likedBy.filter((u) => u.id !== user.id);
            await this.entityManager.save(article);
            return article;
        }

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
            relations: {
                comments: true,
            },
        });
        const user = await this.entityManager.findOneBy(User, { id: userId });

        const comment = new CommentEntity({});
        comment.content = commentDto.content;
        comment.user = user;

        await this.entityManager.save(comment);

        article.comments = [...(article.comments || []), comment];
        await this.entityManager.save(article);

        return article;
    }
}
