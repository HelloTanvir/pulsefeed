import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { NOTIFICATION_QUEUE } from 'src/common/constants/queue.constant';
import { NotificationService } from './notification.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Job } from 'bullmq';
import { NewsArticleEntity } from 'src/news-storage/entities/news-article.entity';
import { User } from 'src/user/entities/user.entity';

@Processor(NOTIFICATION_QUEUE)
export class NotificationConsumerService extends WorkerHost {
    private readonly logger = new Logger(NotificationConsumerService.name);

    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly notificationService: NotificationService
    ) {
        super();
    }

    async process(job: Job<{ article: NewsArticleEntity }>) {
        if (job.name === NOTIFICATION_QUEUE) {
            this.logger.log(`Processing job with ID: ${job.id}`);

            const {
                article: { portal, section, title },
            } = job.data;

            const subscribedUsers = await this.entityManager
                .createQueryBuilder(User, 'user')
                .where(':section = ANY(user.subscribedSections)', { section })
                .getMany();

            await Promise.all(
                subscribedUsers.map((user) => {
                    return this.notificationService.createNotification(
                        user,
                        `New article from ${portal} in ${section}: ${title}`
                    );
                })
            );
        }
    }
}
