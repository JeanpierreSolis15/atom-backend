import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from './login.use-case';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { User } from '@domain/users/entities/user.entity';
import { Email } from '@domain/users/value-objects/email.vo';
import * as bcrypt from 'bcryptjs';
jest.mock('bcryptjs');
describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtService: JwtService;
  const mockUser = new User(
    'test-user-id',
    'test@example.com',
    'John',
    'Doe',
    '$2b$10$hashedPassword123',
    new Date('2023-01-01'),
    new Date('2023-01-01'),
    true,
  );
  const mockLoginDto = {
    email: 'test@example.com',
    password: 'password123',
  };
  const mockJwtPayload = {
    sub: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    lastName: mockUser.lastName,
  };
  const mockRefreshPayload = {
    sub: mockUser.id,
    type: 'refresh',
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
    jwtService = module.get<JwtService>(JwtService);
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('execute', () => {
    it('debería realizar login exitoso con credenciales válidas', async () => {
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
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
        expect.any(Email),
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.passwordHash,
      );
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenNthCalledWith(1, mockJwtPayload, {
        secret: 'test-jwt-secret',
        expiresIn: '15m',
      });
      expect(jwtService.sign).toHaveBeenNthCalledWith(2, mockRefreshPayload, {
        secret: 'test-jwt-refresh-secret',
        expiresIn: '7d',
      });
    });
    it('debería lanzar UnauthorizedException cuando el usuario no existe', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
    it('debería lanzar UnauthorizedException cuando la contraseña es incorrecta', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.passwordHash,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
    it('debería lanzar UnauthorizedException cuando el usuario está inactivo', async () => {
      const inactiveUser = new User(
        'inactive-user-id',
        'inactive@example.com',
        'Inactive',
        'User',
        '$2b$10$hashedPassword123',
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        false,
      );
      userRepository.findByEmail.mockResolvedValue(inactiveUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        'Usuario inactivo',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        inactiveUser.passwordHash,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
    it('debería manejar diferentes formatos de email', async () => {
      const testCases = [
        'user@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.com',
        '123@example.com',
      ];
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);
      for (const email of testCases) {
        const dto = { ...mockLoginDto, email };
        (jwtService.sign as jest.Mock)
          .mockReturnValueOnce(mockAccessToken)
          .mockReturnValueOnce(mockRefreshToken);
        const result = await loginUseCase.execute(dto);
        expect(result.user.email).toBe(mockUser.email);
        expect(result.accessToken).toBe(mockAccessToken);
        expect(result.refreshToken).toBe(mockRefreshToken);
      }
    });
    it('debería manejar errores del repositorio', async () => {
      userRepository.findByEmail.mockRejectedValue(new Error('Database error'));
      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        'Database error',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
    it('debería manejar errores de bcrypt', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Bcrypt error'),
      );
      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        'Bcrypt error',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.passwordHash,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
    it('debería manejar errores del JWT service', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock).mockImplementation(() => {
        throw new Error('JWT error');
      });
      await expect(loginUseCase.execute(mockLoginDto)).rejects.toThrow(
        'JWT error',
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.passwordHash,
      );
      expect(jwtService.sign).toHaveBeenCalled();
    });
    it('debería validar que el email se convierte correctamente a Email VO', async () => {
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);
      await loginUseCase.execute(mockLoginDto);
      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      const emailVO = userRepository.findByEmail.mock.calls[0][0];
      expect(emailVO.value).toBe(mockLoginDto.email);
    });
    it('debería retornar la estructura correcta de la respuesta', async () => {
      const mockAccessToken = 'mock-access-token';
      const mockRefreshToken = 'mock-refresh-token';
      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce(mockAccessToken)
        .mockReturnValueOnce(mockRefreshToken);
      const result = await loginUseCase.execute(mockLoginDto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
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
});
