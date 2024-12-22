import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { newsPortals } from '../configs/portals.config';
import { NewsArticle, NewsMessage, NewsPortalConfig, NewsSection } from '../types/news.type';
import * as puppeteer from 'puppeteer';
import { Retry } from '../decorators/retry.decorator';
import { RetryUtility } from '../utils/retry.util';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class ScraperService {
    private readonly logger = new Logger(ScraperService.name);
    private readonly portals: NewsPortalConfig[] = newsPortals;
    // import should be added to the top of the file
    // import * as cheerio from 'cheerio';
    // private $: cheerio.CheerioAPI;

    constructor(private readonly rabbitMQService: RabbitMQService) {}

    @Cron(CronExpression.EVERY_HOUR, { name: 'scraper', timeZone: 'BST' })
    async handleScraping() {
        this.logger.log('Starting news scraping...');

        try {
            const browser = await puppeteer.launch({
                headless: true,
            });

            for (const portal of this.portals) {
                const articles = await this.scrapePortal(browser, portal);

                if (articles.length > 0) {
                    const message: NewsMessage = {
                        articles,
                        portalName: portal.name,
                        scrapedAt: new Date(),
                        totalArticles: articles.length,
                    };

                    await this.rabbitMQService.publishNewsArticles(message);
                }
            }

            await browser.close();
        } catch (error) {
            this.logger.error(`Error during scraping: ${error.message}`);
        }
    }

    @Retry({
        maxAttempts: 3,
        delayMs: 1000,
        exponentialBackoff: true,
        maxDelayMs: 10000,
    })
    private async scrapePortal(
        browser: puppeteer.Browser,
        portal: NewsPortalConfig
    ): Promise<NewsArticle[]> {
        const articles: NewsArticle[] = [];

        for (const section of portal.sections) {
            try {
                const sectionArticles = await this.scrapeSectionWithRetry(browser, portal, section);
                articles.push(...sectionArticles);
            } catch (error) {
                this.logger.error(
                    `Error scraping ${portal.name} - ${section.name}: ${error.message}`
                );
            }
        }

        return articles;
    }

    private async scrapeSectionWithRetry(
        browser: puppeteer.Browser,
        portal: NewsPortalConfig,
        section: NewsSection
    ): Promise<NewsArticle[]> {
        return RetryUtility.withRetry(
            async () => {
                const page = await browser.newPage();

                try {
                    await page.setUserAgent(
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    );

                    await page.goto(`${portal.baseUrl}${section.url}`, {
                        waitUntil: 'networkidle0',
                        timeout: 30000,
                    });

                    const articles = await page.$$eval(
                        section.selector.article,
                        (elements, selector, portalName, sectionName) => {
                            return elements.map((element) => ({
                                title:
                                    element.querySelector(selector.title)?.textContent?.trim() ||
                                    '',
                                content:
                                    element.querySelector(selector.content)?.textContent?.trim() ||
                                    '',
                                url: element.querySelector('a')?.href || '',
                                author: selector.author
                                    ? element.querySelector(selector.author)?.textContent?.trim()
                                    : undefined,
                                publishedAt: new Date(),
                                portal: portalName,
                                section: sectionName,
                                imageUrl: selector.imageUrl
                                    ? element.querySelector(selector.imageUrl)?.getAttribute('src')
                                    : undefined,
                            }));
                        },
                        section.selector,
                        portal.name,
                        section.name
                    );

                    return articles;
                } finally {
                    await page.close();
                }
            },
            {
                maxAttempts: 3,
                delayMs: 2000,
                exponentialBackoff: true,
                maxDelayMs: 10000,
            }
        );
    }
}
