import { Email } from './email.vo';
describe('Email Value Object', () => {
  describe('Validación de emails válidos', () => {
    it('debería crear un email válido con formato correcto', () => {
      const emailValue = 'test@example.com';
      const email = new Email(emailValue);
      expect(email.value).toBe(emailValue);
    });
    it('debería aceptar emails con subdominios', () => {
      const emailValue = 'user@subdomain.example.com';
      const email = new Email(emailValue);
      expect(email.value).toBe(emailValue);
    });
    it('debería aceptar emails con puntos en el nombre', () => {
      const emailValue = 'user.name@example.com';
      const email = new Email(emailValue);
      expect(email.value).toBe(emailValue);
    });
    it('debería aceptar emails con guiones', () => {
      const emailValue = 'user-name@example.com';
      const email = new Email(emailValue);
      expect(email.value).toBe(emailValue);
    });
    it('debería aceptar emails con números', () => {
      const emailValue = 'user123@example.com';
      const email = new Email(emailValue);
      expect(email.value).toBe(emailValue);
    });
    it('debería aceptar emails con dominios de nivel superior válidos', () => {
      const validEmails = [
        'test@example.com',
        'test@example.org',
        'test@example.net',
        'test@example.co.uk',
        'test@example.io',
        'test@example.dev',
      ];
      validEmails.forEach((emailValue) => {
        const email = new Email(emailValue);
        expect(email.value).toBe(emailValue);
      });
    });
    it('debería normalizar emails a minúsculas y trim', () => {
      const emailValue = '  TEST@EXAMPLE.COM  ';
      const email = new Email(emailValue);
      expect(email.value).toBe('test@example.com');
    });
    it('debería aceptar emails con caracteres especiales válidos', () => {
      const validEmails = [
        'test+tag@example.com',
        'test<>@example.com',
        '.test@example.com',
        'test.@example.com',
        'test@.example.com',
        'test@example.com.',
      ];
      validEmails.forEach((emailValue) => {
        const email = new Email(emailValue);
        expect(email.value).toBe(emailValue.toLowerCase().trim());
      });
    });
  });
  describe('Validación de emails inválidos', () => {
    it('debería lanzar error para email sin @', () => {
      expect(() => new Email('invalidemail.com')).toThrow('Email inválido');
    });
    it('debería lanzar error para email sin dominio', () => {
      expect(() => new Email('test@')).toThrow('Email inválido');
    });
    it('debería lanzar error para email sin nombre de usuario', () => {
      expect(() => new Email('@example.com')).toThrow('Email inválido');
    });
    it('debería lanzar error para email con espacios', () => {
      expect(() => new Email('test @example.com')).toThrow('Email inválido');
    });
    it('debería lanzar error para email con dominio inválido', () => {
      expect(() => new Email('test@example')).toThrow('Email inválido');
    });
    it('debería lanzar error para email vacío', () => {
      expect(() => new Email('')).toThrow('Email inválido');
    });
    it('debería lanzar error para email con solo espacios', () => {
      expect(() => new Email('   ')).toThrow('Email inválido');
    });
    it('debería lanzar error para email con múltiples @', () => {
      expect(() => new Email('test@@example.com')).toThrow('Email inválido');
    });
  });
  describe('Comparación de emails', () => {
    it('debería ser igual a otro email con el mismo valor', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });
    it('debería ser diferente a otro email con valor distinto', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('other@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
    it('debería ser case insensitive', () => {
      const email1 = new Email('TEST@EXAMPLE.COM');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });
  });
  describe('Conversión a string', () => {
    it('debería retornar el valor del email como string', () => {
      const emailValue = 'test@example.com';
      const email = new Email(emailValue);
      expect(email.toString()).toBe(emailValue);
    });
  });
});
