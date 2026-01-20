// Option 3: Use string comparison
import { User as PrismaUser } from '@prisma/client';
import { User } from '@app/entities/user.entity';

export class PrismaUserMapper {
  static toPrisma(user: User): PrismaUser {
    // Convert to uppercase enum value
    const role = user.role.toUpperCase() as 'USER' | 'ADMIN' | 'SUPERADMIN';
    
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      role: role,
      isVerified: user.isVerified,
      verificationToken: user.verificationToken || null,
      resetPasswordToken: user.resetPasswordToken || null,
      resetPasswordExpires: user.resetPasswordExpires || null,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };
  }

  static toDomain(prismaUser: PrismaUser): User {
    // Map uppercase enum to lowercase
    const roleMap = {
      'USER': 'user',
      'ADMIN': 'admin',
      'SUPERADMIN': 'superadmin'
    } as const;
    
    const role = roleMap[prismaUser.role] || 'user';

    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      password: prismaUser.password,
      name: prismaUser.name,
      role: role,
      isVerified: prismaUser.isVerified,
      verificationToken: prismaUser.verificationToken ?? undefined,
      resetPasswordToken: prismaUser.resetPasswordToken ?? undefined,
      resetPasswordExpires: prismaUser.resetPasswordExpires ?? undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}