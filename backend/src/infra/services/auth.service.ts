import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '@app/repositories/users-repository';
import { User } from '@app/entities/user.entity';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(email: string, password: string, name: string) {
    // Check if user exists
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Create user
    const user = new User({ email, password, name });
    await user.hashPassword();
    
    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    
    // Save user
    await this.usersRepository.create(user);

    // Send verification email
    await this.sendVerificationEmail(user.email, verificationToken);

    return {
      message: 'Registration successful. Please check your email for verification.',
      userId: user.id,
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
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

  async verifyEmail(token: string) {
    const user = await this.usersRepository.findByVerificationToken(token);
    
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.verify();
    await this.usersRepository.save(user);

    return {
      message: 'Email verified successfully',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    
    if (!user) {
      // Don't reveal that user doesn't exist
      return {
        message: 'If an account exists with this email, you will receive a password reset link',
      };
    }

    const resetToken = user.generateResetPasswordToken();
    await this.usersRepository.save(user);

    // Send reset password email
    await this.sendPasswordResetEmail(user.email, resetToken);

    return {
      message: 'Password reset instructions sent to your email',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersRepository.findByResetPasswordToken(token);
    
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.setPassword(newPassword);
    await user.hashPassword();
    await this.usersRepository.save(user);

    return {
      message: 'Password reset successfully',
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.usersRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException();
      }

      const tokens = await this.generateTokens(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: User) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `;

    await this.emailService.sendEmail(
      email,
      'Verify Your Email Address',
      html,
    );
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const html = `
      <h1>Password Reset</h1>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.emailService.sendEmail(
      email,
      'Password Reset Request',
      html,
    );
  }
}