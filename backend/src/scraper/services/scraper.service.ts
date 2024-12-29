import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NewsArticle, NewsMessage } from '../types/news.type';
import { InjectQueue } from '@nestjs/bullmq';
import { NEWS_QUEUE } from 'src/common/constants/queue.constant';
import { Queue } from 'bullmq';
import * as cheerio from 'cheerio';

interface Section {
    name: string;
    url: string;
}

@Injectable()
export class ScraperService {
    private readonly logger = new Logger(ScraperService.name);
    private $: cheerio.CheerioAPI;

    constructor(@InjectQueue(NEWS_QUEUE) private readonly newsQueue: Queue) {}

    @Cron(CronExpression.EVERY_HOUR, { name: 'scraper', timeZone: 'BST' })
    async handleScraping() {
        this.logger.log('Starting news scraping...');

        await this.scapeProthomAlo();
        await this.scrapeSamakal();

        this.logger.log('Finished news scraping...');
    }

    private async scapeProthomAlo() {
        this.logger.log('Scraping Prothom Alo...');

        const sections: Section[] = [
            {
                name: 'National',
                url: 'https://en.prothomalo.com/api/v1/collections/bangladesh',
            },
            {
                name: 'International',
                url: 'https://en.prothomalo.com/api/v1/collections/international',
            },
            {
                name: 'Sports',
                url: 'https://en.prothomalo.com/api/v1/collections/sports',
            },
            {
                name: 'Opinion',
                url: 'https://en.prothomalo.com/api/v1/collections/opinion',
            },
            {
                name: 'Business',
                url: 'https://en.prothomalo.com/api/v1/collections/business',
            },
            {
                name: 'Youth',
                url: 'https://en.prothomalo.com/api/v1/collections/youth',
            },
            {
                name: 'Entertainment',
                url: 'https://en.prothomalo.com/api/v1/collections/entertainment',
            },
            {
                name: 'Lifestyle',
                url: 'https://en.prothomalo.com/api/v1/collections/lifestyle',
            },
            {
                name: 'Claim vs Fact',
                url: 'https://en.prothomalo.com/api/v1/collections/claim-vs-fact',
            },
        ];

        for (const section of sections) {
            this.logger.log(`Scraping Prothom Alo ${section.name}...`);

            const response = await fetch(section.url);
            const data: {
                items: {
                    story: {
                        headline: string;
                        url: string;
                        'author-name': string;
                        'hero-image-s3-key': string;
                        'last-published-at': string;
                        cards: {
                            'story-elements': {
                                text: string;
                            }[];
                        }[];
                    };
                }[];
            } = await response.json();

            const articles: NewsArticle[] = data?.items?.map((item) => {
                return {
                    title: item.story.headline,
                    content:
                        item.story.cards
                            ?.map((card) =>
                                card['story-elements']?.map((element) => element.text).join(' ')
                            )
                            .join(' ') || '',
                    url: item.story.url,
                    author: item.story['author-name'],
                    publishedAt: new Date(item.story['last-published-at']),
                    portal: 'Prothom Alo',
                    section: section.name,
                    imageUrl: item.story['hero-image-s3-key']
                        ? `https://images.prothomalo.com/${item.story['hero-image-s3-key']}`
                        : undefined,
                };
            });

            const newsMessage: NewsMessage = {
                articles,
                portalName: 'Prothom Alo',
                scrapedAt: new Date(),
                totalArticles: articles.length,
            };

            await this.newsQueue.add(NEWS_QUEUE, newsMessage);

            this.logger.log(`Scraped ${articles.length} articles from Prothom Alo ${section.name}`);
        }
    }

    private async scrapeSamakal() {
        this.logger.log('Scraping Samakal...');

        const sections: Section[] = [
            {
                name: 'National',
                url: 'https://en.samakal.com/ajax/load/categorynews/1/30/0/0',
            },
            {
                name: 'International',
                url: 'https://en.samakal.com/ajax/load/categorynews/15/30/0/0',
            },
            {
                name: 'Politics',
                url: 'https://en.samakal.com/ajax/load/categorynews/22/30/0/0',
            },
            {
                name: 'Sports',
                url: 'https://en.samakal.com/ajax/load/categorynews/9/30/0/0',
            },
            {
                name: 'Entertainment',
                url: 'https://en.samakal.com/ajax/load/categorynews/33/30/0/0',
            },
            {
                name: 'Opinion',
                url: 'https://en.samakal.com/ajax/load/categorynews/65/30/0/0',
            },
            {
                name: 'Lifestyle',
                url: 'https://en.samakal.com/ajax/load/categorynews/40/30/0/0',
            },
            {
                name: 'Business',
                url: 'https://en.samakal.com/ajax/load/categorynews/3/30/0/0',
            },
        ];

        for (const section of sections) {
            this.logger.log(`Scraping Samakal ${section.name}...`);

            const response = await fetch(section.url);
            const data: {
                headline: string;
                url: string;
                created_at: string;
                reporter: string;
                thumb: string;
            }[] = await response.json();

            const contents = await Promise.all(
                data?.map(async (item) => {
                    const detailResponse = await fetch(item.url);
                    const detailData = await detailResponse.text();
                    this.$ = cheerio.load(detailData);

                    return this.$('.newsBody').text();
                })
            );

            const articles: NewsArticle[] = data?.map((item, index) => {
                return {
                    title: item.headline,
                    content: contents[index],
                    url: item.url,
                    author: item.reporter,
                    publishedAt: new Date(item.created_at),
                    portal: 'Samakal',
                    section: section.name,
                    imageUrl: item.thumb,
                };
            });

            const newsMessage: NewsMessage = {
                articles,
                portalName: 'Samakal',
                scrapedAt: new Date(),
                totalArticles: articles.length,
            };

            await this.newsQueue.add(NEWS_QUEUE, newsMessage);

            this.logger.log(`Scraped ${articles.length} articles from Samakal ${section.name}`);
        }
    }
}
