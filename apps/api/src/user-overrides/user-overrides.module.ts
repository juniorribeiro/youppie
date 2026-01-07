import { Module } from '@nestjs/common';
import { UserOverridesService } from './user-overrides.service';
import { UserOverridesController } from './user-overrides.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [UserOverridesService],
    controllers: [UserOverridesController],
    exports: [UserOverridesService],
})
export class UserOverridesModule {}

