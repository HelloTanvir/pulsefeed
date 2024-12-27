import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { NOTIFICATION_QUEUE } from 'src/common/constants/queue.constant';
import { NotificationService } from './notification.service';

@Module({
    imports: [
        BullModule.registerQueue({
            name: NOTIFICATION_QUEUE,
        }),
    ],
    providers: [NotificationService],
})
export class NotificationModule {}
