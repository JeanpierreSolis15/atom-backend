import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
  exists(email: Email): Promise<boolean>;
}
