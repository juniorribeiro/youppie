import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { RulesService } from '../rules/rules.service';

@Module({
    controllers: [SessionsController],
    providers: [SessionsService, RulesService],
})
export class SessionsModule { }
