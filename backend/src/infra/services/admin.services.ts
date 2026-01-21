// src/infra/services/admin.services.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { CreateAdminDto, UpdateUserRoleDto, UserQueryDto, CreateUserDto } from '../http/dtos/admin.dto';
import { User } from '../../app/entities/user.entity';
import { PrismaUserMapper } from '../database/prisma/mappers/prisma-user-mapper';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create new user entity
    const newUser = new User({
      email: createUserDto.email,
      password: createUserDto.password,
      name: createUserDto.name,
      role: 'user', // Regular users get 'user' role
      isVerified: false, // Regular users need to verify their email
    });

    // Hash password
    await newUser.hashPassword();

    // Generate verification token
    newUser.generateVerificationToken();

    // Convert to Prisma format and save
    const prismaData = PrismaUserMapper.toPrisma(newUser);
    
    console.log('Creating user with data:', { ...prismaData, password: '[HIDDEN]' });
    
    try {
      const savedUser = await this.prisma.user.create({
        data: prismaData,
      });

      console.log('User created successfully:', savedUser.id);

      // Convert back to domain entity
      const domainUser = PrismaUserMapper.toDomain(savedUser);

      // Remove password from response
      const { password, ...userWithoutPassword } = domainUser;

      return {
        message: 'User created successfully.',
        user: userWithoutPassword,
      };
    } catch (error: any) { // Type assertion for error
      console.error('Database error creating user:', error);
      throw new BadRequestException(`Failed to create user: ${error.message}`);
    }
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<any> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createAdminDto.email }
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create new user entity
    const newUser = new User({
      email: createAdminDto.email,
      password: createAdminDto.password,
      name: createAdminDto.name,
      role: createAdminDto.role || 'admin',
      isVerified: true, // Admins are auto-verified
    });

    // Hash password
    await newUser.hashPassword();

    // Convert to Prisma format and save
    const prismaData = PrismaUserMapper.toPrisma(newUser);
    
    console.log('Creating admin with data:', { ...prismaData, password: '[HIDDEN]' });
    
    try {
      const savedUser = await this.prisma.user.create({
        data: prismaData,
      });

      console.log('Admin created successfully:', savedUser.id);

      // Convert back to domain entity
      const domainUser = PrismaUserMapper.toDomain(savedUser);

      // Remove password from response
      const { password, ...userWithoutPassword } = domainUser;

      return {
        message: 'Admin created successfully',
        user: userWithoutPassword,
      };
    } catch (error: any) { // Type assertion for error
      console.error('Database error creating admin:', error);
      throw new BadRequestException(`Failed to create admin: ${error.message}`);
    }
  }

  async getAllUsers(query: UserQueryDto): Promise<any> {
    const { search, role, isVerified } = query;
    const where: any = {};

    // Apply filters
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role.toUpperCase();
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified === 'true';
    }

    // Get users with Prisma
    const users = await this.prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Convert to domain entities and remove passwords
    const usersWithoutPasswords = users.map(prismaUser => {
      const domainUser = PrismaUserMapper.toDomain(prismaUser);
      const { password, ...userWithoutPassword } = domainUser;
      return userWithoutPassword;
    });

    return {
      users: usersWithoutPasswords,
      total: usersWithoutPasswords.length,
    };
  }

  async getUserById(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const domainUser = PrismaUserMapper.toDomain(user);
    const { password, ...userWithoutPassword } = domainUser;
    
    return userWithoutPassword;
  }

  async updateUserRole(id: string, role: 'user' | 'admin' | 'superadmin'): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Convert role to uppercase for Prisma
    const prismaRole = role.toUpperCase() as 'USER' | 'ADMIN' | 'SUPERADMIN';
    
    // Update role in database
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role: prismaRole },
    });

    // Convert to domain entity
    const domainUser = PrismaUserMapper.toDomain(updatedUser);
    const { password, ...userWithoutPassword } = domainUser;
    
    return {
      message: 'User role updated successfully',
      user: userWithoutPassword,
    };
  }

  async deleteUser(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'User deleted successfully',
      deletedUserId: id,
    };
  }

  async getAdminStats(): Promise<any> {
    const totalUsers = await this.prisma.user.count();
    const verifiedUsers = await this.prisma.user.count({ 
      where: { isVerified: true } 
    });
    
    const byRole = {
      admin: await this.prisma.user.count({ where: { role: 'ADMIN' } }),
      superadmin: await this.prisma.user.count({ where: { role: 'SUPERADMIN' } }),
      user: await this.prisma.user.count({ where: { role: 'USER' } }),
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newToday = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });

    return {
      totalUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      byRole,
      newToday,
    };
  }

  async resendVerificationEmail(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('User is already verified');
    }

    // Generate new verification token
    const verificationToken = Math.random().toString(36).substring(2) + 
                              Date.now().toString(36) + 
                              Math.random().toString(36).substring(2);
    
    // Update user with new token
    await this.prisma.user.update({
      where: { id },
      data: { verificationToken },
    });

    // TODO: Implement email service
    // await this.emailService.sendVerificationEmail(user.email, verificationToken);

    return {
      message: 'Verification email sent successfully',
      email: user.email,
    };
  }

  async adminResetPassword(id: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Hash the temporary password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);
    
    // Update user with new password
    await this.prisma.user.update({
      where: { id },
      data: { 
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // TODO: Implement email service
    // await this.emailService.sendTempPasswordEmail(user.email, tempPassword);

    return {
      message: 'Password reset successfully. Temporary password sent to user email.',
      email: user.email,
      // Only return temp password in development
      ...(process.env.NODE_ENV === 'development' && { tempPassword }),
    };
  }

  // Additional helper methods for frontend
  async searchUsers(search: string): Promise<any> {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      },
      take: 10, // Limit results
      orderBy: { createdAt: 'desc' },
    });

    return users.map(prismaUser => {
      const domainUser = PrismaUserMapper.toDomain(prismaUser);
      const { password, ...userWithoutPassword } = domainUser;
      return userWithoutPassword;
    });
  }
}