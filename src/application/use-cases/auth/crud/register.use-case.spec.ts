import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUseCase } from './register.use-case';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { UserFactory } from '@domain/users/factories/user.factory';
import { User } from '@domain/users/entities/user.entity';
import { UserAlreadyExistsException } from '@domain/users/exceptions/user-already-exists.exception';
import { RegisterDto } from '../dtos/register.dto';

describe('RegisterUseCase', () => {
  let registerUseCase: RegisterUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let userFactory: jest.Mocked<UserFactory>;

  const mockUser = new User(
    'user-1',
    'test@example.com',
    'John',
    'Doe',
    new Date('2023-01-01'),
    new Date('2023-01-02'),
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
    userFactory = module.get(UserFactory);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
        expect.objectContaining({ value: mockRegisterDto.email }),
      );
      expect(userFactory.create).toHaveBeenCalledWith(
        mockRegisterDto.email,
        mockRegisterDto.name,
        mockRegisterDto.lastName,
      );
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('debería lanzar UserAlreadyExistsException si el usuario ya existe', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(registerUseCase.execute(mockRegisterDto)).rejects.toThrow(
        UserAlreadyExistsException,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.objectContaining({ value: mockRegisterDto.email }),
      );
      expect(userFactory.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('debería manejar errores del repositorio al buscar usuario', async () => {
      userRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      await expect(registerUseCase.execute(mockRegisterDto)).rejects.toThrow(
        'Database error',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.objectContaining({ value: mockRegisterDto.email }),
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
        expect.objectContaining({ value: mockRegisterDto.email }),
      );
      expect(userFactory.create).toHaveBeenCalledWith(
        mockRegisterDto.email,
        mockRegisterDto.name,
        mockRegisterDto.lastName,
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
        expect.objectContaining({ value: mockRegisterDto.email }),
      );
      expect(userFactory.create).toHaveBeenCalledWith(
        mockRegisterDto.email,
        mockRegisterDto.name,
        mockRegisterDto.lastName,
      );
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('debería manejar nombres vacíos', async () => {
      const dto = {
        ...mockRegisterDto,
        name: '',
        lastName: '',
      };
      userRepository.findByEmail.mockResolvedValue(null);
      const emptyNameUser = new User(
        mockUser.id,
        mockUser.email,
        '',
        '',
        mockUser.createdAt,
        mockUser.updatedAt,
        mockUser.isActive,
      );
      (userFactory.create as jest.Mock).mockResolvedValue(emptyNameUser);
      userRepository.save.mockResolvedValue(emptyNameUser);

      const result = await registerUseCase.execute(dto);

      expect(result.user.name).toBe('');
      expect(result.user.lastName).toBe('');
    });

    it('debería manejar nombres muy largos', async () => {
      const longName = 'A'.repeat(1000);
      const dto = {
        ...mockRegisterDto,
        name: longName,
        lastName: longName,
      };
      userRepository.findByEmail.mockResolvedValue(null);
      const longNameUser = new User(
        mockUser.id,
        mockUser.email,
        longName,
        longName,
        mockUser.createdAt,
        mockUser.updatedAt,
        mockUser.isActive,
      );
      (userFactory.create as jest.Mock).mockResolvedValue(longNameUser);
      userRepository.save.mockResolvedValue(longNameUser);

      const result = await registerUseCase.execute(dto);

      expect(result.user.name).toBe(longName);
      expect(result.user.lastName).toBe(longName);
    });

    it('debería manejar emails con diferentes formatos', async () => {
      const emails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.com',
        '123@example.com',
      ];

      for (const email of emails) {
        const dto = { ...mockRegisterDto, email };
        userRepository.findByEmail.mockResolvedValue(null);
        const emailUser = new User(
          mockUser.id,
          email,
          mockUser.name,
          mockUser.lastName,
          mockUser.createdAt,
          mockUser.updatedAt,
          mockUser.isActive,
        );
        (userFactory.create as jest.Mock).mockResolvedValue(emailUser);
        userRepository.save.mockResolvedValue(emailUser);

        const result = await registerUseCase.execute(dto);

        expect(result.user.email).toBe(email);
      }
    });
  });
});
