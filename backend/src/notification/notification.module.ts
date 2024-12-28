import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationConsumerService } from './notification-consumer.service';
import { NotificationGateway } from './notification.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { NotificationController } from './notification.controller';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationEntity])],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationConsumerService, NotificationGateway],
})
export class NotificationModule {}
