import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseUserRepository } from './user.repository';
import { FirebaseService } from '@shared/infrastructure/firebase/firebase.service';
import { UserFactory } from '@domain/users/factories/user.factory';
import { User } from '@domain/users/entities/user.entity';
import { Email } from '@domain/users/value-objects/email.vo';
describe('FirebaseUserRepository', () => {
  let repository: FirebaseUserRepository;
  let firebaseService: jest.Mocked<FirebaseService>;
  let userFactory: jest.Mocked<UserFactory>;
  const mockFirestore = {
    collection: jest.fn(),
  };
  const mockCollection = {
    doc: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    get: jest.fn(),
  };
  const mockDoc = {
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockQuerySnapshot = {
    docs: [],
    empty: true,
  };
  const mockDocumentSnapshot = {
    exists: false,
    id: 'test-id',
    data: jest.fn(),
  };
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'John',
    lastName: 'Doe',
    passwordHash: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
  } as User;
  const mockEmail = new Email('test@example.com');
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseUserRepository,
        {
          provide: FirebaseService,
          useValue: {
            getFirestore: jest.fn().mockReturnValue(mockFirestore),
          },
        },
        {
          provide: UserFactory,
          useValue: {
            createFromData: jest.fn(),
          },
        },
      ],
    }).compile();
    repository = module.get<FirebaseUserRepository>(FirebaseUserRepository);
    firebaseService = module.get(FirebaseService);
    userFactory = module.get(UserFactory);
    mockFirestore.collection.mockReturnValue(mockCollection);
    mockCollection.doc.mockReturnValue(mockDoc);
    mockCollection.where.mockReturnValue(mockCollection);
    mockCollection.limit.mockReturnValue(mockCollection);
    mockCollection.get.mockResolvedValue(mockQuerySnapshot);
    mockDoc.get.mockResolvedValue(mockDocumentSnapshot);
    mockDoc.set.mockResolvedValue(undefined);
    mockDoc.update.mockResolvedValue(undefined);
    mockDoc.delete.mockResolvedValue(undefined);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('findById', () => {
    it('debería retornar un usuario cuando existe', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed-password',
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
        isActive: true,
      };
      mockDocumentSnapshot.exists = true;
      mockDocumentSnapshot.data.mockReturnValue(userData);
      userFactory.createFromData.mockReturnValue(mockUser);
      const result = await repository.findById('user-1');
      expect(firebaseService.getFirestore).toHaveBeenCalled();
      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.doc).toHaveBeenCalledWith('user-1');
      expect(mockDoc.get).toHaveBeenCalled();
      expect(userFactory.createFromData).toHaveBeenCalledWith({
        id: 'test-id',
        email: userData.email,
        name: userData.name,
        lastName: userData.lastName,
        passwordHash: userData.passwordHash,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        isActive: userData.isActive,
      });
      expect(result).toBe(mockUser);
    });
    it('debería retornar null cuando el usuario no existe', async () => {
      mockDocumentSnapshot.exists = false;
      const result = await repository.findById('user-1');
      expect(result).toBeNull();
      expect(userFactory.createFromData).not.toHaveBeenCalled();
    });
    it('debería retornar null cuando hay un error', async () => {
      mockDoc.get.mockRejectedValue(new Error('Firebase error'));
      const result = await repository.findById('user-1');
      expect(result).toBeNull();
    });
  });
  describe('findByEmail', () => {
    it('debería retornar un usuario cuando existe con el email', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed-password',
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
        isActive: true,
      };
      const mockDocs = [
        {
          id: 'user-1',
          data: () => userData,
        },
      ];
      mockQuerySnapshot.docs = mockDocs;
      mockQuerySnapshot.empty = false;
      userFactory.createFromData.mockReturnValue(mockUser);
      const result = await repository.findByEmail(mockEmail);
      expect(mockCollection.where).toHaveBeenCalledWith(
        'email',
        '==',
        'test@example.com',
      );
      expect(mockCollection.limit).toHaveBeenCalledWith(1);
      expect(mockCollection.get).toHaveBeenCalled();
      expect(userFactory.createFromData).toHaveBeenCalledWith({
        id: 'user-1',
        email: userData.email,
        name: userData.name,
        lastName: userData.lastName,
        passwordHash: userData.passwordHash,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        isActive: userData.isActive,
      });
      expect(result).toBe(mockUser);
    });
    it('debería retornar null cuando no existe usuario con el email', async () => {
      mockQuerySnapshot.docs = [];
      mockQuerySnapshot.empty = true;
      const result = await repository.findByEmail(mockEmail);
      expect(result).toBeNull();
    });
    it('debería retornar null cuando hay un error', async () => {
      mockCollection.get.mockRejectedValue(new Error('Firebase error'));
      const result = await repository.findByEmail(mockEmail);
      expect(result).toBeNull();
    });
  });
  describe('save', () => {
    it('debería guardar un nuevo usuario', async () => {
      const result = await repository.save(mockUser);
      expect(mockDoc.set).toHaveBeenCalledWith({
        email: mockUser.email,
        name: mockUser.name,
        lastName: mockUser.lastName,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        isActive: mockUser.isActive,
      });
      expect(result).toBe(mockUser);
    });
    it('debería lanzar error cuando falla el guardado', async () => {
      mockDoc.set.mockRejectedValue(new Error('Firebase error'));
      await expect(repository.save(mockUser)).rejects.toThrow('Firebase error');
    });
  });
  describe('update', () => {
    it('debería actualizar un usuario existente', async () => {
      const result = await repository.update(mockUser);
      expect(mockDoc.update).toHaveBeenCalledWith({
        name: mockUser.name,
        lastName: mockUser.lastName,
        updatedAt: mockUser.updatedAt,
        isActive: mockUser.isActive,
      });
      expect(result).toBe(mockUser);
    });
    it('debería lanzar error cuando falla la actualización', async () => {
      mockDoc.update.mockRejectedValue(new Error('Firebase error'));
      await expect(repository.update(mockUser)).rejects.toThrow(
        'Error al actualizar el usuario',
      );
    });
  });
  describe('delete', () => {
    it('debería eliminar un usuario', async () => {
      await repository.delete('user-1');
      expect(mockCollection.doc).toHaveBeenCalledWith('user-1');
      expect(mockDoc.delete).toHaveBeenCalled();
    });
    it('debería lanzar error cuando falla la eliminación', async () => {
      mockDoc.delete.mockRejectedValue(new Error('Firebase error'));
      await expect(repository.delete('user-1')).rejects.toThrow(
        'Error al eliminar el usuario',
      );
    });
  });
  describe('findAll', () => {
    it('debería retornar todos los usuarios', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed-password',
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
        isActive: true,
      };
      const mockDocs = [
        {
          id: 'user-1',
          data: () => userData,
        },
        {
          id: 'user-2',
          data: () => userData,
        },
      ];
      mockQuerySnapshot.docs = mockDocs;
      userFactory.createFromData.mockReturnValue(mockUser);
      const result = await repository.findAll();
      expect(mockCollection.get).toHaveBeenCalled();
      expect(userFactory.createFromData).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });
    it('debería retornar array vacío cuando no hay usuarios', async () => {
      mockQuerySnapshot.docs = [];
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });
    it('debería retornar array vacío cuando hay un error', async () => {
      mockCollection.get.mockRejectedValue(new Error('Firebase error'));
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });
  });
  describe('exists', () => {
    it('debería retornar true cuando el usuario existe', async () => {
      mockQuerySnapshot.docs = [{ id: 'user-1' }];
      mockQuerySnapshot.empty = false;
      const result = await repository.exists(mockEmail);
      expect(mockCollection.where).toHaveBeenCalledWith(
        'email',
        '==',
        'test@example.com',
      );
      expect(mockCollection.limit).toHaveBeenCalledWith(1);
      expect(mockCollection.get).toHaveBeenCalled();
      expect(result).toBe(true);
    });
    it('debería retornar false cuando el usuario no existe', async () => {
      mockQuerySnapshot.docs = [];
      mockQuerySnapshot.empty = true;
      const result = await repository.exists(mockEmail);
      expect(result).toBe(false);
    });
    it('debería retornar false cuando hay un error', async () => {
      mockCollection.get.mockRejectedValue(new Error('Firebase error'));
      const result = await repository.exists(mockEmail);
      expect(result).toBe(false);
    });
  });
  describe('configuración de colección', () => {
    it('debería usar el nombre de colección correcto', async () => {
      await repository.findById('user-1');
      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
    });
    it('debería usar el nombre de colección en todas las operaciones', async () => {
      await repository.findByEmail(mockEmail);
      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
      await repository.save(mockUser);
      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
      await repository.update(mockUser);
      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
      await repository.delete('user-1');
      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
      await repository.findAll();
      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
      await repository.exists(mockEmail);
      expect(mockFirestore.collection).toHaveBeenCalledWith('users');
    });
  });
  describe('logging', () => {
    it('debería registrar logs de debug para findById', async () => {
      const spy = jest.spyOn(repository['logger'], 'debug');
      await repository.findById('user-1');
      expect(spy).toHaveBeenCalledWith('Buscando usuario por ID: user-1');
    });
    it('debería registrar logs de debug para findByEmail', async () => {
      const spy = jest.spyOn(repository['logger'], 'debug');
      await repository.findByEmail(mockEmail);
      expect(spy).toHaveBeenCalledWith(
        'Buscando usuario por email: test@example.com',
      );
    });
    it('debería registrar logs de debug para save', async () => {
      const spy = jest.spyOn(repository['logger'], 'debug');
      await repository.save(mockUser);
      expect(spy).toHaveBeenCalledWith('Guardando usuario: user-1', {
        email: mockUser.email,
        name: mockUser.name,
        lastName: mockUser.lastName,
      });
    });
    it('debería registrar logs de debug para update', async () => {
      const spy = jest.spyOn(repository['logger'], 'debug');
      await repository.update(mockUser);
      expect(spy).toHaveBeenCalledWith('Actualizando usuario: user-1');
    });
    it('debería registrar logs de debug para delete', async () => {
      const spy = jest.spyOn(repository['logger'], 'debug');
      await repository.delete('user-1');
      expect(spy).toHaveBeenCalledWith('Eliminando usuario: user-1');
    });
    it('debería registrar logs de debug para findAll', async () => {
      const spy = jest.spyOn(repository['logger'], 'debug');
      await repository.findAll();
      expect(spy).toHaveBeenCalledWith('Obteniendo todos los usuarios');
    });
    it('debería registrar logs de debug para exists', async () => {
      const spy = jest.spyOn(repository['logger'], 'debug');
      await repository.exists(mockEmail);
      expect(spy).toHaveBeenCalledWith(
        'Verificando si existe usuario con email: test@example.com',
      );
    });
  });
  describe('manejo de errores', () => {
    it('debería manejar diferentes tipos de errores de Firebase', async () => {
      const errorTypes = [
        new Error('Permission denied'),
        new Error('Network error'),
        new Error('Invalid document'),
        new Error('Service unavailable'),
      ];
      for (const error of errorTypes) {
        mockDoc.get.mockRejectedValue(error);
        const result = await repository.findById('user-1');
        expect(result).toBeNull();
      }
    });
    it('debería manejar errores en operaciones de escritura', async () => {
      const errorTypes = [
        new Error('Write failed'),
        new Error('Validation error'),
        new Error('Quota exceeded'),
      ];
      for (const error of errorTypes) {
        mockDoc.set.mockRejectedValue(error);
        await expect(repository.save(mockUser)).rejects.toThrow(error.message);
      }
    });
    it('debería registrar errores con detalles completos', async () => {
      const error = new Error('Test error');
      const spy = jest.spyOn(repository['logger'], 'error');
      mockDoc.get.mockRejectedValue(error);
      await repository.findById('user-1');
      expect(spy).toHaveBeenCalledWith(
        'Error al buscar usuario por ID: user-1',
        {
          error: 'Test error',
          stack: error.stack,
        },
      );
    });
  });
  describe('diferentes tipos de Email', () => {
    it('debería manejar diferentes formatos de email', async () => {
      const emailVariants = [
        'user@example.com',
        'test.user@domain.org',
        'admin@company.co.uk',
        'user+tag@example.com',
      ];
      for (const emailStr of emailVariants) {
        const email = new Email(emailStr);
        await repository.findByEmail(email);
        expect(mockCollection.where).toHaveBeenCalledWith(
          'email',
          '==',
          emailStr,
        );
      }
    });
  });
});
