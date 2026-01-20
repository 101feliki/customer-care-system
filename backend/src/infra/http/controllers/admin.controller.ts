// controllers/admin.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  HttpCode, 
  HttpStatus,
  Request
} from '@nestjs/common';
import { AdminService } from '../../services/admin.services';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { 
  CreateAdminDto, 
  UpdateUserRoleDto, 
  UserQueryDto 
} from '../dtos/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('create-admin')
  @Roles('superadmin')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() createAdminDto: CreateAdminDto, @Request() req) {
    console.log(`🛡️ Superadmin ${req.user.email} creating new admin: ${createAdminDto.email}`);
    return this.adminService.createAdmin(createAdminDto);
  }

  @Get('users')
  @Roles('admin', 'superadmin')
  async getAllUsers(@Query() query: UserQueryDto, @Request() req) {
    console.log(`📊 Admin ${req.user.email} viewing users list`);
    return this.adminService.getAllUsers(query);
  }

  @Get('users/:id')
  @Roles('admin', 'superadmin')
  async getUserById(@Param('id') id: string, @Request() req) {
    console.log(`🔍 Admin ${req.user.email} viewing user: ${id}`);
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/role')
  @Roles('superadmin')
  async updateUserRole(
    @Param('id') id: string, 
    @Body() updateUserRoleDto: UpdateUserRoleDto,
    @Request() req
  ) {
    console.log(`⚡ Superadmin ${req.user.email} updating role for user: ${id}`);
    return this.adminService.updateUserRole(id, updateUserRoleDto.role);
  }

  @Delete('users/:id')
  @Roles('superadmin')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string, @Request() req) {
    console.log(`🗑️ Superadmin ${req.user.email} deleting user: ${id}`);
    return this.adminService.deleteUser(id);
  }

  @Get('stats')
  @Roles('admin', 'superadmin')
  async getAdminStats(@Request() req) {
    console.log(`📈 Admin ${req.user.email} viewing admin stats`);
    return this.adminService.getAdminStats();
  }

  @Post('users/:id/send-verification')
  @Roles('admin', 'superadmin')
  async resendVerification(@Param('id') id: string, @Request() req) {
    console.log(`📧 Admin ${req.user.email} resending verification to user: ${id}`);
    return this.adminService.resendVerificationEmail(id);
  }

  @Post('users/:id/reset-password')
  @Roles('admin', 'superadmin')
  async adminResetPassword(@Param('id') id: string, @Request() req) {
    console.log(`🔐 Admin ${req.user.email} resetting password for user: ${id}`);
    return this.adminService.adminResetPassword(id);
  }
}