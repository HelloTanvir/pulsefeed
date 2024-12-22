import { Module } from '@nestjs/common';
import { NewsStorageService } from './services/news-storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQConsumerService } from './services/rabbitmq-consumer.service';
import { NewsArticleEntity } from './entities/news-article.entity';
import { NewsController } from './news.controller';

@Module({
    imports: [TypeOrmModule.forFeature([NewsArticleEntity])],
    controllers: [NewsController],
    providers: [NewsStorageService, RabbitMQConsumerService],
})
export class NewsStorageModule {}
