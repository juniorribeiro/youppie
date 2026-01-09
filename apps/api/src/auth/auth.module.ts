import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        SubscriptionsModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'SECRET_KEY_DEV_ONLY'),
            signOptions: { expiresIn: '60m' },
        }),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
