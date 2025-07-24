import { Test, TestingModule } from '@nestjs/testing';
import { DeleteUserUseCase } from './delete-user.use-case';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { UserNotFoundException } from '@domain/users/exceptions/user-not-found.exception';
import { User } from '@domain/users/entities/user.entity';
describe('DeleteUserUseCase', () => {
  let deleteUserUseCase: DeleteUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  const mockUser = new User(
    'test-user-id',
    'test@example.com',
    'Test',
    'User',
    new Date('2023-01-01'),
    new Date('2023-01-01'),
    true,
  );
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteUserUseCase,
        {
          provide: 'IUserRepository',
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();
    deleteUserUseCase = module.get<DeleteUserUseCase>(DeleteUserUseCase);
    userRepository = module.get('IUserRepository');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('execute', () => {
    it('debería eliminar un usuario exitosamente', async () => {
      const userId = 'test-user-id';
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(undefined);
      await deleteUserUseCase.execute(userId);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.delete).toHaveBeenCalledWith(userId);
    });
    it('debería lanzar UserNotFoundException cuando el usuario no existe', async () => {
      const userId = 'non-existent-user-id';
      userRepository.findById.mockResolvedValue(null);
      await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(
        UserNotFoundException,
      );
      await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(userId);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.delete).not.toHaveBeenCalled();
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
        userRepository.delete.mockResolvedValue(undefined);
        await deleteUserUseCase.execute(userId);
        expect(userRepository.findById).toHaveBeenCalledWith(userId);
        expect(userRepository.delete).toHaveBeenCalledWith(userId);
      }
    });
    it('debería manejar usuarios activos e inactivos', async () => {
      const activeUser = new User(
        'active-user-id',
        'active@example.com',
        'Active',
        'User',
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        true,
      );
      const inactiveUser = new User(
        'inactive-user-id',
        'inactive@example.com',
        'Inactive',
        'User',
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
        userRepository.delete.mockResolvedValue(undefined);
        await deleteUserUseCase.execute(testCase.userId);
        expect(userRepository.findById).toHaveBeenCalledWith(testCase.userId);
        expect(userRepository.delete).toHaveBeenCalledWith(testCase.userId);
      }
    });
    it('debería manejar errores del repositorio al buscar el usuario', async () => {
      const userId = 'test-user-id';
      const repositoryError = new Error('Error en repositorio al buscar');
      userRepository.findById.mockRejectedValue(repositoryError);
      await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(
        'Error en repositorio al buscar',
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.delete).not.toHaveBeenCalled();
    });
    it('debería manejar errores del repositorio al eliminar el usuario', async () => {
      const userId = 'test-user-id';
      const deleteError = new Error('Error en repositorio al eliminar');
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockRejectedValue(deleteError);
      await expect(deleteUserUseCase.execute(userId)).rejects.toThrow(
        'Error en repositorio al eliminar',
      );
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.delete).toHaveBeenCalledWith(userId);
    });
    it('debería validar que el UserNotFoundException contiene el ID correcto', async () => {
      const userId = 'specific-user-id';
      userRepository.findById.mockResolvedValue(null);
      try {
        await deleteUserUseCase.execute(userId);
        fail('Debería haber lanzado UserNotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFoundException);
        expect(error.message).toContain(userId);
      }
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.delete).not.toHaveBeenCalled();
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
        userRepository.delete.mockResolvedValue(undefined);
        await deleteUserUseCase.execute(userId);
        expect(userRepository.findById).toHaveBeenCalledWith(userId);
        expect(userRepository.delete).toHaveBeenCalledWith(userId);
      }
    });
    it('debería manejar IDs de usuario muy largos', async () => {
      const longUserId = 'a'.repeat(100);
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(undefined);
      await deleteUserUseCase.execute(longUserId);
      expect(userRepository.findById).toHaveBeenCalledWith(longUserId);
      expect(userRepository.delete).toHaveBeenCalledWith(longUserId);
    });
    it('debería manejar IDs de usuario vacíos', async () => {
      const emptyUserId = '';
      userRepository.findById.mockResolvedValue(null);
      await expect(deleteUserUseCase.execute(emptyUserId)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(userRepository.findById).toHaveBeenCalledWith(emptyUserId);
      expect(userRepository.delete).not.toHaveBeenCalled();
    });
    it('debería manejar IDs de usuario con espacios', async () => {
      const userIdWithSpaces = ' user with spaces ';
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.delete.mockResolvedValue(undefined);
      await deleteUserUseCase.execute(userIdWithSpaces);
      expect(userRepository.findById).toHaveBeenCalledWith(userIdWithSpaces);
      expect(userRepository.delete).toHaveBeenCalledWith(userIdWithSpaces);
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
          new Date('2023-01-01'),
          new Date('2023-01-01'),
          true,
        );
        userRepository.findById.mockResolvedValue(userWithEmail);
        userRepository.delete.mockResolvedValue(undefined);
        await deleteUserUseCase.execute('test-user-id');
        expect(userRepository.findById).toHaveBeenCalledWith('test-user-id');
        expect(userRepository.delete).toHaveBeenCalledWith('test-user-id');
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
          new Date('2023-01-01'),
          new Date('2023-01-01'),
          true,
        );
        userRepository.findById.mockResolvedValue(userWithName);
        userRepository.delete.mockResolvedValue(undefined);
        await deleteUserUseCase.execute('test-user-id');
        expect(userRepository.findById).toHaveBeenCalledWith('test-user-id');
        expect(userRepository.delete).toHaveBeenCalledWith('test-user-id');
      }
    });
  });
});
