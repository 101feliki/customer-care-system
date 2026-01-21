// src/infra/database/prisma/mappers/prisma-user-mapper.ts
import { User as PrismaUser, UserRole } from '@prisma/client';
import { User } from '../../../../app/entities/user.entity';

export class PrismaUserMapper {
  static toPrisma(user: User): any {
    // Ensure role is uppercase for Prisma enum
    const role = user.getRoleUppercase();
    
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      role: role as UserRole,
      isVerified: user.isVerified,
      verificationToken: user.verificationToken || null,
      resetPasswordToken: user.resetPasswordToken || null,
      resetPasswordExpires: user.resetPasswordExpires || null,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };
  }

  static toDomain(prismaUser: PrismaUser): User {
    // Prisma returns uppercase, but User constructor will handle it
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password,
      name: prismaUser.name,
      role: prismaUser.role,
      isVerified: prismaUser.isVerified,
      verificationToken: prismaUser.verificationToken ?? undefined,
      resetPasswordToken: prismaUser.resetPasswordToken ?? undefined,
      resetPasswordExpires: prismaUser.resetPasswordExpires ?? undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}