import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser, Roles, type AuthUser } from '../../common/decorators/index';
import { JwtAuthGuard, RolesGuard, TenantGuard } from '../../common/guards/index';
import { StudentsService } from './students.service';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller({ path: 'students', version: '1' })
export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated student profile with active enrollments & aid' })
  @ApiResponse({ status: 200, description: 'Hydrated student profile' })
  async getMyProfile(@CurrentUser() user: AuthUser) {
    return this.service.getMyProfile(user);
  }

  @Get(':id')
  @Roles('advisor', 'financial_aid_officer', 'admin', 'super_admin')
  @ApiOperation({ summary: 'Get specific student profile (Staff/Advisor view)' })
  async getStudentById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getStudentById(id, user);
  }

  @Get(':id/enrollments')
  @ApiOperation({ summary: 'Get student course enrollments and credit totals' })
  async getEnrollments(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getEnrollments(id, user);
  }

  @Get(':id/financial-aid')
  @ApiOperation({ summary: 'Get student financial aid packages and awards' })
  async getFinancialAid(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getFinancialAid(id, user);
  }

  @Get(':id/sap')
  @ApiOperation({ summary: 'Get student Satisfactory Academic Progress (SAP) standing' })
  async getSapHistory(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.getSapHistory(id, user);
  }

  @Get()
  @Roles('advisor', 'financial_aid_officer', 'admin', 'super_admin')
  @ApiOperation({ summary: 'List and search students (Advisor/Admin view)' })
  async listStudents(
    @Query('query') query?: string,
    @Query('programCode') programCode?: string,
    @Query('level') level?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.service.listStudents(user!, {
      query,
      programCode,
      level,
      page,
      limit,
    });
  }
}
