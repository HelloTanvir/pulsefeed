import { Module } from '@nestjs/common';
import { NewsStorageService } from './services/news-storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQConsumerService } from './services/rabbitmq-consumer.service';
import { NewsArticleEntity } from './entities/news-article.entity';
import { NewsController } from './controllers/news.controller';
import { BookmarkEntity } from './entities/bookmark.entity';
import { BookmarkService } from './services/bookmark.service';
import { BookmarkController } from './controllers/bookmark.controller';

@Module({
    imports: [TypeOrmModule.forFeature([NewsArticleEntity, BookmarkEntity])],
    controllers: [NewsController, BookmarkController],
    providers: [NewsStorageService, RabbitMQConsumerService, BookmarkService],
})
export class NewsStorageModule {}
