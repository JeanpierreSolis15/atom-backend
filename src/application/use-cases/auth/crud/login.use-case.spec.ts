import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from './login.use-case';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { JwtService } from '@nestjs/jwt';
import { User } from '@domain/users/entities/user.entity';
import { UserNotFoundException } from '@domain/users/exceptions/user-not-found.exception';
import { LoginDto } from '../dtos/login.dto';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = new User(
    'user-1',
    'test@example.com',
    'John',
    'Doe',
    new Date('2023-01-01'),
    new Date('2023-01-02'),
    true,
  );

  const mockLoginDto: LoginDto = {
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: 'IUserRepository',
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get('IUserRepository');
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('debería realizar login exitoso con credenciales válidas', async () => {
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);

      const result = await loginUseCase.execute(mockLoginDto);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          lastName: mockUser.lastName,
        },
      });
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.objectContaining({ value: mockLoginDto.email }),
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });

    it('debería lanzar UserNotFoundException cuando el usuario no existe', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.objectContaining({ value: mockLoginDto.email }),
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('debería manejar errores del repositorio', async () => {
      userRepository.findByEmail.mockRejectedValue(new Error('Database error'));

      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        'Database error',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.objectContaining({ value: mockLoginDto.email }),
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('debería manejar errores del JWT service', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockImplementation(() => {
        throw new Error('JWT error');
      });

      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        'JWT error',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.objectContaining({ value: mockLoginDto.email }),
      );
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('debería lanzar UserNotFoundException para usuarios inactivos', async () => {
      const inactiveUser = new User(
        mockUser.id,
        mockUser.email,
        mockUser.name,
        mockUser.lastName,
        mockUser.createdAt,
        mockUser.updatedAt,
        false,
      );
      userRepository.findByEmail.mockResolvedValue(inactiveUser);

      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.objectContaining({ value: mockLoginDto.email }),
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('debería manejar emails con diferentes formatos', async () => {
      const emails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.com',
        '123@example.com',
      ];

      for (const email of emails) {
        const dto = { ...mockLoginDto, email };
        const emailUser = new User(
          mockUser.id,
          email,
          mockUser.name,
          mockUser.lastName,
          mockUser.createdAt,
          mockUser.updatedAt,
          mockUser.isActive,
        );
        userRepository.findByEmail.mockResolvedValue(emailUser);
        const mockAccessToken = 'mock-access-token';
        const mockRefreshToken = 'mock-refresh-token';
        (jwtService.sign as jest.Mock)
          .mockReturnValueOnce(mockAccessToken)
          .mockReturnValueOnce(mockRefreshToken);

        const result = await loginUseCase.execute(dto);

        expect(result.user.email).toBe(email);
      }
    });
  });
});
