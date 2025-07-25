import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  lastName: string;
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }
  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido');
    }
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      lastName: payload.lastName,
    };
  }
}
