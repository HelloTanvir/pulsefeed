import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like, Between } from 'typeorm';
import { NewsArticleEntity } from '../entities/news-article.entity';
import { Retry } from 'src/scraper/decorators/retry.decorator';
import { NewsMessage } from 'src/scraper/types/news.type';
import { NewsQueryParamsDto } from '../dto/query-params.dto';
import { NewsArticlesResponseDto } from '../dto/news-response.dto';

@Injectable()
export class NewsStorageService {
    private readonly logger = new Logger(NewsStorageService.name);

    constructor(
        @InjectRepository(NewsArticleEntity)
        private readonly newsRepository: Repository<NewsArticleEntity>,
        private readonly dataSource: DataSource
    ) {}

    @Retry({
        maxAttempts: 3,
        delayMs: 1000,
        exponentialBackoff: true,
    })
    async storeNewsArticles(message: NewsMessage): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const articles = message.articles.map((article) => {
                const entity = new NewsArticleEntity({});
                entity.title = article.title;
                entity.content = article.content;
                entity.url = article.url;
                entity.author = article.author;
                entity.portal = article.portal;
                entity.section = article.section;
                entity.imageUrl = article.imageUrl;
                entity.publishedAt = article.publishedAt;
                entity.scrapedAt = message.scrapedAt;
                return entity;
            });

            // Batch insert articles using query builder for better performance
            await queryRunner.manager
                .createQueryBuilder()
                .insert()
                .into(NewsArticleEntity)
                .values(articles)
                .orUpdate(['content', 'author', 'imageUrl', 'scrapedAt'], ['url', 'portal'])
                .execute();

            await queryRunner.commitTransaction();

            this.logger.log(
                `Successfully stored ${articles.length} articles from ${message.portalName}`
            );
        } catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error('Error storing news articles:', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
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
            whereConditions.portal = portal;
        }

        if (section) {
            whereConditions.section = section;
        }

        if (fromDate && toDate) {
            whereConditions.publishedAt = Between(fromDate, toDate);
        }

        // Get total count
        const total = await this.newsRepository.count({
            where: whereConditions,
        });

        // Get paginated results
        const articles = await this.newsRepository.find({
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
        const result = await this.newsRepository
            .createQueryBuilder('article')
            .select('DISTINCT article.portal')
            .orderBy('article.portal')
            .getRawMany();

        return result.map((item) => item.portal);
    }

    async getSections(): Promise<string[]> {
        const result = await this.newsRepository
            .createQueryBuilder('article')
            .select('DISTINCT article.section')
            .orderBy('article.section')
            .getRawMany();

        return result.map((item) => item.section);
    }

    async getArticleById(id: string): Promise<NewsArticleEntity | null> {
        return this.newsRepository.findOneBy({ id });
    }
}
