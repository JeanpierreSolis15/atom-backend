import { Test, TestingModule } from '@nestjs/testing';
import { GetUserUseCase } from './get-user.use-case';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { UserNotFoundException } from '@domain/users/exceptions/user-not-found.exception';
import { User } from '@domain/users/entities/user.entity';
describe('GetUserUseCase', () => {
  let getUserUseCase: GetUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  const mockUser = new User(
    'test-user-id',
    'test@example.com',
    'Test',
    'User',
    'hashedPassword',
    new Date('2023-01-01'),
    new Date('2023-01-01'),
    true,
  );
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserUseCase,
        {
          provide: 'IUserRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();
    getUserUseCase = module.get<GetUserUseCase>(GetUserUseCase);
    userRepository = module.get('IUserRepository');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('execute', () => {
    it('debería obtener un usuario exitosamente', async () => {
      const userId = 'test-user-id';
      userRepository.findById.mockResolvedValue(mockUser);
      const result = await getUserUseCase.execute(userId);
      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
    it('debería lanzar UserNotFoundException cuando el usuario no existe', async () => {
      const userId = 'non-existent-user-id';
      userRepository.findById.mockResolvedValue(null);
      await expect(getUserUseCase.execute(userId)).rejects.toThrow(
        UserNotFoundException,
      );
      await expect(getUserUseCase.execute(userId)).rejects.toThrow(userId);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
    it('debería manejar diferentes IDs de usuario', async () => {
      const userIds = [
        'user1',
        'user2',
        'user3',
        'long-user-id-with-special-chars',
      ];
      for (const userId of userIds) {
        userRepository.findById.mockResolvedValue(mockUser);
        const result = await getUserUseCase.execute(userId);
        expect(result).toEqual(mockUser);
        expect(userRepository.findById).toHaveBeenCalledWith(userId);
      }
    });
    it('debería manejar usuarios activos e inactivos', async () => {
      const activeUser = new User(
        'active-user-id',
        'active@example.com',
        'Active',
        'User',
        'hashedPassword',
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        true,
      );
      const inactiveUser = new User(
        'inactive-user-id',
        'inactive@example.com',
        'Inactive',
        'User',
        'hashedPassword',
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        false,
      );
      const testCases = [
        { userId: 'active-user-id', user: activeUser },
        { userId: 'inactive-user-id', user: inactiveUser },
      ];
      for (const testCase of testCases) {
        userRepository.findById.mockResolvedValue(testCase.user);
        const result = await getUserUseCase.execute(testCase.userId);
        expect(result).toEqual(testCase.user);
        expect(result.isActive).toBe(testCase.user.isActive);
        expect(userRepository.findById).toHaveBeenCalledWith(testCase.userId);
      }
    });
    it('debería manejar usuarios con diferentes emails', async () => {
      const testEmails = [
        'test1@example.com',
        'test2@domain.org',
        'user@company.co.uk',
        'admin@system.local',
      ];
      for (const email of testEmails) {
        const userWithEmail = new User(
          'test-user-id',
          email,
          'Test',
          'User',
          'hashedPassword',
          new Date('2023-01-01'),
          new Date('2023-01-01'),
          true,
        );
        userRepository.findById.mockResolvedValue(userWithEmail);
        const result = await getUserUseCase.execute('test-user-id');
        expect(result).toEqual(userWithEmail);
        expect(result.email).toBe(email);
        expect(userRepository.findById).toHaveBeenCalledWith('test-user-id');
      }
    });
    it('debería manejar usuarios con diferentes nombres y apellidos', async () => {
      const testNames = [
        { name: 'Juan', lastName: 'Pérez' },
        { name: 'María', lastName: 'García' },
        { name: 'Carlos', lastName: 'López' },
        { name: 'Ana', lastName: 'Martínez' },
      ];
      for (const nameData of testNames) {
        const userWithName = new User(
          'test-user-id',
          'test@example.com',
          nameData.name,
          nameData.lastName,
          'hashedPassword',
          new Date('2023-01-01'),
          new Date('2023-01-01'),
          true,
        );
        userRepository.findById.mockResolvedValue(userWithName);
        const result = await getUserUseCase.execute('test-user-id');
        expect(result).toEqual(userWithName);
        expect(result.name).toBe(nameData.name);
        expect(result.lastName).toBe(nameData.lastName);
        expect(result.fullName).toBe(`${nameData.name} ${nameData.lastName}`);
        expect(userRepository.findById).toHaveBeenCalledWith('test-user-id');
      }
    });
    it('debería manejar errores del repositorio', async () => {
      const userId = 'test-user-id';
      const repositoryError = new Error('Error en repositorio');
      userRepository.findById.mockRejectedValue(repositoryError);
      await expect(getUserUseCase.execute(userId)).rejects.toThrow(
        'Error en repositorio',
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
    it('debería manejar errores de base de datos', async () => {
      const userId = 'test-user-id';
      const databaseError = new Error('Database connection failed');
      userRepository.findById.mockRejectedValue(databaseError);
      await expect(getUserUseCase.execute(userId)).rejects.toThrow(
        'Database connection failed',
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
    it('debería manejar errores de timeout', async () => {
      const userId = 'test-user-id';
      const timeoutError = new Error('Request timeout');
      userRepository.findById.mockRejectedValue(timeoutError);
      await expect(getUserUseCase.execute(userId)).rejects.toThrow(
        'Request timeout',
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
    it('debería validar que el UserNotFoundException contiene el ID correcto', async () => {
      const userId = 'specific-user-id';
      userRepository.findById.mockResolvedValue(null);
      try {
        await getUserUseCase.execute(userId);
        fail('Debería haber lanzado UserNotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFoundException);
        expect(error.message).toContain(userId);
      }
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
    });
    it('debería manejar IDs de usuario con caracteres especiales', async () => {
      const specialUserIds = [
        'user-with-dashes',
        'user_with_underscores',
        'user.with.dots',
        'user@with#special$chars',
        'user-with-123-numbers',
        'USER-WITH-UPPERCASE',
      ];
      for (const userId of specialUserIds) {
        userRepository.findById.mockResolvedValue(mockUser);
        const result = await getUserUseCase.execute(userId);
        expect(result).toEqual(mockUser);
        expect(userRepository.findById).toHaveBeenCalledWith(userId);
      }
    });
    it('debería manejar IDs de usuario muy largos', async () => {
      const longUserId = 'a'.repeat(100);
      userRepository.findById.mockResolvedValue(mockUser);
      const result = await getUserUseCase.execute(longUserId);
      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(longUserId);
    });
    it('debería manejar IDs de usuario vacíos', async () => {
      const emptyUserId = '';
      userRepository.findById.mockResolvedValue(null);
      await expect(getUserUseCase.execute(emptyUserId)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(userRepository.findById).toHaveBeenCalledWith(emptyUserId);
    });
    it('debería manejar IDs de usuario con espacios', async () => {
      const userIdWithSpaces = ' user with spaces ';
      userRepository.findById.mockResolvedValue(mockUser);
      const result = await getUserUseCase.execute(userIdWithSpaces);
      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith(userIdWithSpaces);
    });
    it('debería retornar el usuario con todos los campos correctos', async () => {
      const customUser = new User(
        'custom-user-id',
        'custom@example.com',
        'Custom',
        'User',
        'customHashedPassword',
        new Date('2022-06-15'),
        new Date('2022-06-15'),
        false,
      );
      userRepository.findById.mockResolvedValue(customUser);
      const result = await getUserUseCase.execute('custom-user-id');
      expect(result).toEqual(customUser);
      expect(result.id).toBe('custom-user-id');
      expect(result.email).toBe('custom@example.com');
      expect(result.name).toBe('Custom');
      expect(result.lastName).toBe('User');
      expect(result.passwordHash).toBe('customHashedPassword');
      expect(result.isActive).toBe(false);
      expect(result.createdAt).toEqual(new Date('2022-06-15'));
      expect(result.updatedAt).toEqual(new Date('2022-06-15'));
      expect(result.fullName).toBe('Custom User');
    });
    it('debería manejar usuarios con nombres y apellidos largos', async () => {
      const longName = 'A'.repeat(50);
      const longLastName = 'B'.repeat(50);
      const userWithLongNames = new User(
        'long-names-user-id',
        'long@example.com',
        longName,
        longLastName,
        'hashedPassword',
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        true,
      );
      userRepository.findById.mockResolvedValue(userWithLongNames);
      const result = await getUserUseCase.execute('long-names-user-id');
      expect(result).toEqual(userWithLongNames);
      expect(result.name).toBe(longName);
      expect(result.lastName).toBe(longLastName);
      expect(result.fullName).toBe(`${longName} ${longLastName}`);
    });
    it('debería manejar usuarios con caracteres especiales en nombres', async () => {
      const specialName = 'José María';
      const specialLastName = 'García-López';
      const userWithSpecialNames = new User(
        'special-names-user-id',
        'special@example.com',
        specialName,
        specialLastName,
        'hashedPassword',
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        true,
      );
      userRepository.findById.mockResolvedValue(userWithSpecialNames);
      const result = await getUserUseCase.execute('special-names-user-id');
      expect(result).toEqual(userWithSpecialNames);
      expect(result.name).toBe(specialName);
      expect(result.lastName).toBe(specialLastName);
      expect(result.fullName).toBe(`${specialName} ${specialLastName}`);
    });
    it('debería manejar usuarios con emails con caracteres especiales', async () => {
      const specialEmails = [
        'user+tag@example.com',
        'user.name@domain.co.uk',
        'user-name@company.org',
        'user_name@system.local',
      ];
      for (const email of specialEmails) {
        const userWithSpecialEmail = new User(
          'special-email-user-id',
          email,
          'Test',
          'User',
          'hashedPassword',
          new Date('2023-01-01'),
          new Date('2023-01-01'),
          true,
        );
        userRepository.findById.mockResolvedValue(userWithSpecialEmail);
        const result = await getUserUseCase.execute('special-email-user-id');
        expect(result).toEqual(userWithSpecialEmail);
        expect(result.email).toBe(email);
      }
    });
  });
});
