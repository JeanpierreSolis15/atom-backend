import { Injectable, Logger } from '@nestjs/common';
import { User } from '@domain/users/entities/user.entity';
import { Email } from '@domain/users/value-objects/email.vo';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { FirebaseService } from '@shared/infrastructure/firebase/firebase.service';
import { UserFactory } from '@domain/users/factories/user.factory';
@Injectable()
export class FirebaseUserRepository implements IUserRepository {
  private readonly logger = new Logger(FirebaseUserRepository.name);
  private readonly collectionName = 'users';
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly userFactory: UserFactory,
  ) {}
  async findById(id: string): Promise<User | null> {
    this.logger.debug(`Buscando usuario por ID: ${id}`);
    try {
      const doc = await this.firebaseService
        .getFirestore()
        .collection(this.collectionName)
        .doc(id)
        .get();
      if (!doc.exists) {
        this.logger.debug(`Usuario no encontrado con ID: ${id}`);
        return null;
      }
      const data = doc.data();
      this.logger.debug(`Usuario encontrado con ID: ${id}`);
      return this.userFactory.createFromData({
        id: doc.id,
        email: data.email,
        name: data.name,
        lastName: data.lastName,
        passwordHash: data.passwordHash,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        isActive: data.isActive,
      });
    } catch (error) {
      this.logger.error(`Error al buscar usuario por ID: ${id}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return null;
    }
  }
  async findByEmail(email: Email): Promise<User | null> {
    this.logger.debug(`Buscando usuario por email: ${email.value}`);
    try {
      const querySnapshot = await this.firebaseService
        .getFirestore()
        .collection(this.collectionName)
        .where('email', '==', email.value)
        .limit(1)
        .get();
      if (querySnapshot.empty) {
        this.logger.debug(`Usuario no encontrado con email: ${email.value}`);
        return null;
      }
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      this.logger.debug(`Usuario encontrado con email: ${email.value}`);
      return this.userFactory.createFromData({
        id: doc.id,
        email: data.email,
        name: data.name,
        lastName: data.lastName,
        passwordHash: data.passwordHash,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        isActive: data.isActive,
      });
    } catch (error) {
      this.logger.error(`Error al buscar usuario por email: ${email.value}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return null;
    }
  }
  async save(user: User): Promise<User> {
    this.logger.debug(`Guardando usuario: ${user.id}`, {
      email: user.email,
      name: user.name,
      lastName: user.lastName,
    });
    try {
      const userData = {
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isActive: user.isActive,
      };
      this.logger.debug('Datos del usuario a guardar', {
        userId: user.id,
        userData: {
          email: userData.email,
          name: userData.name,
          lastName: userData.lastName,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          isActive: userData.isActive,
        },
      });
      await this.firebaseService
        .getFirestore()
        .collection(this.collectionName)
        .doc(user.id)
        .set(userData);
      this.logger.log(`Usuario guardado exitosamente: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error al guardar usuario: ${user.id}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: user.id,
        email: user.email,
        firebaseError: error,
        errorCode: (error as any)?.code,
        errorDetails: (error as any)?.details,
      });
      throw error;
    }
  }
  async update(user: User): Promise<User> {
    this.logger.debug(`Actualizando usuario: ${user.id}`);
    try {
      const userData = {
        name: user.name,
        lastName: user.lastName,
        updatedAt: user.updatedAt,
        isActive: user.isActive,
      };
      await this.firebaseService
        .getFirestore()
        .collection(this.collectionName)
        .doc(user.id)
        .update(userData);
      this.logger.log(`Usuario actualizado exitosamente: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Error al actualizar usuario: ${user.id}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: user.id,
      });
      throw new Error('Error al actualizar el usuario');
    }
  }
  async delete(id: string): Promise<void> {
    this.logger.debug(`Eliminando usuario: ${id}`);
    try {
      await this.firebaseService
        .getFirestore()
        .collection(this.collectionName)
        .doc(id)
        .delete();
      this.logger.log(`Usuario eliminado exitosamente: ${id}`);
    } catch (error) {
      this.logger.error(`Error al eliminar usuario: ${id}`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: id,
      });
      throw new Error('Error al eliminar el usuario');
    }
  }
  async findAll(): Promise<User[]> {
    this.logger.debug('Obteniendo todos los usuarios');
    try {
      const querySnapshot = await this.firebaseService
        .getFirestore()
        .collection(this.collectionName)
        .get();
      const users = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return this.userFactory.createFromData({
          id: doc.id,
          email: data.email,
          name: data.name,
          lastName: data.lastName,
          passwordHash: data.passwordHash,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          isActive: data.isActive,
        });
      });
      this.logger.debug(`Se encontraron ${users.length} usuarios`);
      return users;
    } catch (error) {
      this.logger.error('Error al obtener todos los usuarios', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return [];
    }
  }
  async exists(email: Email): Promise<boolean> {
    this.logger.debug(
      `Verificando si existe usuario con email: ${email.value}`,
    );
    try {
      const querySnapshot = await this.firebaseService
        .getFirestore()
        .collection(this.collectionName)
        .where('email', '==', email.value)
        .limit(1)
        .get();
      const exists = !querySnapshot.empty;
      this.logger.debug(
        `Usuario con email ${email.value} ${exists ? 'existe' : 'no existe'}`,
      );
      return exists;
    } catch (error) {
      this.logger.error(
        `Error al verificar si existe usuario con email: ${email.value}`,
        {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        },
      );
      return false;
    }
  }
}
