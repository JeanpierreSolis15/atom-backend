import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { RegisterUseCase } from '@application/use-cases/auth/crud/register.use-case';
import { LoginUseCase } from '@application/use-cases/auth/crud/login.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/auth/queries/refresh-token.use-case';
import { JwtStrategy } from '@shared/infrastructure/auth/jwt.strategy';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { FirebaseUserRepository } from '@infrastructure/repositories/firebase/user.repository';
import { UserFactory } from '@domain/users/factories/user.factory';
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    JwtStrategy,
    UserFactory,
    {
      provide: 'IUserRepository',
      useClass: FirebaseUserRepository,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
