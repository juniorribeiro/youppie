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
import { AnalyticsModule } from './analytics/analytics.module';
import { LeadsModule } from './leads/leads.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ToursModule } from './tours/tours.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { AdminQuizzesModule } from './admin-quizzes/admin-quizzes.module';
import { TicketsModule } from './tickets/tickets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UserOverridesModule } from './user-overrides/user-overrides.module';
import { SystemAlertsModule } from './system-alerts/system-alerts.module';

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
        AnalyticsModule,
        LeadsModule,
        SubscriptionsModule,
        ToursModule,
        AdminAuthModule,
        AdminUsersModule,
        AdminQuizzesModule,
        TicketsModule,
        NotificationsModule,
        UserOverridesModule,
        SystemAlertsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
