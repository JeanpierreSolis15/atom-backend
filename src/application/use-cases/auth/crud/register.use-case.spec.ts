import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { RegisterUseCase } from './register.use-case';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { UserFactory } from '@domain/users/factories/user.factory';
import { RegisterDto } from '../dtos/register.dto';
import { User } from '@domain/users/entities/user.entity';
import { Email } from '@domain/users/value-objects/email.vo';
describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let userFactory: UserFactory;
  const mockUser = new User(
    'test-id',
    'test@example.com',
    'John',
    'Doe',
    'hashed-password',
    new Date(),
    new Date(),
    true,
  );
  const mockRegisterDto: RegisterDto = {
    email: 'test@example.com',
    name: 'John',
    lastName: 'Doe',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        {
          provide: 'IUserRepository',
          useValue: {
            findByEmail: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UserFactory,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();
    registerUseCase = module.get<RegisterUseCase>(RegisterUseCase);
    userRepository = module.get('IUserRepository');
    userFactory = module.get<UserFactory>(UserFactory);
  });
  describe('execute', () => {
    it('debería registrar un usuario exitosamente', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      (userFactory.create as jest.Mock).mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      const result = await registerUseCase.execute(mockRegisterDto);
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          lastName: mockUser.lastName,
        },
      });
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(userFactory.create).toHaveBeenCalledWith(
        mockRegisterDto.email,
        mockRegisterDto.name,
        mockRegisterDto.lastName,
        '', // Sin contraseña
      );
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });
    it('debería lanzar ConflictException si el usuario ya existe', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      await expect(registerUseCase.execute(mockRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(registerUseCase.execute(mockRegisterDto)).rejects.toThrow(
        'El usuario ya existe con este email',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(userFactory.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
    it('debería validar el email antes de buscar en el repositorio', async () => {
      const invalidEmailDto = {
        ...mockRegisterDto,
        email: 'invalid-email',
      };
      await expect(registerUseCase.execute(invalidEmailDto)).rejects.toThrow(
        'Email inválido',
      );
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(userFactory.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
    it('debería validar la contraseña antes de crear el usuario', async () => {
      const invalidPasswordDto = {
        ...mockRegisterDto,
        password: '123',
      };
      await expect(registerUseCase.execute(invalidPasswordDto)).rejects.toThrow(
        'La contraseña debe tener al menos 6 caracteres',
      );
      expect(userRepository.findByEmail).not.toHaveBeenCalled();
      expect(userFactory.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
    it('debería manejar errores del repositorio al buscar usuario', async () => {
      userRepository.findByEmail.mockRejectedValue(new Error('Database error'));
      await expect(registerUseCase.execute(mockRegisterDto)).rejects.toThrow(
        'Database error',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(userFactory.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
    it('debería manejar errores del factory al crear usuario', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      (userFactory.create as jest.Mock).mockRejectedValue(
        new Error('Factory error'),
      );
      await expect(registerUseCase.execute(mockRegisterDto)).rejects.toThrow(
        'Factory error',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(userFactory.create).toHaveBeenCalledWith(
        mockRegisterDto.email,
        mockRegisterDto.name,
        mockRegisterDto.lastName,
        mockRegisterDto.password,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });
    it('debería manejar errores del repositorio al guardar usuario', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      (userFactory.create as jest.Mock).mockResolvedValue(mockUser);
      userRepository.save.mockRejectedValue(new Error('Save error'));
      await expect(registerUseCase.execute(mockRegisterDto)).rejects.toThrow(
        'Save error',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(userFactory.create).toHaveBeenCalledWith(
        mockRegisterDto.email,
        mockRegisterDto.name,
        mockRegisterDto.lastName,
        mockRegisterDto.password,
      );
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });
    it('debería manejar diferentes formatos de email válidos', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.com',
        '123@example.com',
      ];
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(mockUser);
      for (const email of validEmails) {
        const dto = { ...mockRegisterDto, email };
        const customUser = new User(
          mockUser.id,
          email,
          mockUser.name,
          mockUser.lastName,
          mockUser.passwordHash,
          mockUser.createdAt,
          mockUser.updatedAt,
          mockUser.isActive,
        );
        (userFactory.create as jest.Mock).mockResolvedValue(customUser);
        userRepository.save.mockResolvedValue(customUser);
        const result = await registerUseCase.execute(dto);
        expect(result.user.email).toBe(email);
      }
    });
    it('debería manejar nombres con caracteres especiales', async () => {
      const dto = {
        ...mockRegisterDto,
        name: 'José María',
        lastName: 'García-López',
      };
      const customUser = new User(
        mockUser.id,
        mockUser.email,
        dto.name,
        dto.lastName,
        mockUser.passwordHash,
        mockUser.createdAt,
        mockUser.updatedAt,
        mockUser.isActive,
      );
      userRepository.findByEmail.mockResolvedValue(null);
      (userFactory.create as jest.Mock).mockResolvedValue(customUser);
      userRepository.save.mockResolvedValue(customUser);
      const result = await registerUseCase.execute(dto);
      expect(result.user.name).toBe('José María');
      expect(result.user.lastName).toBe('García-López');
    });
    it('debería retornar solo los campos necesarios en la respuesta', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      (userFactory.create as jest.Mock).mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      const result = await registerUseCase.execute(mockRegisterDto);
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user).toHaveProperty('name');
      expect(result.user).toHaveProperty('lastName');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user).not.toHaveProperty('createdAt');
      expect(result.user).not.toHaveProperty('updatedAt');
      expect(result.user).not.toHaveProperty('isActive');
    });
  });
  describe('Casos edge', () => {
    it('debería manejar nombres vacíos', async () => {
      const dto = {
        ...mockRegisterDto,
        name: '',
        lastName: '',
      };
      const emptyNameUser = new User(
        mockUser.id,
        mockUser.email,
        '',
        '',
        mockUser.passwordHash,
        mockUser.createdAt,
        mockUser.updatedAt,
        mockUser.isActive,
      );
      userRepository.findByEmail.mockResolvedValue(null);
      (userFactory.create as jest.Mock).mockResolvedValue(emptyNameUser);
      userRepository.save.mockResolvedValue(emptyNameUser);
      const result = await registerUseCase.execute(dto);
      expect(result.user.name).toBe('');
      expect(result.user.lastName).toBe('');
    });
    it('debería manejar contraseñas con caracteres especiales', async () => {
      const dto = {
        ...mockRegisterDto,
        password: 'P@ssw0rd!123',
      };
      userRepository.findByEmail.mockResolvedValue(null);
      (userFactory.create as jest.Mock).mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue(mockUser);
      const result = await registerUseCase.execute(dto);
      expect(result).toBeDefined();
      expect(userFactory.create).toHaveBeenCalledWith(
        dto.email,
        dto.name,
        dto.lastName,
        'P@ssw0rd!123',
      );
    });
  });
});
