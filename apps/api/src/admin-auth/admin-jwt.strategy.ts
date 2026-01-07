import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
    constructor(private prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.ADMIN_JWT_SECRET || 'ADMIN_SECRET_KEY_DEV_ONLY',
        });
    }

    async validate(payload: any) {
        const admin = await this.prisma.admin.findUnique({
            where: { id: payload.sub },
        });

        if (!admin) {
            return null;
        }

        return { id: admin.id, email: admin.email, name: admin.name, role: 'admin' };
    }
}

