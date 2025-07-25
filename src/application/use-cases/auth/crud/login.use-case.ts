import { Injectable, Inject, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { Email } from '@domain/users/value-objects/email.vo';
import { LoginDto } from '@application/use-cases/auth/dtos/login.dto';
import { UserNotFoundException } from '@domain/users/exceptions/user-not-found.exception';
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    lastName: string;
  };
}
@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}
  async execute(dto: LoginDto): Promise<LoginResponse> {
    const email = new Email(dto.email);
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UserNotFoundException('Usuario no encontrado');
    }
    this.logger.debug('Login sin validación de contraseña');
    if (!user.isActive) {
      throw new UserNotFoundException('Usuario inactivo');
    }
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      },
    );
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
      },
    };
  }
}
