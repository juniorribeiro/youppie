import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Param,
    UseGuards,
    Request,
    Query,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, CreateTicketMessageDto, UpdateTicketStatusDto, UpdateTicketPriorityDto } from './dto/ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminAuthGuard } from '../admin-auth/admin-auth.guard';

const uploadPath = join(process.cwd(), 'uploads');

if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
}

@Controller('tickets')
export class TicketsController {
    constructor(private ticketsService: TicketsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Request() req: any, @Body() createTicketDto: CreateTicketDto) {
        return this.ticketsService.create(req.user.id, createTicketDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Request() req: any, @Query('status') status?: string) {
        return this.ticketsService.findAll(req.user.id, status);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Request() req: any, @Param('id') id: string) {
        return this.ticketsService.findOne(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/messages')
    @UseInterceptors(
        FileInterceptor('attachment', {
            storage: diskStorage({
                destination: uploadPath,
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `ticket-${uniqueSuffix}${ext}`);
                },
            }),
            limits: {
                fileSize: 10 * 1024 * 1024,
            },
            fileFilter: (req, file, callback) => {
                const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                if (allowedMimes.includes(file.mimetype)) {
                    callback(null, true);
                } else {
                    callback(new BadRequestException('Tipo de arquivo não permitido'), false);
                }
            },
        }),
    )
    async addMessage(
        @Request() req: any,
        @Param('id') id: string,
        @Body() createMessageDto: CreateTicketMessageDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let attachmentUrl: string | undefined;
        if (file) {
            const baseUrl = process.env.API_URL || 'http://localhost:3003';
            attachmentUrl = `${baseUrl}/uploads/${file.filename}`;
        }

        return this.ticketsService.addMessage(
            id,
            'USER',
            req.user.id,
            createMessageDto.message,
            attachmentUrl,
        );
    }
}

@Controller('admin/tickets')
@UseGuards(AdminAuthGuard)
export class AdminTicketsController {
    constructor(private ticketsService: TicketsService) {}

    @Get()
    async findAll(@Query('status') status?: string, @Query('priority') priority?: string) {
        return this.ticketsService.findAll(undefined, status, priority);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.ticketsService.findOne(id);
    }

    @Put(':id/status')
    async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateTicketStatusDto) {
        return this.ticketsService.updateStatus(id, updateStatusDto);
    }

    @Put(':id/priority')
    async updatePriority(@Param('id') id: string, @Body() updatePriorityDto: UpdateTicketPriorityDto) {
        return this.ticketsService.updatePriority(id, updatePriorityDto);
    }

    @Post(':id/messages')
    @UseInterceptors(
        FileInterceptor('attachment', {
            storage: diskStorage({
                destination: uploadPath,
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `ticket-${uniqueSuffix}${ext}`);
                },
            }),
            limits: {
                fileSize: 10 * 1024 * 1024,
            },
            fileFilter: (req, file, callback) => {
                const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                if (allowedMimes.includes(file.mimetype)) {
                    callback(null, true);
                } else {
                    callback(new BadRequestException('Tipo de arquivo não permitido'), false);
                }
            },
        }),
    )
    async addMessage(
        @Request() req: any,
        @Param('id') id: string,
        @Body() createMessageDto: CreateTicketMessageDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        let attachmentUrl: string | undefined;
        if (file) {
            const baseUrl = process.env.API_URL || 'http://localhost:3003';
            attachmentUrl = `${baseUrl}/uploads/${file.filename}`;
        }

        return this.ticketsService.addMessage(
            id,
            'ADMIN',
            req.user.id,
            createMessageDto.message,
            attachmentUrl,
        );
    }
}

