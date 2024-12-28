import { Controller, Get, Patch, Param, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetCurrentUser } from 'src/common/decorators/get-current-user.decorator';
import { NotificationService } from './notification.service';
import { NotificationEntity } from './entities/notification.entity';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async getUserNotifications(
        @GetCurrentUser('userId') userId: string
    ): Promise<NotificationEntity[]> {
        return this.notificationService.getUserNotifications(userId);
    }

    @Patch(':id/note')
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth()
    async updateNote(
        @GetCurrentUser('userId') userId: string,
        @Param('id') notificationId: string
    ): Promise<NotificationEntity> {
        return this.notificationService.markNotificationAsRead(userId, notificationId);
    }
}
