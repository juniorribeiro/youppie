import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        if (!registerDto || typeof registerDto !== 'object') {
            throw new UnauthorizedException('Invalid registration data');
        }

        if (!registerDto.password || typeof registerDto.password !== 'string' || registerDto.password.trim().length === 0) {
            throw new UnauthorizedException('Password is required');
        }

        if (registerDto.password.length < 6) {
            throw new UnauthorizedException('Password must be at least 6 characters');
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...data } = registerDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await this.usersService.create({
            ...data,
            password_hash: hashedPassword,
        });
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...result } = user;
        return result;
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.password_hash))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
