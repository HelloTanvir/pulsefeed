import { NewsPortalConfig } from '../types/news.type';

export const newsPortals: NewsPortalConfig[] = [
    {
        name: 'Reuters',
        baseUrl: 'https://www.reuters.com',
        sections: [
            {
                name: 'World',
                url: '/world',
                selector: {
                    article: 'article[data-testid="article"]',
                    title: '[data-testid="Heading"]',
                    content: '[data-testid="paragraph-text"]',
                    publishedAt: 'time',
                    imageUrl: 'img',
                },
            },
            {
                name: 'Business',
                url: '/business',
                selector: {
                    article: 'article[data-testid="article"]',
                    title: '[data-testid="Heading"]',
                    content: '[data-testid="paragraph-text"]',
                    publishedAt: 'time',
                    imageUrl: 'img',
                },
            },
            {
                name: 'Technology',
                url: '/technology',
                selector: {
                    article: 'article[data-testid="article"]',
                    title: '[data-testid="Heading"]',
                    content: '[data-testid="paragraph-text"]',
                    publishedAt: 'time',
                    imageUrl: 'img',
                },
            },
        ],
    },
    {
        name: 'The Guardian',
        baseUrl: 'https://www.theguardian.com',
        sections: [
            {
                name: 'World',
                url: '/world',
                selector: {
                    article: '.fc-item',
                    title: '.fc-item__title',
                    content: '.fc-item__standfirst',
                    author: '.fc-item__byline',
                    publishedAt: 'time',
                    imageUrl: '.fc-item__image img',
                },
            },
            {
                name: 'Politics',
                url: '/politics',
                selector: {
                    article: '.fc-item',
                    title: '.fc-item__title',
                    content: '.fc-item__standfirst',
                    author: '.fc-item__byline',
                    publishedAt: 'time',
                    imageUrl: '.fc-item__image img',
                },
            },
            {
                name: 'Sports',
                url: '/sport',
                selector: {
                    article: '.fc-item',
                    title: '.fc-item__title',
                    content: '.fc-item__standfirst',
                    author: '.fc-item__byline',
                    publishedAt: 'time',
                    imageUrl: '.fc-item__image img',
                },
            },
        ],
    },
    {
        name: 'BBC News',
        baseUrl: 'https://www.bbc.com/news',
        sections: [
            {
                name: 'World',
                url: '/world',
                selector: {
                    article: '.gs-c-promo',
                    title: '.gs-c-promo-heading',
                    content: '.gs-c-promo-summary',
                    publishedAt: 'time',
                    imageUrl: 'img.gs-o-responsive-image',
                },
            },
            {
                name: 'Business',
                url: '/business',
                selector: {
                    article: '.gs-c-promo',
                    title: '.gs-c-promo-heading',
                    content: '.gs-c-promo-summary',
                    publishedAt: 'time',
                    imageUrl: 'img.gs-o-responsive-image',
                },
            },
            {
                name: 'Technology',
                url: '/technology',
                selector: {
                    article: '.gs-c-promo',
                    title: '.gs-c-promo-heading',
                    content: '.gs-c-promo-summary',
                    publishedAt: 'time',
                    imageUrl: 'img.gs-o-responsive-image',
                },
            },
        ],
    },
];
