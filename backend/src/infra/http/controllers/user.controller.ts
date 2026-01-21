// src/infra/http/controllers/user.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  UseGuards,
  Get,
  Query
} from '@nestjs/common';
import { AdminService } from '../../services/admin.services';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { CreateUserDto } from '../dtos/user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @Roles('admin', 'superadmin')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Get()
  @Roles('admin', 'superadmin')
  async getUsers(@Query() query: any) {
    return this.adminService.getAllUsers(query);
  }
}