import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';
describe('RegisterDto', () => {
  const createRegisterDto = (data: Partial<RegisterDto> = {}) => {
    return Object.assign(new RegisterDto(), data);
  };
  describe('validación de email', () => {
    it('debería validar un email válido', async () => {
      const registerDto = createRegisterDto({
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      });
      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un email inválido', async () => {
      const registerDto = createRegisterDto({
        email: 'invalid-email',
        name: 'John',
        lastName: 'Doe',
      });
      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isEmail).toBe('El email debe ser válido');
    });
    it('debería rechazar un email vacío', async () => {
      const registerDto = createRegisterDto({
        email: '',
        name: 'John',
        lastName: 'Doe',
      });
      const errors = await validate(registerDto);
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
        const registerDto = createRegisterDto({
          email,
          name: 'John',
          lastName: 'Doe',
        });
        const errors = await validate(registerDto);
        expect(errors).toHaveLength(0);
      }
    });
  });
  describe('validación de name', () => {
    it('debería validar un nombre válido', async () => {
      const registerDto = createRegisterDto({
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      });
      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un nombre vacío', async () => {
      const registerDto = createRegisterDto({
        email: 'test@example.com',
        name: '',
        lastName: 'Doe',
      });
      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe('El nombre es requerido');
    });
    it('debería rechazar un nombre que no sea string', async () => {
      const registerDto = createRegisterDto({
        email: 'test@example.com',
        name: 123 as any,
        lastName: 'Doe',
      });
      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'El nombre debe ser una cadena de texto',
      );
    });
    it('debería validar nombres con caracteres especiales', async () => {
      const validNames = [
        'John',
        'José',
        'Mary-Jane',
        'Jean-Pierre',
        "O'Connor",
        'van der Berg',
        'García-López',
        '密碼',
      ];
      for (const name of validNames) {
        const registerDto = createRegisterDto({
          email: 'test@example.com',
          name,
          lastName: 'Doe',
        });
        const errors = await validate(registerDto);
        expect(errors).toHaveLength(0);
      }
    });
  });
  describe('validación de lastName', () => {
    it('debería validar un apellido válido', async () => {
      const registerDto = createRegisterDto({
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      });
      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un apellido vacío', async () => {
      const registerDto = createRegisterDto({
        email: 'test@example.com',
        name: 'John',
        lastName: '',
      });
      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'El apellido es requerido',
      );
    });
    it('debería rechazar un apellido que no sea string', async () => {
      const registerDto = createRegisterDto({
        email: 'test@example.com',
        name: 'John',
        lastName: 123 as any,
      });
      const errors = await validate(registerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'El apellido debe ser una cadena de texto',
      );
    });
    it('debería validar apellidos con caracteres especiales', async () => {
      const validLastNames = [
        'Doe',
        'García',
        'Smith-Jones',
        "O'Connor",
        'van der Berg',
        'García-López',
        'de la Cruz',
        '密碼',
      ];
      for (const lastName of validLastNames) {
        const registerDto = createRegisterDto({
          email: 'test@example.com',
          name: 'John',
          lastName,
        });
        const errors = await validate(registerDto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('validación completa', () => {
    it('debería validar un DTO completo válido', async () => {
      const registerDto = createRegisterDto({
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      });
      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un DTO con múltiples errores', async () => {
      const registerDto = createRegisterDto({
        email: 'invalid-email',
        name: '',
        lastName: '',
      });
      const errors = await validate(registerDto);
      expect(errors).toHaveLength(3);
      const emailError = errors.find((e) => e.property === 'email');
      const nameError = errors.find((e) => e.property === 'name');
      const lastNameError = errors.find((e) => e.property === 'lastName');
      expect(emailError?.constraints?.isEmail).toBe('El email debe ser válido');
      expect(nameError?.constraints?.isNotEmpty).toBe('El nombre es requerido');
      expect(lastNameError?.constraints?.isNotEmpty).toBe(
        'El apellido es requerido',
      );
    });
    it('debería rechazar un DTO completamente vacío', async () => {
      const registerDto = createRegisterDto({});
      const errors = await validate(registerDto);
      expect(errors).toHaveLength(3);
      const emailError = errors.find((e) => e.property === 'email');
      const nameError = errors.find((e) => e.property === 'name');
      const lastNameError = errors.find((e) => e.property === 'lastName');
      expect(emailError?.constraints?.isNotEmpty).toBe('El email es requerido');
      expect(nameError?.constraints?.isNotEmpty).toBe('El nombre es requerido');
      expect(lastNameError?.constraints?.isNotEmpty).toBe(
        'El apellido es requerido',
      );
    });
  });
  describe('propiedades readonly', () => {
    it('debería tener propiedades readonly', () => {
      const registerDto = createRegisterDto({
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      });
      expect(registerDto).toHaveProperty('email');
      expect(registerDto).toHaveProperty('name');
      expect(registerDto).toHaveProperty('lastName');
    });
    it('debería permitir leer valores de las propiedades', () => {
      const registerDto = createRegisterDto({
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      });
      expect(registerDto.email).toBe('test@example.com');
      expect(registerDto.name).toBe('John');
      expect(registerDto.lastName).toBe('Doe');
    });
  });
  describe('estructura del DTO', () => {
    it('debería estar definido', () => {
      expect(RegisterDto).toBeDefined();
    });
    it('debería poder crear una instancia', () => {
      expect(() => new RegisterDto()).not.toThrow();
    });
    it('debería tener las propiedades correctas', () => {
      const registerDto = createRegisterDto({
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      });
      expect(registerDto).toHaveProperty('email');
      expect(registerDto).toHaveProperty('name');
      expect(registerDto).toHaveProperty('lastName');
    });
  });
  describe('casos edge', () => {
    it('debería manejar nombres y apellidos muy largos', async () => {
      const longName = 'a'.repeat(100);
      const longLastName = 'b'.repeat(100);
      const registerDto = createRegisterDto({
        email: 'test@example.com',
        name: longName,
        lastName: longLastName,
      });
      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });

    it('debería manejar caracteres especiales en todos los campos', async () => {
      const registerDto = createRegisterDto({
        email: 'user+tag@domain.com',
        name: 'José-María',
        lastName: "O'Connor-van der Berg",
      });
      const errors = await validate(registerDto);
      expect(errors).toHaveLength(0);
    });
  });
});
