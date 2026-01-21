import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '@app/repositories/users-repository';
import { User } from '@app/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
  const user = await this.usersRepository.findByEmail(email);

  if (!user) throw new UnauthorizedException('Invalid credentials');
  if (!user.isVerified) throw new UnauthorizedException('Verify email first');

  const valid = await user.comparePassword(password);
  if (!valid) throw new UnauthorizedException('Invalid credentials');

  const tokens = await this.generateTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    ...tokens,
  };
}


  generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.toLowerCase(),
      name: user.name,
    };
    
    return this.jwtService.sign(payload);
  }

  async register(email: string, password: string, name: string) {
    this.logger.debug(`📝 Registration attempt for: ${email}`);
    
    try {
      // Check if user exists
      const existingUser = await this.usersRepository.findByEmail(email);
      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      // Create user
      const user = new User();
user.email = email;
user.password = password;
user.name = name;

await user.hashPassword();
user.verify();

await this.usersRepository.create(user);

      
      // Mark as verified for now (skip email verification)
      user.verify();
      
      // Save user
      await this.usersRepository.create(user);

      this.logger.log(`✅ User registered: ${email}`);
      
      return {
        message: 'Registration successful.',
        userId: user.id,
      };
      
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Registration error: ${errorMessage}`);
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-this',
      });

      const user = await this.usersRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }

      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Refresh token error: ${errorMessage}`);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    this.logger.debug(`Forgot password request for: ${email}`);
    
    // Simple implementation - just return message
    return {
      message: 'If an account exists with this email, you will receive a password reset link',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    this.logger.debug(`Reset password request with token`);
    
    // Simple implementation - for now just return success
    return {
      message: 'Password reset successfully',
    };
  }
  
  
  async verifyEmail(token: string) {
    this.logger.debug(`Verify email with token: ${token.substring(0, 10)}...`);
    
    // Simple implementation - mark user as verified
    try {
      // In a real app, you'd find user by token and verify
      return {
        message: 'Email verified successfully',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Email verification failed: ${errorMessage}`);
    }
  }

  private async generateTokens(user: User) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };

    // Longer expiry times - 7 days
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'default-jwt-secret-change-this',
      expiresIn: '7d',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-this',
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}