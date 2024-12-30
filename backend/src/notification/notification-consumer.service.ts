import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { NOTIFICATION_QUEUE } from 'src/common/constants/queue.constant';
import { NotificationService } from './notification.service';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Job } from 'bullmq';
import { NewsArticleEntity } from 'src/news-storage/entities/news-article.entity';
import { SubscriptionEntity } from 'src/user/entities/subscription.entity';

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
            this.logger.log(`Processing notification job with ID: ${job.id}`);

            const {
                article: { portal, section, title },
            } = job.data;

            const subscriptions = await this.entityManager.find(SubscriptionEntity, {
                where: {
                    section,
                },
                relations: {
                    user: true,
                },
            });

            const subscribedUsers = subscriptions.map((sub) => sub.user);

            await Promise.all(
                subscribedUsers.map((user) => {
                    return this.notificationService.createNotification(
                        user,
                        job.data.article,
                        `New article from ${portal} in ${section}: ${title}`
                    );
                })
            );
        }
    }
}
