import { Module } from '@nestjs/common';
import { SystemAlertsService } from './system-alerts.service';
import { SystemAlertsController, PublicSystemAlertsController } from './system-alerts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [SystemAlertsService],
    controllers: [SystemAlertsController, PublicSystemAlertsController],
    exports: [SystemAlertsService],
})
export class SystemAlertsModule {}

