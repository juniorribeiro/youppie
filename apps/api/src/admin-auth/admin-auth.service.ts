import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AdminLoginDto } from './dto/admin-auth.dto';

@Injectable()
export class AdminAuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async validateAdmin(email: string, password: string): Promise<any> {
        const admin = await this.prisma.admin.findUnique({
            where: { email },
        });

        if (!admin) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

        if (!isPasswordValid) {
            return null;
        }

        const { password_hash, ...result } = admin;
        return result;
    }

    async login(loginDto: AdminLoginDto) {
        const admin = await this.validateAdmin(loginDto.email, loginDto.password);
        if (!admin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: admin.email, sub: admin.id, role: 'admin' };
        const adminJwtSecret = process.env.ADMIN_JWT_SECRET || 'ADMIN_SECRET_KEY_DEV_ONLY';

        return {
            access_token: this.jwtService.sign(payload, {
                secret: adminJwtSecret,
            }),
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
            },
        };
    }
}

