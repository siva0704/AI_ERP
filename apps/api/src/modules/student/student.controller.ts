
import { Controller, Get, Param, UseGuards, Delete } from '@nestjs/common';
import { StudentService } from './student.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('students')
@UseGuards(RolesGuard)
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Get(':id')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN', 'STAFF', 'STUDENT')
    async getStudentProfile(@Param('id') id: string) {
        return this.studentService.findOne(id);
    }

    @Delete(':id')
    @Roles('GROUP_ADMIN', 'BRANCH_ADMIN')
    async deleteStudent(@Param('id') id: string) {
        return this.studentService.remove(id);
    }
}
