import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController, AdminTicketsController } from './tickets.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [PrismaModule, NotificationsModule],
    providers: [TicketsService],
    controllers: [TicketsController, AdminTicketsController],
    exports: [TicketsService],
})
export class TicketsModule {}

