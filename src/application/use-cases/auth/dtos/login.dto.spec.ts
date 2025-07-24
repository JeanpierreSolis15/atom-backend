import { validate } from 'class-validator';
import { LoginDto } from './login.dto';
describe('LoginDto', () => {
  const createLoginDto = (data: Partial<LoginDto> = {}) => {
    return Object.assign(new LoginDto(), data);
  };
  describe('validación de email', () => {
    it('debería validar un email válido', async () => {
      const loginDto = createLoginDto({
        email: 'test@example.com',
        password: 'password123',
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un email inválido', async () => {
      const loginDto = createLoginDto({
        email: 'invalid-email',
        password: 'password123',
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isEmail).toBe('El email debe ser válido');
    });
    it('debería rechazar un email vacío', async () => {
      const loginDto = createLoginDto({
        email: '',
        password: 'password123',
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe('El email es requerido');
    });
    it('debería rechazar un email undefined', async () => {
      const loginDto = createLoginDto({
        password: 'password123',
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe('El email es requerido');
    });
    it('debería rechazar un email null', async () => {
      const loginDto = createLoginDto({
        email: null as any,
        password: 'password123',
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe('El email es requerido');
    });
    it('debería validar diferentes formatos de email válidos', async () => {
      const validEmails = [
        'user@domain.com',
        'user.name@domain.com',
        'user+tag@domain.com',
        'user@subdomain.domain.com',
        'user@domain.co.uk',
        'user123@domain.org',
      ];
      for (const email of validEmails) {
        const loginDto = createLoginDto({
          email,
          password: 'password123',
        });
        const errors = await validate(loginDto);
        expect(errors).toHaveLength(0);
      }
    });
    it('debería rechazar diferentes formatos de email inválidos', async () => {
      const invalidEmails = [
        'user@',
        '@domain.com',
        'user@domain',
        'user domain.com',
        'user@.com',
        'user@domain.',
        'user@domain..com',
      ];
      for (const email of invalidEmails) {
        const loginDto = createLoginDto({
          email,
          password: 'password123',
        });
        const errors = await validate(loginDto);
        expect(errors.length).toBeGreaterThan(0);
      }
    });
  });
  describe('validación de password', () => {
    it('debería validar una contraseña válida', async () => {
      const loginDto = createLoginDto({
        email: 'test@example.com',
        password: 'password123',
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar una contraseña vacía', async () => {
      const loginDto = createLoginDto({
        email: 'test@example.com',
        password: '',
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'La contraseña es requerida',
      );
    });
    it('debería rechazar una contraseña undefined', async () => {
      const loginDto = createLoginDto({
        email: 'test@example.com',
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'La contraseña es requerida',
      );
    });
    it('debería rechazar una contraseña null', async () => {
      const loginDto = createLoginDto({
        email: 'test@example.com',
        password: null as any,
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'La contraseña es requerida',
      );
    });
    it('debería rechazar una contraseña que no sea string', async () => {
      const loginDto = createLoginDto({
        email: 'test@example.com',
        password: 123 as any,
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'La contraseña debe ser una cadena de texto',
      );
    });
    it('debería validar diferentes tipos de contraseñas válidas', async () => {
      const validPasswords = [
        'password123',
        'P@ssw0rd',
        '123456',
        'a',
        'very-long-password-with-special-characters!@#$%^&*()',
        'contraseña-con-acentos',
        '密碼',
      ];
      for (const password of validPasswords) {
        const loginDto = createLoginDto({
          email: 'test@example.com',
          password,
        });
        const errors = await validate(loginDto);
        expect(errors).toHaveLength(0);
      }
    });
  });
  describe('validación completa', () => {
    it('debería validar un DTO completo válido', async () => {
      const loginDto = createLoginDto({
        email: 'test@example.com',
        password: 'password123',
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un DTO con múltiples errores', async () => {
      const loginDto = createLoginDto({
        email: 'invalid-email',
        password: '',
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(2);
      const emailError = errors.find((e) => e.property === 'email');
      const passwordError = errors.find((e) => e.property === 'password');
      expect(emailError?.constraints?.isEmail).toBe('El email debe ser válido');
      expect(passwordError?.constraints?.isNotEmpty).toBe(
        'La contraseña es requerida',
      );
    });
    it('debería rechazar un DTO completamente vacío', async () => {
      const loginDto = createLoginDto({});
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(2);
      const emailError = errors.find((e) => e.property === 'email');
      const passwordError = errors.find((e) => e.property === 'password');
      expect(emailError?.constraints?.isNotEmpty).toBe('El email es requerido');
      expect(passwordError?.constraints?.isNotEmpty).toBe(
        'La contraseña es requerida',
      );
    });
  });
  describe('propiedades readonly', () => {
    it('debería tener propiedades readonly', () => {
      const loginDto = createLoginDto({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(loginDto).toHaveProperty('email');
      expect(loginDto).toHaveProperty('password');
    });
    it('debería permitir leer valores de las propiedades', () => {
      const loginDto = createLoginDto({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(loginDto.email).toBe('test@example.com');
      expect(loginDto.password).toBe('password123');
    });
  });
  describe('estructura del DTO', () => {
    it('debería estar definido', () => {
      expect(LoginDto).toBeDefined();
    });
    it('debería poder crear una instancia', () => {
      expect(() => new LoginDto()).not.toThrow();
    });
    it('debería tener las propiedades correctas', () => {
      const loginDto = createLoginDto({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(loginDto).toHaveProperty('email');
      expect(loginDto).toHaveProperty('password');
    });
  });
  describe('casos edge', () => {
    it('debería manejar emails con caracteres especiales', async () => {
      const loginDto = createLoginDto({
        email: 'user+tag@domain.com',
        password: 'password123',
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });
    it('debería manejar contraseñas con caracteres especiales', async () => {
      const loginDto = createLoginDto({
        email: 'test@example.com',
        password: 'p@ssw0rd!',
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });
    it('debería manejar emails muy largos', async () => {
      const longEmail = 'a'.repeat(50) + '@' + 'domain.com';
      const loginDto = createLoginDto({
        email: longEmail,
        password: 'password123',
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });
    it('debería manejar contraseñas muy largas', async () => {
      const longPassword = 'a'.repeat(1000);
      const loginDto = createLoginDto({
        email: 'test@example.com',
        password: longPassword,
      });
      const errors = await validate(loginDto);
      expect(errors).toHaveLength(0);
    });
  });
});
