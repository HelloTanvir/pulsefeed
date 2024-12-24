import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScraperService } from './services/scraper.service';
import { NEWS_QUEUE } from 'src/common/constants/queue.constant';
import { BullModule } from '@nestjs/bullmq';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        BullModule.registerQueue({
            name: NEWS_QUEUE,
        }),
    ],
    providers: [ScraperService],
})
export class ScraperModule {}
