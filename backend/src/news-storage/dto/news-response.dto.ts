export class NewsArticleResponseDto {
    id: string;
    title: string;
    content: string;
    url: string;
    author?: string;
    portal: string;
    section: string;
    imageUrl?: string;
    publishedAt: Date;
    scrapedAt: Date;
}

export class NewsArticlesResponseDto {
    data: NewsArticleResponseDto[];
    total: number;
    limit: number;
    offset: number;
}
