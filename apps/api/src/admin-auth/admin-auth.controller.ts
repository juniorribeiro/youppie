import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-auth.dto';
import { AdminAuthGuard } from './admin-auth.guard';

@Controller('admin/auth')
export class AdminAuthController {
    constructor(private adminAuthService: AdminAuthService) {}

    @Post('login')
    async login(@Body() loginDto: AdminLoginDto) {
        return this.adminAuthService.login(loginDto);
    }

    @UseGuards(AdminAuthGuard)
    @Post('me')
    async getMe(@Request() req: any) {
        return {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
        };
    }
}

