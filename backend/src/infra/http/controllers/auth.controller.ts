import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  Get,
  Param,
  UseGuards,
  Request
} from '@nestjs/common';
import { 
  RegisterDto, 
  LoginDto, 
  ForgotPasswordDto, 
  ResetPasswordDto, 
  VerifyEmailDto 
} from '../dtos/auth.dto';
import { AuthService } from '../../../infra/services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(
      loginDto.email, 
      loginDto.password
    );
    
    // Log successful login (without password)
    console.log(`✅ User logged in: ${loginDto.email}`);
    
    return {
      ...result,
      expiresIn: '7 days', // Inform frontend of token duration
      timestamp: new Date().toISOString(),
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }
  
  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return {
      user: req.user,
      valid: true,
      expiresIn: '7 days',
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('check-token')
  async checkToken(@Request() req) {
    return {
      valid: true,
      message: 'Token is valid',
      user: req.user,
      expiresIn: '7 days',
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout() {
    return {
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // Add a test endpoint to check if auth is working
  @Get('status')
  async getStatus() {
    return {
      status: 'Auth service is running',
      timestamp: new Date().toISOString(),
      endpoints: [
        { method: 'POST', path: '/auth/login', description: 'User login' },
        { method: 'POST', path: '/auth/register', description: 'User registration' },
        { method: 'GET', path: '/auth/check-token', description: 'Check token validity', auth: true },
        { method: 'GET', path: '/auth/profile', description: 'Get user profile', auth: true },
      ]
    };
  }
}