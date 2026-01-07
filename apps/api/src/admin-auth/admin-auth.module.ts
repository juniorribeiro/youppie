import { Module } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminJwtStrategy } from './admin-jwt.strategy';

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.ADMIN_JWT_SECRET || 'ADMIN_SECRET_KEY_DEV_ONLY',
            signOptions: { expiresIn: '8h' },
        }),
    ],
    providers: [AdminAuthService, AdminJwtStrategy],
    controllers: [AdminAuthController],
    exports: [AdminAuthService],
})
export class AdminAuthModule {}

