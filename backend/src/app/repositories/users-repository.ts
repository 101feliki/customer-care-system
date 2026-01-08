import { User } from '../entities/user.entity';

export abstract class UsersRepository {
  abstract create(user: User): Promise<void>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByVerificationToken(token: string): Promise<User | null>;
  abstract findByResetPasswordToken(token: string): Promise<User | null>;
  abstract save(user: User): Promise<void>;
  abstract findAll(): Promise<User[]>;
}