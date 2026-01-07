import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto, UpdatePasswordDto } from './dto/user.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/5ee8e076-f7e7-47f3-8791-bd14ef960968',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.service.ts:11',message:'Prisma user.create called',data:{email:data.email,name:data.name,hasPasswordHash:!!data.password_hash},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
        // #endregion
        try {
            const user = await this.prisma.user.create({
                data,
            });
            // #region agent log
            fetch('http://127.0.0.1:7246/ingest/5ee8e076-f7e7-47f3-8791-bd14ef960968',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.service.ts:16',message:'Prisma user.create succeeded',data:{userId:user.id,email:user.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
            // #endregion
            return user;
        } catch (error: any) {
            // #region agent log
            fetch('http://127.0.0.1:7246/ingest/5ee8e076-f7e7-47f3-8791-bd14ef960968',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.service.ts:20',message:'Prisma user.create error',data:{errorMessage:error.message,errorCode:error.code,errorName:error.name,meta:error.meta},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
            // #endregion
            throw error;
        }
    }

    async findOne(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id }
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verificar se email já está em uso por outro usuário
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.findOne(updateUserDto.email);
            if (existingUser) {
                throw new ConflictException('Email already in use');
            }
        }

        return this.prisma.user.update({
            where: { id },
            data: {
                ...(updateUserDto.name && { name: updateUserDto.name }),
                ...(updateUserDto.email && { email: updateUserDto.email }),
            },
        });
    }

    async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto): Promise<void> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Verificar senha atual
        const isPasswordValid = await bcrypt.compare(updatePasswordDto.currentPassword, user.password_hash);
        if (!isPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Validar nova senha
        if (updatePasswordDto.newPassword.length < 6) {
            throw new BadRequestException('New password must be at least 6 characters');
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);

        await this.prisma.user.update({
            where: { id },
            data: { password_hash: hashedPassword },
        });
    }

    async updateAvatar(id: string, avatarUrl: string): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.user.update({
            where: { id },
            data: { avatar_url: avatarUrl },
        });
    }

    async updateTrackingCodes(id: string, updateTrackingDto: UpdateTrackingDto): Promise<User> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.user.update({
            where: { id },
            data: {
                ...(updateTrackingDto.google_analytics_id !== undefined && { google_analytics_id: updateTrackingDto.google_analytics_id || null }),
                ...(updateTrackingDto.google_tag_manager_id !== undefined && { google_tag_manager_id: updateTrackingDto.google_tag_manager_id || null }),
                ...(updateTrackingDto.facebook_pixel_id !== undefined && { facebook_pixel_id: updateTrackingDto.facebook_pixel_id || null }),
                ...(updateTrackingDto.tracking_head !== undefined && { tracking_head: updateTrackingDto.tracking_head || null }),
                ...(updateTrackingDto.tracking_body !== undefined && { tracking_body: updateTrackingDto.tracking_body || null }),
                ...(updateTrackingDto.tracking_footer !== undefined && { tracking_footer: updateTrackingDto.tracking_footer || null }),
            },
        });
    }
}
