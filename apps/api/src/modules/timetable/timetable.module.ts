import { Module } from '@nestjs/common';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { ConflictValidatorService } from './conflict-validator.service';

@Module({
    controllers: [TimetableController],
    providers: [TimetableService, ConflictValidatorService],
})
export class TimetableModule { }
