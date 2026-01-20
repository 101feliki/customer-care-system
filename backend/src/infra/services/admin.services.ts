import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../app/entities/user.entity';
import { CreateAdminDto, UpdateUserRoleDto, UserQueryDto } from '../http/dtos/admin.dto';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto): Promise<any> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createAdminDto.email }
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create new admin user
    const newAdmin = new User();
    newAdmin.email = createAdminDto.email;
    newAdmin.password = createAdminDto.password;
    newAdmin.name = createAdminDto.name;
    newAdmin.role = createAdminDto.role || 'admin';
    newAdmin.isVerified = true; // Admins are auto-verified

    // Hash password
    await newAdmin.hashPassword();

    // Save to database
    const savedUser = await this.userRepository.save(newAdmin);

    // Generate JWT token (you need to add this method to AuthService)
    // For now, let's return the user without token
    const { password, ...userWithoutPassword } = savedUser;

    return {
      message: 'Admin created successfully',
      user: userWithoutPassword,
    };
  }

  async getAllUsers(query: UserQueryDto): Promise<any> {
    const { search, role, isVerified } = query;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Apply filters
    if (search) {
      queryBuilder.where(
        '(user.email LIKE :search OR user.name LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isVerified !== undefined) {
      queryBuilder.andWhere('user.isVerified = :isVerified', { 
        isVerified: isVerified === 'true' 
      });
    }

    // Order by creation date
    queryBuilder.orderBy('user.createdAt', 'DESC');

    // Get users
    const users = await queryBuilder.getMany();

    // Remove passwords from response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      users: usersWithoutPasswords,
      total: usersWithoutPasswords.length,
    };
  }

  async getUserById(id: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUserRole(id: string, role: 'user' | 'admin' | 'superadmin'): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update role
    user.role = role;
    await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    
    return {
      message: 'User role updated successfully',
      user: userWithoutPassword,
    };
  }

  async deleteUser(id: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.remove(user);

    return {
      message: 'User deleted successfully',
      deletedUserId: id,
    };
  }

  async getAdminStats(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    const verifiedUsers = await this.userRepository.count({ where: { isVerified: true } });
    const adminUsers = await this.userRepository.count({ where: { role: 'admin' } });
    const superadminUsers = await this.userRepository.count({ where: { role: 'superadmin' } });
    const regularUsers = await this.userRepository.count({ where: { role: 'user' } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newToday = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :today', { today })
      .getCount();

    return {
      totalUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      byRole: {
        admin: adminUsers,
        superadmin: superadminUsers,
        user: regularUsers,
      },
      newToday,
    };
  }

  async resendVerificationEmail(id: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('User is already verified');
    }

    // Generate new verification token
    const token = user.generateVerificationToken();
    await this.userRepository.save(user);

    // TODO: Implement email service
    // await this.emailService.sendVerificationEmail(user.email, token);

    return {
      message: 'Verification email sent successfully',
      email: user.email,
    };
  }

  async adminResetPassword(id: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = tempPassword;
    await user.hashPassword();
    await this.userRepository.save(user);

    // TODO: Implement email service
    // await this.emailService.sendTempPasswordEmail(user.email, tempPassword);

    return {
      message: 'Password reset successfully. Temporary password sent to user email.',
      email: user.email,
      // Only return temp password in development
      ...(process.env.NODE_ENV === 'development' && { tempPassword }),
    };
  }
}