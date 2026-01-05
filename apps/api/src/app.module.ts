import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { StepsModule } from './steps/steps.module';
import { SessionsModule } from './sessions/sessions.module';
import { UploadsModule } from './uploads/uploads.module';
import { HealthModule } from './health/health.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/uploads',
        }),
        PrismaModule,
        AuthModule,
        UsersModule,
        QuizzesModule,
        StepsModule,
        SessionsModule,
        UploadsModule,
        HealthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
