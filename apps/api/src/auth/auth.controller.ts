import { Controller, Post, Body, UnauthorizedException, UseGuards, Request, BadRequestException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private subscriptionsService: SubscriptionsService,
    ) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const token = await this.authService.login(user);
        
        // Buscar subscription info
        const subscription = await this.subscriptionsService.getUserSubscription(user.id);
        
        return {
            ...token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar_url: user.avatar_url,
                subscription_plan: subscription.plan,
                subscription_status: subscription.status,
            },
        };
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        if (!registerDto || !registerDto.email || !registerDto.password || !registerDto.name) {
            throw new BadRequestException('Name, email and password are required');
        }

        try {
            const user = await this.authService.register(registerDto);
            const token = await this.authService.login(user);
            
            // Buscar subscription info (será FREE por padrão)
            const subscription = await this.subscriptionsService.getUserSubscription(user.id);
            
            return {
                ...token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar_url: user.avatar_url,
                    subscription_plan: subscription.plan,
                    subscription_status: subscription.status,
                },
            };
        } catch (error: any) {
            if (error.code === 'P2002') {
                // Prisma unique constraint violation
                throw new ConflictException('Email already in use');
            }
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException(error.message || 'Failed to create account');
        }
    }
}
