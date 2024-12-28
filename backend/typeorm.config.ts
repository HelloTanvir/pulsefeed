import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { Auth } from './src/auth/entities/auth.entity';
import { BookmarkEntity } from './src/news-storage/entities/bookmark.entity';
import { CommentEntity } from './src/news-storage/entities/comment.entity';
import { NewsArticleEntity } from './src/news-storage/entities/news-article.entity';
import { NotificationEntity } from './src/notification/entities/notification.entity';
import { User } from './src/user/entities/user.entity';
import { DataSource } from 'typeorm';

config();

const configService = new ConfigService();

export default new DataSource({
    type: 'postgres',
    // host: configService.getOrThrow('POSTGRES_HOST'),
    host: 'localhost',
    port: configService.getOrThrow('POSTGRES_PORT'),
    database: configService.getOrThrow('POSTGRES_DB'),
    username: configService.getOrThrow('POSTGRES_USER'),
    password: configService.getOrThrow('POSTGRES_PASSWORD'),
    migrations: ['migrations/**'],
    entities: [Auth, User, NewsArticleEntity, CommentEntity, BookmarkEntity, NotificationEntity],
});
