import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AtGuard } from './auth/guards/access-token.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DBModule } from './db/db.module';
import { ScraperModule } from './scraper/scraper.module';
import { UserModule } from './user/user.module';
import { NewsStorageModule } from './news-storage/news-storage.module';
import { BullMQModule } from './bullmq/bullmq.module';
import { NotificationModule } from './notification/notification.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DBModule,
        BullMQModule,
        AuthModule,
        UserModule,
        ScraperModule,
        NewsStorageModule,
        NotificationModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AtGuard,
        },
        // {
        //     provide: APP_INTERCEPTOR,
        //     useClass: ResponseTransformInterceptor,
        // },
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule {}
