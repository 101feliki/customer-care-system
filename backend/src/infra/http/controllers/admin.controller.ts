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
  CreateUserDto, 
  UpdateUserRoleDto, 
  UserQueryDto 
} from '../dtos/admin.dto';


@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Create regular user (available to all admins)
  @Post('users')
  @Roles('admin', 'superadmin')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  // Create admin (superadmin only)
  @Post('create-admin')
  @Roles('superadmin')
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Get('users')
  @Roles('admin', 'superadmin')
  async getUsers(@Query() query: UserQueryDto) {
    return this.adminService.getAllUsers(query);
  }

  @Get('users/:id')
  @Roles('admin', 'superadmin')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/role')
  @Roles('superadmin')
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateUserRoleDto
  ) {
    return this.adminService.updateUserRole(id, updateRoleDto.role);
  }

  @Delete('users/:id')
  @Roles('superadmin')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('stats')
  @Roles('admin', 'superadmin')
  async getStats() {
    return this.adminService.getAdminStats();
  }

  @Post('users/:id/send-verification')
  @Roles('admin', 'superadmin')
  async resendVerification(@Param('id') id: string) {
    return this.adminService.resendVerificationEmail(id);
  }

  @Post('users/:id/reset-password')
  @Roles('admin', 'superadmin')
  async resetPassword(@Param('id') id: string) {
    return this.adminService.adminResetPassword(id);
  }
}