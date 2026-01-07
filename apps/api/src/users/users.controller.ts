import { Controller, Get, Patch, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto, UpdatePasswordDto } from './dto/user.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';

const avatarUploadPath = join(process.cwd(), 'uploads', 'avatars');

// Ensure avatars directory exists
if (!existsSync(avatarUploadPath)) {
    mkdirSync(avatarUploadPath, { recursive: true });
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    async getMe(@Request() req: any) {
        const user = await this.usersService.findById(req.user.id);
        if (!user) {
            throw new Error('User not found');
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...result } = user;
        return result;
    }

    @Patch('me')
    async updateMe(@Request() req: any, @Body() updateUserDto: UpdateUserDto) {
        const user = await this.usersService.update(req.user.id, updateUserDto);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...result } = user;
        return result;
    }

    @Patch('me/password')
    async updatePassword(@Request() req: any, @Body() updatePasswordDto: UpdatePasswordDto) {
        await this.usersService.updatePassword(req.user.id, updatePasswordDto);
        return { message: 'Password updated successfully' };
    }

    @Post('me/avatar')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: avatarUploadPath,
                filename: (req: any, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    const userId = (req.user as any)?.id || 'unknown';
                    callback(null, `${userId}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (allowedMimes.includes(file.mimetype)) {
                    callback(null, true);
                } else {
                    callback(new Error('Only image files are allowed'), false);
                }
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB
            },
        }),
    )
    async uploadAvatar(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('No file uploaded');
        }

        const baseUrl = process.env.API_URL || 'http://localhost:3003';
        const avatarUrl = `${baseUrl}/uploads/avatars/${file.filename}`;

        const user = await this.usersService.updateAvatar(req.user.id, avatarUrl);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...result } = user;
        return result;
    }

    @Patch('tracking')
    async updateTracking(@Request() req: any, @Body() updateTrackingDto: UpdateTrackingDto) {
        const user = await this.usersService.updateTrackingCodes(req.user.id, updateTrackingDto);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...result } = user;
        return result;
    }
}

