import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ default: 'user' })
  role: 'user' | 'admin' | 'superadmin';

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationToken?: string;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordExpires?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

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

  isAdmin(): boolean {
    return this.role === 'admin' || this.role === 'superadmin';
  }

  isSuperAdmin(): boolean {
    return this.role === 'superadmin';
  }

  promoteToAdmin(): void {
    this.role = 'admin';
  }

  promoteToSuperAdmin(): void {
    this.role = 'superadmin';
  }

  demoteToUser(): void {
    this.role = 'user';
  }
}