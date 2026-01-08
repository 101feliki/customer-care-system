import { User as PrismaUser } from '@prisma/client';
import { User } from '@app/entities/user.entity';

export class PrismaUserMapper {
  static toPrisma(user: User): PrismaUser {
    return {
      id: user.id || undefined,
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role || 'user',
      isVerified: user.isVerified || false,
      verificationToken: user.verificationToken || null,
      resetPasswordToken: user.resetPasswordToken || null,
      resetPasswordExpires: user.resetPasswordExpires || null,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    } as PrismaUser;
  }

  static toDomain(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password,
      name: prismaUser.name,
      role: prismaUser.role,
      isVerified: prismaUser.isVerified,
      verificationToken: prismaUser.verificationToken || undefined,
      resetPasswordToken: prismaUser.resetPasswordToken || undefined,
      resetPasswordExpires: prismaUser.resetPasswordExpires || undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}