import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserUseCase } from './update-user.use-case';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { UserNotFoundException } from '@domain/users/exceptions/user-not-found.exception';
import { User } from '@domain/users/entities/user.entity';
import { UpdateUserDto } from '../dtos/update-user.dto';
describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  const mockUser = new User(
    'test-user-id',
    'test@example.com',
    'Original',
    'User',
    new Date('2023-01-01'),
    new Date('2023-01-01'),
    true,
  );
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUserUseCase,
        {
          provide: 'IUserRepository',
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();
    updateUserUseCase = module.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = module.get('IUserRepository');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('execute', () => {
    it('debería actualizar un usuario exitosamente con todos los campos', async () => {
      const userId = 'test-user-id';
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
        lastName: 'Updated LastName',
      };
      const updatedUser = new User(
        userId,
        mockUser.email,
        updateDto.name!,
        updateDto.lastName!,
        mockUser.createdAt,
        new Date(),
        mockUser.isActive,
      );
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);
      const result = await updateUserUseCase.execute(userId, updateDto);
      expect(result).toEqual(updatedUser);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: userId,
          email: mockUser.email,
          name: updateDto.name,
          lastName: updateDto.lastName,
          createdAt: mockUser.createdAt,
          updatedAt: expect.any(Date),
          isActive: mockUser.isActive,
        }),
      );
    });
    it('debería actualizar solo el nombre del usuario', async () => {
      const userId = 'test-user-id';
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };
      const updatedUser = new User(
        userId,
        mockUser.email,
        updateDto.name!,
        undefined!,
        mockUser.createdAt,
        new Date(),
        mockUser.isActive,
      );
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);
      const result = await updateUserUseCase.execute(userId, updateDto);
      expect(result).toEqual(updatedUser);
      expect(result.name).toBe('Updated Name');
      expect(result.lastName).toBe(undefined);
      expect(result.fullName).toBe('Updated Name undefined');
    });
    it('debería actualizar solo el apellido del usuario', async () => {
      const userId = 'test-user-id';
      const updateDto: UpdateUserDto = {
        lastName: 'Updated LastName',
      };
      const updatedUser = new User(
        userId,
        mockUser.email,
        undefined!,
        updateDto.lastName!,
        mockUser.createdAt,
        new Date(),
        mockUser.isActive,
      );
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);
      const result = await updateUserUseCase.execute(userId, updateDto);
      expect(result).toEqual(updatedUser);
      expect(result.name).toBe(undefined);
      expect(result.lastName).toBe('Updated LastName');
      expect(result.fullName).toBe('undefined Updated LastName');
    });
    it('debería lanzar UserNotFoundException cuando el usuario no existe', async () => {
      const userId = 'non-existent-user-id';
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };
      userRepository.findById.mockResolvedValue(null);
      await expect(
        updateUserUseCase.execute(userId, updateDto),
      ).rejects.toThrow(UserNotFoundException);
      await expect(
        updateUserUseCase.execute(userId, updateDto),
      ).rejects.toThrow(userId);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).not.toHaveBeenCalled();
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
        const updateDto: UpdateUserDto = { name: 'Updated Name' };
        const updatedUser = new User(
          testCase.userId,
          testCase.user.email,
          updateDto.name!,
          undefined!,
          testCase.user.createdAt,
          new Date(),
          testCase.user.isActive,
        );
        userRepository.findById.mockResolvedValue(testCase.user);
        userRepository.update.mockResolvedValue(updatedUser);
        const result = await updateUserUseCase.execute(
          testCase.userId,
          updateDto,
        );
        expect(result).toEqual(updatedUser);
        expect(result.isActive).toBe(testCase.user.isActive);
        expect(userRepository.findById).toHaveBeenCalledWith(testCase.userId);
      }
    });
    it('debería manejar diferentes nombres y apellidos', async () => {
      const testNames = [
        { name: 'Juan', lastName: 'Pérez' },
        { name: 'María', lastName: 'García' },
        { name: 'Carlos', lastName: 'López' },
        { name: 'Ana', lastName: 'Martínez' },
      ];
      for (const nameData of testNames) {
        const updateDto: UpdateUserDto = {
          name: nameData.name,
          lastName: nameData.lastName,
        };
        const updatedUser = new User(
          'test-user-id',
          mockUser.email,
          nameData.name,
          nameData.lastName,
          mockUser.createdAt,
          new Date(),
          mockUser.isActive,
        );
        userRepository.findById.mockResolvedValue(mockUser);
        userRepository.update.mockResolvedValue(updatedUser);
        const result = await updateUserUseCase.execute(
          'test-user-id',
          updateDto,
        );
        expect(result).toEqual(updatedUser);
        expect(result.name).toBe(nameData.name);
        expect(result.lastName).toBe(nameData.lastName);
        expect(result.fullName).toBe(`${nameData.name} ${nameData.lastName}`);
      }
    });
    it('debería manejar errores del repositorio al buscar el usuario', async () => {
      const userId = 'test-user-id';
      const updateDto: UpdateUserDto = { name: 'Updated Name' };
      const repositoryError = new Error('Error en repositorio al buscar');
      userRepository.findById.mockRejectedValue(repositoryError);
      await expect(
        updateUserUseCase.execute(userId, updateDto),
      ).rejects.toThrow('Error en repositorio al buscar');
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).not.toHaveBeenCalled();
    });
    it('debería manejar errores del repositorio al actualizar el usuario', async () => {
      const userId = 'test-user-id';
      const updateDto: UpdateUserDto = { name: 'Updated Name' };
      const updateError = new Error('Error en repositorio al actualizar');
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockRejectedValue(updateError);
      await expect(
        updateUserUseCase.execute(userId, updateDto),
      ).rejects.toThrow('Error en repositorio al actualizar');
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).toHaveBeenCalled();
    });
    it('debería manejar DTOs vacíos actualizando con valores undefined', async () => {
      const userId = 'test-user-id';
      const updateDto: UpdateUserDto = {};
      const updatedUser = new User(
        userId,
        mockUser.email,
        undefined!,
        undefined!,
        mockUser.createdAt,
        new Date(),
        mockUser.isActive,
      );
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);
      const result = await updateUserUseCase.execute(userId, updateDto);
      expect(result).toEqual(updatedUser);
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: userId,
          email: mockUser.email,
          name: undefined,
          lastName: undefined,
          createdAt: mockUser.createdAt,
          updatedAt: expect.any(Date),
          isActive: mockUser.isActive,
        }),
      );
    });
    it('debería manejar nombres y apellidos largos', async () => {
      const userId = 'test-user-id';
      const longName = 'A'.repeat(50);
      const longLastName = 'B'.repeat(50);
      const updateDto: UpdateUserDto = {
        name: longName,
        lastName: longLastName,
      };
      const updatedUser = new User(
        userId,
        mockUser.email,
        longName,
        longLastName,
        mockUser.createdAt,
        new Date(),
        mockUser.isActive,
      );
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);
      const result = await updateUserUseCase.execute(userId, updateDto);
      expect(result).toEqual(updatedUser);
      expect(result.name).toBe(longName);
      expect(result.lastName).toBe(longLastName);
      expect(result.fullName).toBe(`${longName} ${longLastName}`);
    });
    it('debería manejar nombres y apellidos con caracteres especiales', async () => {
      const userId = 'test-user-id';
      const specialName = 'José María';
      const specialLastName = 'García-López';
      const updateDto: UpdateUserDto = {
        name: specialName,
        lastName: specialLastName,
      };
      const updatedUser = new User(
        userId,
        mockUser.email,
        specialName,
        specialLastName,
        mockUser.createdAt,
        new Date(),
        mockUser.isActive,
      );
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);
      const result = await updateUserUseCase.execute(userId, updateDto);
      expect(result).toEqual(updatedUser);
      expect(result.name).toBe(specialName);
      expect(result.lastName).toBe(specialLastName);
      expect(result.fullName).toBe(`${specialName} ${specialLastName}`);
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
        const updateDto: UpdateUserDto = { name: 'Updated Name' };
        const updatedUser = new User(
          userId,
          mockUser.email,
          'Updated Name',
          undefined!,
          mockUser.createdAt,
          new Date(),
          mockUser.isActive,
        );
        userRepository.findById.mockResolvedValue(mockUser);
        userRepository.update.mockResolvedValue(updatedUser);
        const result = await updateUserUseCase.execute(userId, updateDto);
        expect(result).toEqual(updatedUser);
        expect(userRepository.findById).toHaveBeenCalledWith(userId);
      }
    });
    it('debería validar que el UserNotFoundException contiene el ID correcto', async () => {
      const userId = 'specific-user-id';
      const updateDto: UpdateUserDto = { name: 'Updated Name' };
      userRepository.findById.mockResolvedValue(null);
      try {
        await updateUserUseCase.execute(userId, updateDto);
        fail('Debería haber lanzado UserNotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFoundException);
        expect(error.message).toContain(userId);
      }
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.update).not.toHaveBeenCalled();
    });
    it('debería actualizar múltiples campos en una sola operación', async () => {
      const userId = 'test-user-id';
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
        lastName: 'Updated LastName',
      };
      const updatedUser = new User(
        userId,
        mockUser.email,
        updateDto.name!,
        updateDto.lastName!,
        mockUser.createdAt,
        new Date(),
        mockUser.isActive,
      );
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);
      const result = await updateUserUseCase.execute(userId, updateDto);
      expect(result).toEqual(updatedUser);
      expect(result.name).toBe('Updated Name');
      expect(result.lastName).toBe('Updated LastName');
      expect(result.fullName).toBe('Updated Name Updated LastName');
    });
    it('debería mantener los valores originales cuando no se proporcionan en el DTO', async () => {
      const userId = 'test-user-id';
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };
      const updatedUser = new User(
        userId,
        mockUser.email,
        updateDto.name!,
        undefined!,
        mockUser.createdAt,
        new Date(),
        mockUser.isActive,
      );
      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue(updatedUser);
      const result = await updateUserUseCase.execute(userId, updateDto);
      expect(result.name).toBe('Updated Name');
      expect(result.lastName).toBe(undefined);
      expect(result.fullName).toBe('Updated Name undefined');
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
          'Original',
          'User',
          new Date('2023-01-01'),
          new Date('2023-01-01'),
          true,
        );
        const updateDto: UpdateUserDto = { name: 'Updated Name' };
        const updatedUser = new User(
          'test-user-id',
          email,
          'Updated Name',
          undefined!,
          new Date('2023-01-01'),
          new Date(),
          true,
        );
        userRepository.findById.mockResolvedValue(userWithEmail);
        userRepository.update.mockResolvedValue(updatedUser);
        const result = await updateUserUseCase.execute(
          'test-user-id',
          updateDto,
        );
        expect(result).toEqual(updatedUser);
        expect(result.email).toBe(email);
      }
    });
    it('debería manejar usuarios con diferentes estados de actividad', async () => {
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
        const updateDto: UpdateUserDto = { name: 'Updated Name' };
        const updatedUser = new User(
          testCase.userId,
          testCase.user.email,
          'Updated Name',
          undefined!,
          testCase.user.createdAt,
          new Date(),
          testCase.user.isActive,
        );
        userRepository.findById.mockResolvedValue(testCase.user);
        userRepository.update.mockResolvedValue(updatedUser);
        const result = await updateUserUseCase.execute(
          testCase.userId,
          updateDto,
        );
        expect(result).toEqual(updatedUser);
        expect(result.isActive).toBe(testCase.user.isActive);
        expect(result.name).toBe('Updated Name');
      }
    });
  });
});
