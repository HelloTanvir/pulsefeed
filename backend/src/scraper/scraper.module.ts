import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScraperService } from './services/scraper.service';
import { RabbitMQService } from './services/rabbitmq.service';
import { BatchPublisherService } from './services/batch-publisher.service';

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [ScraperService, RabbitMQService, BatchPublisherService],
})
export class ScraperModule {}
