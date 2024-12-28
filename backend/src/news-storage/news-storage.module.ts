import { Module } from '@nestjs/common';
import { NewsStorageService } from './services/news-storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsConsumerService } from './services/news-consumer.service';
import { NewsArticleEntity } from './entities/news-article.entity';
import { NewsController } from './controllers/news.controller';
import { BookmarkEntity } from './entities/bookmark.entity';
import { BookmarkService } from './services/bookmark.service';
import { BookmarkController } from './controllers/bookmark.controller';
import { CommentEntity } from './entities/comment.entity';
import { BullModule } from '@nestjs/bullmq';
import { NOTIFICATION_QUEUE } from 'src/common/constants/queue.constant';
import { SimilarityService } from './services/similarity.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([NewsArticleEntity, CommentEntity, BookmarkEntity]),
        BullModule.registerQueue({
            name: NOTIFICATION_QUEUE,
        }),
    ],
    controllers: [NewsController, BookmarkController],
    providers: [NewsStorageService, SimilarityService, NewsConsumerService, BookmarkService],
})
export class NewsStorageModule {}
