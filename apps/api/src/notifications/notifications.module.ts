import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController, AdminNotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [NotificationsService],
    controllers: [NotificationsController, AdminNotificationsController],
    exports: [NotificationsService],
})
export class NotificationsModule {}

