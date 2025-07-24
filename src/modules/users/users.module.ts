import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { GetUserUseCase } from '@application/use-cases/users/crud/get-user.use-case';
import { GetAllUsersUseCase } from '@application/use-cases/users/queries/get-all-users.use-case';
import { UpdateUserUseCase } from '@application/use-cases/users/crud/update-user.use-case';
import { DeleteUserUseCase } from '@application/use-cases/users/crud/delete-user.use-case';
import { UserFactory } from '@domain/users/factories/user.factory';
import { FirebaseUserRepository } from '@infrastructure/repositories/firebase/user.repository';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [
    GetUserUseCase,
    GetAllUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UserFactory,
    {
      provide: 'IUserRepository',
      useClass: FirebaseUserRepository,
    },
  ],
  exports: ['IUserRepository', UserFactory],
})
export class UsersModule {}
