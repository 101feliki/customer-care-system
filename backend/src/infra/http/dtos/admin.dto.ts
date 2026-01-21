// src/infra/http/dtos/admin.dto.ts
import { 
  IsEmail, 
  IsString, 
  IsEnum, 
  IsOptional, 
  MinLength, 
  IsBooleanString,
  IsBoolean 
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class CreateAdminDto extends CreateUserDto {
  @IsOptional()
  @IsEnum(['admin', 'superadmin'])
  role?: 'admin' | 'superadmin';
}

export class UpdateUserRoleDto {
  @IsEnum(['user', 'admin', 'superadmin'])
  role: 'user' | 'admin' | 'superadmin';
}
  

export class VerifyUserDto {
  @IsBoolean()
  isVerified: boolean;
}
export class UserQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['user', 'admin', 'superadmin'])
  role?: 'user' | 'admin' | 'superadmin';

  @IsOptional()
  @IsBooleanString()
  isVerified?: string;
}