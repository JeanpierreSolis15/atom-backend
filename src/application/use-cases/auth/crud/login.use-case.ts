import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { Email } from '@domain/users/value-objects/email.vo';
import { LoginDto } from '@application/use-cases/auth/dtos/login.dto';
import * as bcrypt from 'bcryptjs';
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
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}
  async execute(dto: LoginDto): Promise<LoginResponse> {
    const email = new Email(dto.email);
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
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
