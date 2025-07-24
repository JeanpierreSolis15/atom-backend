import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}
@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}
  async execute(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }
      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
      }
      const newPayload = {
        sub: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
      };
      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      });
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id, type: 'refresh' },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      );
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Token de refresco inválido');
    }
  }
}
