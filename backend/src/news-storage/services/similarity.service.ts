import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { NewsArticleEntity } from '../entities/news-article.entity';

@Injectable()
export class SimilarityService {
    private readonly logger = new Logger(SimilarityService.name);

    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager
    ) {}

    async findSimilarArticles(
        id: string,
        limit: number = 5,
        threshold: number = 0.3
    ): Promise<NewsArticleEntity[]> {
        const sourceArticle = await this.entityManager.findOne(NewsArticleEntity, {
            where: { id },
            select: {
                id: true,
                title: true,
                content: true,
                section: true,
            },
        });

        if (!sourceArticle) {
            throw new NotFoundException('Article not found');
        }

        const query = this.entityManager
            .createQueryBuilder(NewsArticleEntity, 'article')
            .select([
                'article.id',
                'article.title',
                'article.url',
                'article.portal',
                'article.section',
                'article.publishedAt',
                'article.imageUrl',
                // Calculate similarity score
                `ts_rank_cd(
                            article.search_vector,
                            to_tsquery('english', :searchQuery)
                        ) as similarity_score`,
            ])
            .where('article.id != :id', { id })
            .andWhere('article.section = :section', { section: sourceArticle.section })
            .andWhere(`article.search_vector @@ to_tsquery('english', :searchQuery)`)
            .orderBy('similarity_score', 'DESC')
            .limit(limit);

        // Create search query from source article's title and content
        const searchTerms = this.processSearchTerms(
            `${sourceArticle.title} ${sourceArticle.content}`
        );

        const results = await query.setParameter('searchQuery', searchTerms).getRawAndEntities();

        // Filter results by threshold and map to final format
        const similarArticles = results.entities.filter(
            (_, index) => results.raw[index].similarity_score >= threshold
        );

        this.logger.debug(
            `Found ${similarArticles.length} similar articles for article with title: ${sourceArticle.title}`
        );

        return similarArticles;
    }

    private processSearchTerms(text: string): string {
        // Extract important words and create a tsquery compatible string
        return (
            text
                .toLowerCase()
                // Remove special characters
                .replace(/[^\w\s]/g, '')
                // Split into words
                .split(/\s+/)
                // Remove short words and common words
                .filter((word) => word.length > 3)
                // Take only first 10 words to avoid query being too long
                .slice(0, 10)
                // Join with OR operator
                .join(' | ')
        );
    }
}
