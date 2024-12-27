import { Injectable, Logger } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { NOTIFICATION_QUEUE } from 'src/common/constants/queue.constant';
import { User } from 'src/user/entities/user.entity';
import { EntityManager } from 'typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly websocketGateway: NotificationGateway
    ) {}

    async createNotification(user: User, message: string): Promise<NotificationEntity> {
        const notification = new NotificationEntity({
            user: user,
            message,
        });

        await this.entityManager.save(notification);

        this.websocketGateway.sendNotification(user.id, {
            type: NOTIFICATION_QUEUE,
            message,
        });

        this.logger.log(`Created notification for user ${user.id}`);

        return notification;
    }

    async getUserNotifications(userId: string): Promise<NotificationEntity[]> {
        const notifications = await this.entityManager.find(NotificationEntity, {
            where: {
                user: {
                    id: userId,
                },
            },
            order: {
                createdAt: 'DESC',
            },
        });

        return notifications;
    }
}
