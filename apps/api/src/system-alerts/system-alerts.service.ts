import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSystemAlertDto, UpdateSystemAlertDto } from './dto/system-alert.dto';

@Injectable()
export class SystemAlertsService {
    constructor(private prisma: PrismaService) {}

    async create(createAlertDto: CreateSystemAlertDto) {
        return this.prisma.systemAlert.create({
            data: {
                title: createAlertDto.title,
                message: createAlertDto.message,
                type: createAlertDto.type || 'INFO',
                dismissible: createAlertDto.dismissible !== undefined ? createAlertDto.dismissible : true,
                active: createAlertDto.active !== undefined ? createAlertDto.active : true,
            },
        });
    }

    async findAll(activeOnly: boolean = false) {
        const where: any = {};
        if (activeOnly) {
            where.active = true;
        }

        return this.prisma.systemAlert.findMany({
            where,
            orderBy: { created_at: 'desc' },
        });
    }

    async findOne(id: string) {
        const alert = await this.prisma.systemAlert.findUnique({
            where: { id },
        });

        if (!alert) {
            throw new NotFoundException('System alert not found');
        }

        return alert;
    }

    async update(id: string, updateAlertDto: UpdateSystemAlertDto) {
        await this.findOne(id);

        return this.prisma.systemAlert.update({
            where: { id },
            data: updateAlertDto,
        });
    }

    async delete(id: string) {
        await this.findOne(id);

        return this.prisma.systemAlert.delete({
            where: { id },
        });
    }

    async getActiveAlerts() {
        return this.prisma.systemAlert.findMany({
            where: { active: true },
            orderBy: { created_at: 'desc' },
        });
    }
}

