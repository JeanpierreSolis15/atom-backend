import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { UserNotFoundException } from '@domain/users/exceptions/user-not-found.exception';
@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}
  async execute(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new UserNotFoundException(id);
    }
    await this.userRepository.delete(id);
  }
}
