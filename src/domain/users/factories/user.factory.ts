import { Injectable, Logger } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { Email } from '../value-objects/email.vo';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class UserFactory {
  private readonly logger = new Logger(UserFactory.name);
  async create(email: string, name: string, lastName: string): Promise<User> {
    this.logger.debug('Creando nuevo usuario con UserFactory', {
      email,
      name,
      lastName,
    });
    try {
      const emailVO = new Email(email);
      this.logger.debug('Email validado correctamente');

      const now = new Date();
      const userId = uuidv4();
      this.logger.debug('Creando instancia de User', {
        userId,
        email: emailVO.value,
        name,
        lastName,
      });
      const user = new User(
        userId,
        emailVO.value,
        name,
        lastName,
        now,
        now,
        true,
      );
      this.logger.log('Usuario creado exitosamente con UserFactory', {
        userId: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
      });
      return user;
    } catch (error) {
      this.logger.error('Error al crear usuario con UserFactory', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        email,
        name,
        lastName,
      });
      throw error;
    }
  }
  createFromData(data: {
    id: string;
    email: string;
    name: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
  }): User {
    this.logger.debug('Creando usuario desde datos existentes', {
      userId: data.id,
      email: data.email,
      name: data.name,
      lastName: data.lastName,
    });
    try {
      const user = new User(
        data.id,
        data.email,
        data.name,
        data.lastName,
        data.createdAt,
        data.updatedAt,
        data.isActive,
      );
      this.logger.debug('Usuario creado desde datos exitosamente', {
        userId: user.id,
        email: user.email,
      });
      return user;
    } catch (error) {
      this.logger.error('Error al crear usuario desde datos', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: data.id,
        email: data.email,
      });
      throw error;
    }
  }
}
