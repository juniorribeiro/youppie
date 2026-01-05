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
            secretOrKey: 'SECRET_KEY_DEV_ONLY', // In prod use env var
        });
    }

    async validate(payload: any) {
        // Returns the user object which is attached to request.user
        return { id: payload.sub, email: payload.email };
    }
}
