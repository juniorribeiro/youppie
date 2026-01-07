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
        // #region agent log
        const fs = require('fs');
        try {
            const logEntry = JSON.stringify({location:'admin-auth.service.ts:14',message:'validateAdmin chamado',data:{email,hasPassword:!!password,passwordLength:password?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n';
            fs.appendFileSync('/Users/juniorribeiro/Hacking/youppie/.cursor/debug.log', logEntry);
        } catch (e) {}
        // #endregion

        const admin = await this.prisma.admin.findUnique({
            where: { email },
        });

        // #region agent log
        try {
            const logEntry = JSON.stringify({location:'admin-auth.service.ts:22',message:'Admin encontrado',data:{email,found:!!admin,adminId:admin?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n';
            fs.appendFileSync('/Users/juniorribeiro/Hacking/youppie/.cursor/debug.log', logEntry);
        } catch (e) {}
        // #endregion

        if (!admin) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
        
        // #region agent log
        try {
            const logEntry = JSON.stringify({location:'admin-auth.service.ts:31',message:'Validação de senha',data:{email,isPasswordValid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n';
            fs.appendFileSync('/Users/juniorribeiro/Hacking/youppie/.cursor/debug.log', logEntry);
        } catch (e) {}
        // #endregion

        if (!isPasswordValid) {
            return null;
        }

        const { password_hash, ...result } = admin;
        return result;
    }

    async login(loginDto: AdminLoginDto) {
        // #region agent log
        const fs = require('fs');
        try {
            const logEntry = JSON.stringify({location:'admin-auth.service.ts:48',message:'login chamado',data:{email:loginDto?.email,hasPassword:!!loginDto?.password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n';
            fs.appendFileSync('/Users/juniorribeiro/Hacking/youppie/.cursor/debug.log', logEntry);
        } catch (e) {}
        // #endregion

        const admin = await this.validateAdmin(loginDto.email, loginDto.password);
        if (!admin) {
            // #region agent log
            try {
                const logEntry = JSON.stringify({location:'admin-auth.service.ts:54',message:'Admin não validado',data:{email:loginDto?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n';
                fs.appendFileSync('/Users/juniorribeiro/Hacking/youppie/.cursor/debug.log', logEntry);
            } catch (e) {}
            // #endregion
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: admin.email, sub: admin.id, role: 'admin' };
        const adminJwtSecret = process.env.ADMIN_JWT_SECRET || 'ADMIN_SECRET_KEY_DEV_ONLY';
        
        // #region agent log
        try {
            const logEntry = JSON.stringify({location:'admin-auth.service.ts:63',message:'Gerando token JWT',data:{email:admin.email,adminId:admin.id,hasJwtSecret:!!adminJwtSecret},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n';
            fs.appendFileSync('/Users/juniorribeiro/Hacking/youppie/.cursor/debug.log', logEntry);
        } catch (e) {}
        // #endregion

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

