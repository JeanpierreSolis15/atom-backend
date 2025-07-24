import { UserNotFoundException } from './user-not-found.exception';
describe('UserNotFoundException', () => {
  describe('Constructor', () => {
    it('debería crear una excepción con mensaje basado en userId', () => {
      const userId = 'test-id-123';
      const exception = new UserNotFoundException(userId);
      expect(exception).toBeInstanceOf(UserNotFoundException);
      expect(exception.message).toBe(`Usuario con ID ${userId} no encontrado`);
      expect(exception.name).toBe('UserNotFoundException');
    });
    it('debería crear una excepción con diferentes user IDs', () => {
      const userIds = ['user-1', 'abc-def-ghi', '123456789'];
      userIds.forEach((userId) => {
        const exception = new UserNotFoundException(userId);
        expect(exception.message).toBe(
          `Usuario con ID ${userId} no encontrado`,
        );
      });
    });
    it('debería crear una excepción con ID muy largo', () => {
      const longId = 'a'.repeat(1000);
      const exception = new UserNotFoundException(longId);
      expect(exception.message).toBe(`Usuario con ID ${longId} no encontrado`);
    });
  });
  describe('Herencia', () => {
    it('debería heredar de Error', () => {
      const exception = new UserNotFoundException('test-id');
      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(UserNotFoundException);
    });
    it('debería tener stack trace', () => {
      const exception = new UserNotFoundException('test-id');
      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe('string');
    });
  });
  describe('Casos de uso', () => {
    it('debería ser lanzada cuando se busca un usuario por ID inexistente', () => {
      const userId = 'non-existent-id';
      expect(() => {
        throw new UserNotFoundException(userId);
      }).toThrow(UserNotFoundException);
      expect(() => {
        throw new UserNotFoundException(userId);
      }).toThrow(`Usuario con ID ${userId} no encontrado`);
    });
    it('debería ser lanzada en repositorios cuando no se encuentra el usuario', () => {
      const mockRepository = {
        findById: jest.fn().mockImplementation((userId: string) => {
          throw new UserNotFoundException(userId);
        }),
      };
      expect(() => {
        mockRepository.findById('test-id');
      }).toThrow(UserNotFoundException);
    });
  });
  describe('Mensajes de error', () => {
    it('debería manejar IDs con caracteres especiales', () => {
      const userId = 'user@test.com';
      const exception = new UserNotFoundException(userId);
      expect(exception.message).toBe(`Usuario con ID ${userId} no encontrado`);
    });
    it('debería manejar IDs vacíos', () => {
      const userId = '';
      const exception = new UserNotFoundException(userId);
      expect(exception.message).toBe(`Usuario con ID ${userId} no encontrado`);
    });
    it('debería manejar IDs con espacios', () => {
      const userId = 'user id with spaces';
      const exception = new UserNotFoundException(userId);
      expect(exception.message).toBe(`Usuario con ID ${userId} no encontrado`);
    });
  });
  describe('Stack trace', () => {
    it('debería incluir información del stack trace', () => {
      function throwUserNotFound() {
        throw new UserNotFoundException('test-id');
      }
      try {
        throwUserNotFound();
      } catch (error) {
        expect(error).toBeInstanceOf(UserNotFoundException);
        expect(error.stack).toContain('throwUserNotFound');
        expect(error.stack).toContain('UserNotFoundException');
      }
    });
  });
});
