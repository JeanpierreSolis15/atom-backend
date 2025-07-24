import { Password } from './password.vo';
describe('Password Value Object', () => {
  describe('Validación de contraseñas válidas', () => {
    it('debería crear una contraseña válida con longitud mínima', () => {
      const passwordValue = '123456';
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });
    it('debería aceptar contraseñas con caracteres especiales', () => {
      const passwordValue = 'P@ssw0rd!';
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });
    it('debería aceptar contraseñas con espacios', () => {
      const passwordValue = 'My Password 123';
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });
    it('debería aceptar contraseñas con emojis', () => {
      const passwordValue = 'MyP@ss😀123';
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });
    it('debería aceptar contraseñas largas', () => {
      const passwordValue = 'a'.repeat(100);
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });
    it('debería aceptar contraseñas con caracteres Unicode', () => {
      const passwordValue = 'Contraseña123ñáéíóú';
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });
  });
  describe('Validación de contraseñas inválidas', () => {
    it('debería lanzar error para contraseña vacía', () => {
      expect(() => new Password('')).toThrow(
        'La contraseña debe tener al menos 6 caracteres',
      );
    });
    it('debería lanzar error para contraseña con solo espacios', () => {
      expect(() => new Password('   ')).toThrow(
        'La contraseña debe tener al menos 6 caracteres',
      );
    });
    it('debería lanzar error para contraseña muy corta', () => {
      expect(() => new Password('12345')).toThrow(
        'La contraseña debe tener al menos 6 caracteres',
      );
    });
    it('debería lanzar error para contraseña undefined', () => {
      expect(() => new Password(undefined as any)).toThrow(
        'La contraseña debe tener al menos 6 caracteres',
      );
    });
    it('debería lanzar error para contraseña null', () => {
      expect(() => new Password(null as any)).toThrow(
        'La contraseña debe tener al menos 6 caracteres',
      );
    });
  });
  describe('Comparación de contraseñas', () => {
    it('debería ser igual a otra contraseña con el mismo valor', () => {
      const password1 = new Password('mypassword123');
      const password2 = new Password('mypassword123');
      expect(password1.equals(password2)).toBe(true);
    });
    it('debería ser diferente a otra contraseña con valor distinto', () => {
      const password1 = new Password('mypassword123');
      const password2 = new Password('otherpassword123');
      expect(password1.equals(password2)).toBe(false);
    });
    it('debería ser case sensitive', () => {
      const password1 = new Password('MyPassword123');
      const password2 = new Password('mypassword123');
      expect(password1.equals(password2)).toBe(false);
    });
    it('debería ser diferente a otra contraseña con espacios adicionales', () => {
      const password1 = new Password('mypassword123');
      const password2 = new Password(' mypassword123 ');
      expect(password1.equals(password2)).toBe(false);
    });
  });
  describe('Conversión a string', () => {
    it('debería retornar el valor de la contraseña como string', () => {
      const passwordValue = 'mypassword123';
      const password = new Password(passwordValue);
      expect(password.toString()).toBe(passwordValue);
    });
  });
  describe('Seguridad de contraseñas', () => {
    it('debería aceptar contraseñas con longitud exacta mínima', () => {
      const passwordValue = '123456';
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });
    it('debería aceptar contraseñas con caracteres mixtos', () => {
      const passwordValue = 'MyP@ssw0rd123';
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });
    it('debería aceptar contraseñas con números y letras', () => {
      const passwordValue = 'Password123';
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });
  });
  describe('Casos edge', () => {
    it('debería aceptar contraseña con exactamente 6 caracteres', () => {
      const passwordValue = '123456';
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });
    it('debería aceptar contraseña con caracteres de control', () => {
      const passwordValue = 'pass\x00word';
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });
    it('debería aceptar contraseña con solo números', () => {
      const passwordValue = '123456789';
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });
    it('debería aceptar contraseña con solo letras', () => {
      const passwordValue = 'abcdefgh';
      const password = new Password(passwordValue);
      expect(password.value).toBe(passwordValue);
    });
  });
  describe('Contraseñas hasheadas', () => {
    it('debería aceptar contraseñas hasheadas sin validación', () => {
      const hashedPassword =
        '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890';
      const password = new Password(hashedPassword, true);
      expect(password.value).toBe(hashedPassword);
    });
    it('debería aceptar contraseñas hasheadas cortas', () => {
      const shortHashedPassword = '$2b$10$abc';
      const password = new Password(shortHashedPassword, true);
      expect(password.value).toBe(shortHashedPassword);
    });
    it('debería aceptar contraseñas hasheadas vacías', () => {
      const emptyHashedPassword = '';
      const password = new Password(emptyHashedPassword, true);
      expect(password.value).toBe(emptyHashedPassword);
    });
  });
});
