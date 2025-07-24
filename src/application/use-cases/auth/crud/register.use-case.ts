import { Injectable, Inject, ConflictException, Logger } from '@nestjs/common';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { UserFactory } from '@domain/users/factories/user.factory';
import { RegisterDto } from '@application/use-cases/auth/dtos/register.dto';
import { User } from '@domain/users/entities/user.entity';
import { Email } from '@domain/users/value-objects/email.vo';
export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    lastName: string;
  };
}
@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name);
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly userFactory: UserFactory,
  ) {}
  async execute(dto: RegisterDto): Promise<RegisterResponse> {
    this.logger.log('Iniciando proceso de registro', {
      email: dto.email,
      name: dto.name,
      lastName: dto.lastName,
      timestamp: new Date().toISOString(),
    });
    try {
      this.logger.debug('Validando email...');
      const emailVO = new Email(dto.email);
      this.logger.debug('Email validado correctamente');
      this.logger.debug('Validando contraseña...');
      if (!dto.password || dto.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      this.logger.debug('Contraseña validada correctamente');
      this.logger.debug('Verificando si el usuario ya existe...');
      const existingUser = await this.userRepository.findByEmail(emailVO);
      if (existingUser) {
        this.logger.warn('Intento de registro con email existente', {
          email: dto.email,
          existingUserId: existingUser.id,
        });
        throw new ConflictException('El usuario ya existe con este email');
      }
      this.logger.debug('Usuario no existe, procediendo con la creación');
      this.logger.debug('Creando usuario con UserFactory...');
      const user = await this.userFactory.create(
        dto.email,
        dto.name,
        dto.lastName,
        dto.password,
      );
      this.logger.debug('Usuario creado correctamente con UserFactory');
      this.logger.debug('Guardando usuario en el repositorio...');
      const savedUser = await this.userRepository.save(user);
      this.logger.debug('Usuario guardado correctamente en el repositorio');
      this.logger.log('Registro completado exitosamente', {
        userId: savedUser.id,
        email: savedUser.email,
        timestamp: new Date().toISOString(),
      });
      return {
        user: {
          id: savedUser.id,
          email: savedUser.email,
          name: savedUser.name,
          lastName: savedUser.lastName,
        },
      };
    } catch (error) {
      this.logger.error('Error en el proceso de registro', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        email: dto.email,
        name: dto.name,
        lastName: dto.lastName,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}
