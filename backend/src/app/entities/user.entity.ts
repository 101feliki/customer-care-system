// src/app/entities/user.entity.ts
import * as bcrypt from 'bcrypt';

// Create a type that accepts both uppercase and lowercase
type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN' | 'user' | 'admin' | 'superadmin';

export class User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole = 'USER'; // Accept both cases
  isVerified: boolean = false;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(props?: Partial<User>) {
    if (props) {
      Object.assign(this, props);
      // Ensure role is uppercase for consistency
      if (this.role) {
        this.role = this.role.toUpperCase() as 'USER' | 'ADMIN' | 'SUPERADMIN';
      }
    }
  }

  async hashPassword(): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  generateVerificationToken(): string {
    const token = Math.random().toString(36).substring(2) + 
                  Date.now().toString(36) + 
                  Math.random().toString(36).substring(2);
    this.verificationToken = token;
    return token;
  }

  generateResetPasswordToken(): string {
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    this.resetPasswordToken = token;
    this.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    return token;
  }

  verify(): void {
    this.isVerified = true;
    this.verificationToken = undefined;
  }

  setPassword(newPassword: string): void {
    this.password = newPassword;
    this.resetPasswordToken = undefined;
    this.resetPasswordExpires = undefined;
  }

  // Helper methods
  isAdmin(): boolean {
    const roleUpper = this.role.toUpperCase();
    return roleUpper === 'ADMIN' || roleUpper === 'SUPERADMIN';
  }

  isSuperAdmin(): boolean {
    return this.role.toUpperCase() === 'SUPERADMIN';
  }

  promoteToAdmin(): void {
    this.role = 'ADMIN';
  }

  promoteToSuperAdmin(): void {
    this.role = 'SUPERADMIN';
  }

  demoteToUser(): void {
    this.role = 'USER';
  }

  // Get uppercase role for Prisma
  getRoleUppercase(): 'USER' | 'ADMIN' | 'SUPERADMIN' {
    return this.role.toUpperCase() as 'USER' | 'ADMIN' | 'SUPERADMIN';
  }

  // Get lowercase role for frontend
  getRoleLowerCase(): 'user' | 'admin' | 'superadmin' {
    return this.role.toLowerCase() as 'user' | 'admin' | 'superadmin';
  }
}