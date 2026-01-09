import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'SECRET_KEY_DEV_ONLY'),
        });
    }

    async validate(payload: any) {
        // Returns the user object which is attached to request.user
        return { id: payload.sub, email: payload.email };
    }
}
