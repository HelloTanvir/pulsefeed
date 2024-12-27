import { Logger } from '@nestjs/common';
import { NewsStorageService } from './news-storage.service';
import { NewsMessage } from 'src/scraper/types/news.type';
import { NEWS_QUEUE } from 'src/common/constants/queue.constant';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor(NEWS_QUEUE)
export class NewsConsumerService extends WorkerHost {
    private readonly logger = new Logger(NewsConsumerService.name);

    constructor(private readonly newsStorageService: NewsStorageService) {
        super();
    }

    async process(job: Job<NewsMessage>) {
        if (job.name === NEWS_QUEUE) {
            this.logger.log(`Processing job with ID: ${job.id}`);

            const message = job.data;
            await this.newsStorageService.storeNewsArticles(message);

            // wait 2 seconds before processing the next job
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }
}
