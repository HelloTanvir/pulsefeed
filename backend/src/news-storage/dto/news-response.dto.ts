export class NewsArticleResponseDto {
    /** @example 1 */
    id: string;
    /** @example Article title */
    title: string;
    /** @example Article content */
    content: string;
    /** @example Article url */
    url: string;
    /** @example Article author */
    author?: string;
    /** @example Article portal */
    portal: string;
    /** @example Article section */
    section: string;
    /** @example Article image url */
    imageUrl?: string;
    /** @example 2021-01-01T00:00:00.000Z */
    publishedAt: Date;
    /** @example 2021-01-01T00:00:00.000Z */
    scrapedAt: Date;
}

export class NewsArticlesResponseDto {
    data: NewsArticleResponseDto[];
    /** @example 100 */
    total: number;
    /** @example 20 */
    limit: number;
    /** @example 0 */
    offset: number;
}
