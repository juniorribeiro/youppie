import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminAuthGuard } from '../admin-auth/admin-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private notificationsService: NotificationsService) {}

    @Get()
    async findAll(@Request() req: any, @Query('unread') unread?: string) {
        const unreadOnly = unread === 'true';
        return this.notificationsService.findUserNotifications(req.user.id, unreadOnly);
    }

    @Get('unread-count')
    async getUnreadCount(@Request() req: any) {
        const count = await this.notificationsService.getUnreadCount(req.user.id);
        return { count };
    }

    @Get(':id')
    async findOne(@Request() req: any, @Param('id') id: string) {
        return this.notificationsService.findOne(id, req.user.id);
    }

    @Put(':id/read')
    async markAsRead(@Request() req: any, @Param('id') id: string) {
        return this.notificationsService.markAsRead(id, req.user.id);
    }

    @Put('read-all')
    async markAllAsRead(@Request() req: any) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }
}

@Controller('admin/notifications')
@UseGuards(AdminAuthGuard)
export class AdminNotificationsController {
    constructor(private notificationsService: NotificationsService) {}

    @Post()
    async create(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationsService.create(createNotificationDto);
    }

    @Get()
    async findAll(@Query('user_id') userId?: string) {
        return this.notificationsService.findAll(userId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.notificationsService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.notificationsService.delete(id);
    }
}

