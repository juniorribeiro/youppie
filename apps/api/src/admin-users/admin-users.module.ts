import { Module } from '@nestjs/common';
import { AdminUsersController } from './admin-users.controller';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [UsersModule, PrismaModule],
    controllers: [AdminUsersController],
})
export class AdminUsersModule {}

