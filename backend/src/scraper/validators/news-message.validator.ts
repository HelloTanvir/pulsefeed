import { NewsArticle, NewsMessage } from '../types/news.type';

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class NewsMessageValidator {
    static validateArticle(article: NewsArticle): void {
        if (!article.title?.trim()) {
            throw new ValidationError('Article title is required');
        }

        if (!article.content?.trim()) {
            throw new ValidationError('Article content is required');
        }

        if (!article.url?.trim()) {
            throw new ValidationError('Article URL is required');
        }

        try {
            new URL(article.url);
        } catch {
            throw new ValidationError('Invalid article URL format');
        }

        if (!article.portal?.trim()) {
            throw new ValidationError('Portal name is required');
        }

        if (!article.section?.trim()) {
            throw new ValidationError('Section name is required');
        }

        if (article.imageUrl) {
            try {
                new URL(article.imageUrl);
            } catch {
                throw new ValidationError('Invalid image URL format');
            }
        }
    }

    static validateMessage(message: NewsMessage): void {
        if (!Array.isArray(message.articles)) {
            throw new ValidationError('Articles must be an array');
        }

        if (message.articles.length === 0) {
            throw new ValidationError('Articles array cannot be empty');
        }

        if (!message.portalName?.trim()) {
            throw new ValidationError('Portal name is required');
        }

        if (!(message.scrapedAt instanceof Date)) {
            throw new ValidationError('Invalid scrapedAt date');
        }

        if (message.totalArticles !== message.articles.length) {
            throw new ValidationError('Total articles count mismatch');
        }

        message.articles.forEach((article, index) => {
            try {
                this.validateArticle(article);
            } catch (error) {
                throw new ValidationError(`Invalid article at index ${index}: ${error.message}`);
            }
        });
    }
}
