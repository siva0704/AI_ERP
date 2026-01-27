import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { ReportingModule } from '../reporting/reporting.module';
import { FeesModule } from '../fees/fees.module';

@Module({
    imports: [ReportingModule, FeesModule],
    controllers: [AssistantController],
    providers: [AssistantService],
})
export class AssistantModule { }
