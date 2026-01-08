import * as bcrypt from 'bcrypt';

export class User {
  public id?: string;
  public email: string;
  public password: string;
  public name: string;
  public role: string;
  public isVerified: boolean;
  public verificationToken?: string;
  public resetPasswordToken?: string;
  public resetPasswordExpires?: Date;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(props: Partial<User>) {
    Object.assign(this, props);
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
}