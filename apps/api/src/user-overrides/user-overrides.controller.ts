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
import { UserOverridesService } from './user-overrides.service';
import { CreateUserOverrideDto, UpdateUserOverrideDto } from './dto/user-override.dto';
import { AdminAuthGuard } from '../admin-auth/admin-auth.guard';

@Controller('admin/user-overrides')
@UseGuards(AdminAuthGuard)
export class UserOverridesController {
    constructor(private userOverridesService: UserOverridesService) {}

    @Post()
    async create(@Request() req: any, @Body() createOverrideDto: CreateUserOverrideDto) {
        return this.userOverridesService.create(req.user.id, createOverrideDto);
    }

    @Get()
    async findAll(
        @Query('user_id') userId?: string,
        @Query('override_type') overrideType?: string,
    ) {
        return this.userOverridesService.findAll(userId, overrideType);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.userOverridesService.findOne(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateOverrideDto: UpdateUserOverrideDto) {
        return this.userOverridesService.update(id, updateOverrideDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.userOverridesService.delete(id);
    }

    @Get('user/:userId/active')
    async getActiveOverridesForUser(@Param('userId') userId: string) {
        return this.userOverridesService.getActiveOverridesForUser(userId);
    }
}

