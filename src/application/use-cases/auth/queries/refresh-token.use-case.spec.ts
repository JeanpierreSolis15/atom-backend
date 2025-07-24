import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { User } from '@domain/users/entities/user.entity';
describe('RefreshTokenUseCase', () => {
  let refreshTokenUseCase: RefreshTokenUseCase;
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
  const mockRefreshToken = 'mock-refresh-token';
  const mockNewAccessToken = 'mock-new-access-token';
  const mockNewRefreshToken = 'mock-new-refresh-token';
  const mockValidPayload = {
    sub: mockUser.id,
    type: 'refresh',
  };
  const mockNewPayload = {
    sub: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    lastName: mockUser.lastName,
  };
  const mockNewRefreshPayload = {
    sub: mockUser.id,
    type: 'refresh',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        {
          provide: 'IUserRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            sign: jest.fn(),
          },
        },
      ],
    }).compile();
    refreshTokenUseCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);
    userRepository = module.get('IUserRepository');
    jwtService = module.get<JwtService>(JwtService);
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('execute', () => {
    it('debería refrescar tokens exitosamente con un refresh token válido', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue(mockValidPayload);
      userRepository.findById.mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce(mockNewAccessToken)
        .mockReturnValueOnce(mockNewRefreshToken);
      const result = await refreshTokenUseCase.execute(mockRefreshToken);
      expect(result).toEqual({
        accessToken: mockNewAccessToken,
        refreshToken: mockNewRefreshToken,
      });
      expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test-jwt-refresh-secret',
      });
      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
      expect(jwtService.sign).toHaveBeenNthCalledWith(1, mockNewPayload, {
        secret: 'test-jwt-secret',
        expiresIn: '15m',
      });
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        2,
        mockNewRefreshPayload,
        {
          secret: 'test-jwt-refresh-secret',
          expiresIn: '7d',
        },
      );
    });
    it('debería lanzar UnauthorizedException cuando el token no es de tipo refresh', async () => {
      const invalidPayload = {
        sub: mockUser.id,
        type: 'access',
      };
      (jwtService.verify as jest.Mock).mockReturnValue(invalidPayload);
      await expect(
        refreshTokenUseCase.execute(mockRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        refreshTokenUseCase.execute(mockRefreshToken),
      ).rejects.toThrow('Token de refresco inválido');
      expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test-jwt-refresh-secret',
      });
      expect(userRepository.findById).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
    it('debería lanzar UnauthorizedException cuando el usuario no existe', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue(mockValidPayload);
      userRepository.findById.mockResolvedValue(null);
      await expect(
        refreshTokenUseCase.execute(mockRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        refreshTokenUseCase.execute(mockRefreshToken),
      ).rejects.toThrow('Token de refresco inválido');
      expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test-jwt-refresh-secret',
      });
      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
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
      (jwtService.verify as jest.Mock).mockReturnValue({
        sub: inactiveUser.id,
        type: 'refresh',
      });
      userRepository.findById.mockResolvedValue(inactiveUser);
      await expect(
        refreshTokenUseCase.execute(mockRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        refreshTokenUseCase.execute(mockRefreshToken),
      ).rejects.toThrow('Token de refresco inválido');
      expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test-jwt-refresh-secret',
      });
      expect(userRepository.findById).toHaveBeenCalledWith(inactiveUser.id);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
    it('debería lanzar UnauthorizedException cuando el JWT verification falla', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('JWT verification failed');
      });
      await expect(
        refreshTokenUseCase.execute(mockRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        refreshTokenUseCase.execute(mockRefreshToken),
      ).rejects.toThrow('Token de refresco inválido');
      expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test-jwt-refresh-secret',
      });
      expect(userRepository.findById).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
    it('debería lanzar UnauthorizedException cuando el repositorio falla', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue(mockValidPayload);
      userRepository.findById.mockRejectedValue(new Error('Database error'));
      await expect(
        refreshTokenUseCase.execute(mockRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        refreshTokenUseCase.execute(mockRefreshToken),
      ).rejects.toThrow('Token de refresco inválido');
      expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test-jwt-refresh-secret',
      });
      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
    it('debería lanzar UnauthorizedException cuando el JWT sign falla', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue(mockValidPayload);
      userRepository.findById.mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock).mockImplementation(() => {
        throw new Error('JWT sign failed');
      });
      await expect(
        refreshTokenUseCase.execute(mockRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        refreshTokenUseCase.execute(mockRefreshToken),
      ).rejects.toThrow('Token de refresco inválido');
      expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test-jwt-refresh-secret',
      });
      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(jwtService.sign).toHaveBeenCalled();
    });
    it('debería manejar diferentes tipos de errores y convertirlos a UnauthorizedException', async () => {
      const errorCases = [
        new Error('JWT expired'),
        new Error('Invalid signature'),
        new Error('Malformed token'),
        new TypeError('Unexpected token'),
      ];
      for (const error of errorCases) {
        (jwtService.verify as jest.Mock).mockImplementation(() => {
          throw error;
        });
        await expect(
          refreshTokenUseCase.execute(mockRefreshToken),
        ).rejects.toThrow(UnauthorizedException);
        await expect(
          refreshTokenUseCase.execute(mockRefreshToken),
        ).rejects.toThrow('Token de refresco inválido');
      }
    });
    it('debería generar nuevos tokens con la información correcta del usuario', async () => {
      const customUser = new User(
        'custom-user-id',
        'custom@example.com',
        'Custom',
        'User',
        '$2b$10$hashedPassword123',
        new Date('2023-01-01'),
        new Date('2023-01-01'),
        true,
      );
      const customPayload = {
        sub: customUser.id,
        type: 'refresh',
      };
      const expectedNewPayload = {
        sub: customUser.id,
        email: customUser.email,
        name: customUser.name,
        lastName: customUser.lastName,
      };
      const expectedNewRefreshPayload = {
        sub: customUser.id,
        type: 'refresh',
      };
      (jwtService.verify as jest.Mock).mockReturnValue(customPayload);
      userRepository.findById.mockResolvedValue(customUser);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce(mockNewAccessToken)
        .mockReturnValueOnce(mockNewRefreshToken);
      await refreshTokenUseCase.execute(mockRefreshToken);
      expect(jwtService.sign).toHaveBeenNthCalledWith(1, expectedNewPayload, {
        secret: 'test-jwt-secret',
        expiresIn: '15m',
      });
      expect(jwtService.sign).toHaveBeenNthCalledWith(
        2,
        expectedNewRefreshPayload,
        {
          secret: 'test-jwt-refresh-secret',
          expiresIn: '7d',
        },
      );
    });
    it('debería retornar la estructura correcta de la respuesta', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue(mockValidPayload);
      userRepository.findById.mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce(mockNewAccessToken)
        .mockReturnValueOnce(mockNewRefreshToken);
      const result = await refreshTokenUseCase.execute(mockRefreshToken);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.accessToken).toBe(mockNewAccessToken);
      expect(result.refreshToken).toBe(mockNewRefreshToken);
      expect(result).not.toHaveProperty('user');
    });
    it('debería manejar tokens con diferentes formatos de payload', async () => {
      const testCases = [
        { sub: 'user1', type: 'refresh' },
        { sub: 'user2', type: 'refresh', iat: 1234567890 },
        { sub: 'user3', type: 'refresh', exp: 1234567890, iat: 1234560000 },
      ];
      for (const payload of testCases) {
        const testUser = new User(
          payload.sub,
          `${payload.sub}@example.com`,
          'Test',
          'User',
          '$2b$10$hashedPassword123',
          new Date('2023-01-01'),
          new Date('2023-01-01'),
          true,
        );
        (jwtService.verify as jest.Mock).mockReturnValue(payload);
        userRepository.findById.mockResolvedValue(testUser);
        (jwtService.sign as jest.Mock)
          .mockReturnValueOnce(mockNewAccessToken)
          .mockReturnValueOnce(mockNewRefreshToken);
        const result = await refreshTokenUseCase.execute(mockRefreshToken);
        expect(result.accessToken).toBe(mockNewAccessToken);
        expect(result.refreshToken).toBe(mockNewRefreshToken);
        expect(userRepository.findById).toHaveBeenCalledWith(payload.sub);
      }
    });
    it('debería validar que el payload del refresh token contiene el sub correcto', async () => {
      (jwtService.verify as jest.Mock).mockReturnValue(mockValidPayload);
      userRepository.findById.mockResolvedValue(mockUser);
      (jwtService.sign as jest.Mock)
        .mockReturnValueOnce(mockNewAccessToken)
        .mockReturnValueOnce(mockNewRefreshToken);
      await refreshTokenUseCase.execute(mockRefreshToken);
      expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken, {
        secret: 'test-jwt-refresh-secret',
      });
      expect(userRepository.findById).toHaveBeenCalledWith(
        mockValidPayload.sub,
      );
    });
  });
});
