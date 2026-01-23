import { Module } from '@nestjs/common';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { ConflictService } from './conflict.service';

@Module({
    controllers: [TimetableController],
    providers: [TimetableService, ConflictService],
    exports: [TimetableService]
})
export class TimetableModule { }
