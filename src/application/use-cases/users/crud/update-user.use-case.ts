import { Injectable, Inject } from '@nestjs/common';
import { User } from '@domain/users/entities/user.entity';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserNotFoundException } from '@domain/users/exceptions/user-not-found.exception';
@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}
  async execute(id: string, dto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new UserNotFoundException(id);
    }
    const updatedUser = existingUser.updateProfile(dto.name, dto.lastName);
    return await this.userRepository.update(updatedUser);
  }
}
