export interface NewsArticle {
    title: string;
    content: string;
    url: string;
    author?: string;
    publishedAt: Date;
    portal: string;
    section: string;
    imageUrl?: string;
}

export interface NewsMessage {
    articles: NewsArticle[];
    portalName: string;
    scrapedAt: Date;
    totalArticles: number;
}
