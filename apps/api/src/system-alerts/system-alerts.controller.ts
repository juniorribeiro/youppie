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
} from '@nestjs/common';
import { SystemAlertsService } from './system-alerts.service';
import { CreateSystemAlertDto, UpdateSystemAlertDto } from './dto/system-alert.dto';
import { AdminAuthGuard } from '../admin-auth/admin-auth.guard';

@Controller('admin/system-alerts')
@UseGuards(AdminAuthGuard)
export class SystemAlertsController {
    constructor(private systemAlertsService: SystemAlertsService) {}

    @Post()
    async create(@Body() createAlertDto: CreateSystemAlertDto) {
        return this.systemAlertsService.create(createAlertDto);
    }

    @Get()
    async findAll(@Query('active_only') activeOnly?: string) {
        const activeOnlyBool = activeOnly === 'true';
        return this.systemAlertsService.findAll(activeOnlyBool);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.systemAlertsService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateAlertDto: UpdateSystemAlertDto) {
        return this.systemAlertsService.update(id, updateAlertDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.systemAlertsService.delete(id);
    }
}

@Controller('system-alerts')
export class PublicSystemAlertsController {
    constructor(private systemAlertsService: SystemAlertsService) {}

    @Get('active')
    async getActiveAlerts() {
        return this.systemAlertsService.getActiveAlerts();
    }
}

