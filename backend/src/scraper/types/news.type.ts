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

export interface NewsPortalConfig {
    name: string;
    baseUrl: string;
    sections: NewsSection[];
}

export interface NewsSection {
    name: string;
    url: string;
    selector: {
        article: string;
        title: string;
        content: string;
        author?: string;
        publishedAt: string;
        imageUrl?: string;
    };
}

export interface NewsMessage {
    articles: NewsArticle[];
    portalName: string;
    scrapedAt: Date;
    totalArticles: number;
}
