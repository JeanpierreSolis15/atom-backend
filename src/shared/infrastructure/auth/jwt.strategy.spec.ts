import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy, JwtPayload } from './jwt.strategy';
describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: jest.Mocked<ConfigService>;
  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret-key'),
  };
  beforeEach(async () => {
    mockConfigService.get.mockReturnValue('test-secret-key');
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();
    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get(ConfigService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('constructor', () => {
    it('debería estar definido', () => {
      expect(strategy).toBeDefined();
    });
    it('debería configurar la estrategia con los parámetros correctos', () => {
      const jwtSecret = 'test-secret';
      configService.get.mockReturnValue(jwtSecret);
      const newStrategy = new JwtStrategy(configService);
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
    it('debería usar ExtractJwt.fromAuthHeaderAsBearerToken', () => {
      expect(strategy).toBeDefined();
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
    it('debería configurar ignoreExpiration como false', () => {
      expect(strategy).toBeDefined();
    });
  });
  describe('validate', () => {
    it('debería validar un payload válido', async () => {
      const validPayload: JwtPayload = {
        sub: 'user-id-123',
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      };
      const result = await strategy.validate(validPayload);
      expect(result).toEqual({
        id: validPayload.sub,
        email: validPayload.email,
        name: validPayload.name,
        lastName: validPayload.lastName,
      });
    });
    it('debería lanzar UnauthorizedException cuando payload.sub es undefined', async () => {
      const invalidPayload: JwtPayload = {
        sub: undefined as any,
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      };
      await expect(strategy.validate(invalidPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(invalidPayload)).rejects.toThrow(
        'Token inválido',
      );
    });
    it('debería lanzar UnauthorizedException cuando payload.sub es null', async () => {
      const invalidPayload: JwtPayload = {
        sub: null as any,
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      };
      await expect(strategy.validate(invalidPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(invalidPayload)).rejects.toThrow(
        'Token inválido',
      );
    });
    it('debería lanzar UnauthorizedException cuando payload.sub es string vacío', async () => {
      const invalidPayload: JwtPayload = {
        sub: '',
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      };
      await expect(strategy.validate(invalidPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(invalidPayload)).rejects.toThrow(
        'Token inválido',
      );
    });
    it('debería manejar payloads con diferentes tipos de datos', async () => {
      const testCases = [
        {
          payload: {
            sub: 'user-1',
            email: 'user1@example.com',
            name: 'User',
            lastName: 'One',
          },
          expected: {
            id: 'user-1',
            email: 'user1@example.com',
            name: 'User',
            lastName: 'One',
          },
        },
        {
          payload: {
            sub: 'user-2',
            email: 'user2@domain.org',
            name: 'José María',
            lastName: 'García-López',
          },
          expected: {
            id: 'user-2',
            email: 'user2@domain.org',
            name: 'José María',
            lastName: 'García-López',
          },
        },
        {
          payload: {
            sub: 'admin-user',
            email: 'admin@company.co.uk',
            name: 'Admin',
            lastName: 'User',
          },
          expected: {
            id: 'admin-user',
            email: 'admin@company.co.uk',
            name: 'Admin',
            lastName: 'User',
          },
        },
      ];
      for (const testCase of testCases) {
        const result = await strategy.validate(testCase.payload);
        expect(result).toEqual(testCase.expected);
      }
    });
    it('debería manejar payloads con caracteres especiales', async () => {
      const payload: JwtPayload = {
        sub: 'user-with-special-chars-123',
        email: 'user+tag@example.com',
        name: 'José María',
        lastName: 'García-López',
      };
      const result = await strategy.validate(payload);
      expect(result).toEqual({
        id: 'user-with-special-chars-123',
        email: 'user+tag@example.com',
        name: 'José María',
        lastName: 'García-López',
      });
    });
    it('debería manejar payloads con nombres y apellidos largos', async () => {
      const longName = 'A'.repeat(50);
      const longLastName = 'B'.repeat(50);
      const payload: JwtPayload = {
        sub: 'user-with-long-names',
        email: 'long@example.com',
        name: longName,
        lastName: longLastName,
      };
      const result = await strategy.validate(payload);
      expect(result).toEqual({
        id: 'user-with-long-names',
        email: 'long@example.com',
        name: longName,
        lastName: longLastName,
      });
    });
    it('debería manejar payloads con emails complejos', async () => {
      const testEmails = [
        'test@example.com',
        'user.name@domain.org',
        'admin@company.co.uk',
        'user+tag@example.com',
        '123@example.com',
        'user-name@domain.com',
        'user_name@domain.com',
      ];
      for (const email of testEmails) {
        const payload: JwtPayload = {
          sub: `user-${email}`,
          email,
          name: 'Test',
          lastName: 'User',
        };
        const result = await strategy.validate(payload);
        expect(result).toEqual({
          id: `user-${email}`,
          email,
          name: 'Test',
          lastName: 'User',
        });
      }
    });
    it('debería manejar payloads con IDs de usuario complejos', async () => {
      const testIds = [
        'user-with-dashes',
        'user_with_underscores',
        'user.with.dots',
        'user@with#special$chars',
        'user-with-123-numbers',
        'USER-WITH-UPPERCASE',
        'user-with-uuid-123e4567-e89b-12d3-a456-426614174000',
      ];
      for (const id of testIds) {
        const payload: JwtPayload = {
          sub: id,
          email: 'test@example.com',
          name: 'Test',
          lastName: 'User',
        };
        const result = await strategy.validate(payload);
        expect(result).toEqual({
          id,
          email: 'test@example.com',
          name: 'Test',
          lastName: 'User',
        });
      }
    });
    it('debería validar que el error UnauthorizedException tiene el mensaje correcto', async () => {
      const invalidPayload: JwtPayload = {
        sub: undefined as any,
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      };
      try {
        await strategy.validate(invalidPayload);
        fail('Debería haber lanzado UnauthorizedException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Token inválido');
      }
    });
  });
  describe('JwtPayload interface', () => {
    it('debería tener la estructura correcta', () => {
      const payload: JwtPayload = {
        sub: 'test-id',
        email: 'test@example.com',
        name: 'Test',
        lastName: 'User',
      };
      expect(payload).toHaveProperty('sub');
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('name');
      expect(payload).toHaveProperty('lastName');
      expect(typeof payload.sub).toBe('string');
      expect(typeof payload.email).toBe('string');
      expect(typeof payload.name).toBe('string');
      expect(typeof payload.lastName).toBe('string');
    });
  });
});
