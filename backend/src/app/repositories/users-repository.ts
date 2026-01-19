// src/app/repositories/users-repository.ts
import { User } from '../entities/user.entity';

export abstract class UsersRepository {
  abstract create(user: User): Promise<void>;
  abstract save(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  
  // Fix: The AuthService uses findByResetPasswordToken, not findByResetToken
  abstract findByResetPasswordToken(token: string): Promise<User | null>;
  
  // Add if needed for email verification
  abstract findByVerificationToken(token: string): Promise<User | null>;
}