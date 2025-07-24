import { Injectable, Inject } from '@nestjs/common';
import { User } from '@domain/users/entities/user.entity';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { UserNotFoundException } from '@domain/users/exceptions/user-not-found.exception';
@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}
  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }
    return user;
  }
}
