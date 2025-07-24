import { Injectable, Inject } from '@nestjs/common';
import { User } from '@domain/users/entities/user.entity';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}
  async execute(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}
