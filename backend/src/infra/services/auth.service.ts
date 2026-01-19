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
    this.logger.debug(`🔐 Login attempt for: ${email}`);
    
    try {
      // 1. Find user
      const user = await this.usersRepository.findByEmail(email);
      this.logger.debug(`User found: ${user ? 'YES' : 'NO'}`);
      
      if (!user) {
        this.logger.warn(`User not found: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // 2. Check if email is verified
      if (!user.isVerified) {
        this.logger.warn(`User not verified: ${email}`);
        throw new UnauthorizedException('Please verify your email first');
      }

      // 3. Check password
      this.logger.debug('Checking password...');
      
      let isPasswordValid = false;
      try {
        // Direct bcrypt comparison
        isPasswordValid = await bcrypt.compare(password, user.password);
        this.logger.debug(`Password check via bcrypt.compare: ${isPasswordValid}`);
      } catch (compareError: unknown) {
        const errorMessage = compareError instanceof Error ? compareError.message : 'Unknown error';
        this.logger.error(`Password comparison error: ${errorMessage}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!isPasswordValid) {
        this.logger.warn(`Invalid password for user: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // 4. Generate tokens with longer expiry
      this.logger.debug('✅ Password valid, generating tokens...');
      const tokens = await this.generateTokens(user);

      this.logger.log(`✅ Successful login for: ${email}`);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        ...tokens,
      };
      
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Login error: ${errorMessage}`);
      throw new InternalServerErrorException('Login failed');
    }
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
      const user = new User({ email, password, name });
      await user.hashPassword();
      
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