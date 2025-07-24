import { User } from './user.entity';
describe('User Entity', () => {
  const mockUserData = {
    id: 'test-id',
    email: 'test@example.com',
    name: 'John',
    lastName: 'Doe',
    passwordHash: 'hashed-password',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-02'),
    isActive: true,
  };
  describe('Constructor', () => {
    it('debería crear un usuario con todos los datos proporcionados', () => {
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.passwordHash,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      expect(user.id).toBe(mockUserData.id);
      expect(user.email).toBe(mockUserData.email);
      expect(user.name).toBe(mockUserData.name);
      expect(user.lastName).toBe(mockUserData.lastName);
      expect(user.passwordHash).toBe(mockUserData.passwordHash);
      expect(user.createdAt).toEqual(mockUserData.createdAt);
      expect(user.updatedAt).toEqual(mockUserData.updatedAt);
      expect(user.isActive).toBe(mockUserData.isActive);
    });
    it('debería crear un usuario con valores por defecto para isActive', () => {
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.passwordHash,
        mockUserData.createdAt,
        mockUserData.updatedAt,
      );
      expect(user.isActive).toBe(true);
    });
    it('debería manejar nombres con caracteres especiales', () => {
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        'José María',
        'García-López',
        mockUserData.passwordHash,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      expect(user.name).toBe('José María');
      expect(user.lastName).toBe('García-López');
    });
    it('debería manejar emails con diferentes formatos', () => {
      const emails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.com',
        '123@example.com',
      ];
      emails.forEach((email) => {
        const user = new User(
          mockUserData.id,
          email,
          mockUserData.name,
          mockUserData.lastName,
          mockUserData.passwordHash,
          mockUserData.createdAt,
          mockUserData.updatedAt,
          mockUserData.isActive,
        );
        expect(user.email).toBe(email);
      });
    });
  });
  describe('fullName getter', () => {
    it('debería retornar el nombre completo correctamente', () => {
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.passwordHash,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      expect(user.fullName).toBe('John Doe');
    });
    it('debería manejar nombres con caracteres especiales', () => {
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        'José María',
        'García-López',
        mockUserData.passwordHash,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      expect(user.fullName).toBe('José María García-López');
    });
    it('debería manejar nombres vacíos', () => {
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        '',
        '',
        mockUserData.passwordHash,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      expect(user.fullName).toBe(' ');
    });
  });
  describe('Métodos de instancia', () => {
    let user: User;
    beforeEach(() => {
      user = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.passwordHash,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
    });
    describe('activate', () => {
      it('debería activar un usuario inactivo', () => {
        const inactiveUser = new User(
          mockUserData.id,
          mockUserData.email,
          mockUserData.name,
          mockUserData.lastName,
          mockUserData.passwordHash,
          mockUserData.createdAt,
          mockUserData.updatedAt,
          false,
        );
        const activatedUser = inactiveUser.activate();
        expect(activatedUser).not.toBe(inactiveUser);
        expect(activatedUser.isActive).toBe(true);
        expect(activatedUser.updatedAt.getTime()).toBeGreaterThan(
          mockUserData.updatedAt.getTime(),
        );
        expect(activatedUser.id).toBe(inactiveUser.id);
        expect(activatedUser.email).toBe(inactiveUser.email);
        expect(activatedUser.name).toBe(inactiveUser.name);
        expect(activatedUser.lastName).toBe(inactiveUser.lastName);
        expect(activatedUser.passwordHash).toBe(inactiveUser.passwordHash);
        expect(activatedUser.createdAt).toEqual(inactiveUser.createdAt);
      });
      it('debería mantener activo un usuario ya activo', () => {
        const activatedUser = user.activate();
        expect(activatedUser).not.toBe(user);
        expect(activatedUser.isActive).toBe(true);
        expect(activatedUser.updatedAt.getTime()).toBeGreaterThan(
          mockUserData.updatedAt.getTime(),
        );
      });
    });
    describe('deactivate', () => {
      it('debería desactivar un usuario activo', () => {
        const deactivatedUser = user.deactivate();
        expect(deactivatedUser).not.toBe(user);
        expect(deactivatedUser.isActive).toBe(false);
        expect(deactivatedUser.updatedAt.getTime()).toBeGreaterThan(
          mockUserData.updatedAt.getTime(),
        );
        expect(deactivatedUser.id).toBe(user.id);
        expect(deactivatedUser.email).toBe(user.email);
        expect(deactivatedUser.name).toBe(user.name);
        expect(deactivatedUser.lastName).toBe(user.lastName);
        expect(deactivatedUser.passwordHash).toBe(user.passwordHash);
        expect(deactivatedUser.createdAt).toEqual(user.createdAt);
      });
      it('debería mantener inactivo un usuario ya inactivo', () => {
        const inactiveUser = new User(
          mockUserData.id,
          mockUserData.email,
          mockUserData.name,
          mockUserData.lastName,
          mockUserData.passwordHash,
          mockUserData.createdAt,
          mockUserData.updatedAt,
          false,
        );
        const deactivatedUser = inactiveUser.deactivate();
        expect(deactivatedUser).not.toBe(inactiveUser);
        expect(deactivatedUser.isActive).toBe(false);
        expect(deactivatedUser.updatedAt.getTime()).toBeGreaterThan(
          mockUserData.updatedAt.getTime(),
        );
      });
    });
    describe('updateProfile', () => {
      it('debería actualizar el nombre y apellido del usuario', () => {
        const newName = 'Jane';
        const newLastName = 'Smith';
        const updatedUser = user.updateProfile(newName, newLastName);
        expect(updatedUser).not.toBe(user);
        expect(updatedUser.name).toBe(newName);
        expect(updatedUser.lastName).toBe(newLastName);
        expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
          mockUserData.updatedAt.getTime(),
        );
        expect(updatedUser.id).toBe(user.id);
        expect(updatedUser.email).toBe(user.email);
        expect(updatedUser.passwordHash).toBe(user.passwordHash);
        expect(updatedUser.createdAt).toEqual(user.createdAt);
        expect(updatedUser.isActive).toBe(user.isActive);
      });
      it('debería actualizar solo el nombre', () => {
        const newName = 'Jane';
        const updatedUser = user.updateProfile(newName, mockUserData.lastName);
        expect(updatedUser).not.toBe(user);
        expect(updatedUser.name).toBe(newName);
        expect(updatedUser.lastName).toBe(mockUserData.lastName);
        expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
          mockUserData.updatedAt.getTime(),
        );
      });
      it('debería actualizar solo el apellido', () => {
        const newLastName = 'Smith';
        const updatedUser = user.updateProfile(mockUserData.name, newLastName);
        expect(updatedUser).not.toBe(user);
        expect(updatedUser.name).toBe(mockUserData.name);
        expect(updatedUser.lastName).toBe(newLastName);
        expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
          mockUserData.updatedAt.getTime(),
        );
      });
      it('debería manejar nombres vacíos', () => {
        const updatedUser = user.updateProfile('', '');
        expect(updatedUser).not.toBe(user);
        expect(updatedUser.name).toBe('');
        expect(updatedUser.lastName).toBe('');
        expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
          mockUserData.updatedAt.getTime(),
        );
      });
      it('debería manejar nombres con caracteres especiales', () => {
        const updatedUser = user.updateProfile('José María', 'García-López');
        expect(updatedUser).not.toBe(user);
        expect(updatedUser.name).toBe('José María');
        expect(updatedUser.lastName).toBe('García-López');
        expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
          mockUserData.updatedAt.getTime(),
        );
      });
    });
  });
  describe('Casos edge', () => {
    it('debería manejar IDs muy largos', () => {
      const longId = 'a'.repeat(1000);
      const user = new User(
        longId,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.passwordHash,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      expect(user.id).toBe(longId);
    });
    it('debería manejar nombres muy largos', () => {
      const longName = 'A'.repeat(1000);
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        longName,
        longName,
        mockUserData.passwordHash,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      expect(user.name).toBe(longName);
      expect(user.lastName).toBe(longName);
    });
    it('debería manejar contraseñas muy largas', () => {
      const longPassword = 'A'.repeat(1000);
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        longPassword,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      expect(user.passwordHash).toBe(longPassword);
    });
    it('debería manejar fechas muy antiguas', () => {
      const oldDate = new Date('1900-01-01');
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.passwordHash,
        oldDate,
        oldDate,
        mockUserData.isActive,
      );
      expect(user.createdAt).toEqual(oldDate);
      expect(user.updatedAt).toEqual(oldDate);
    });
    it('debería manejar fechas futuras', () => {
      const futureDate = new Date('2100-01-01');
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.passwordHash,
        futureDate,
        futureDate,
        mockUserData.isActive,
      );
      expect(user.createdAt).toEqual(futureDate);
      expect(user.updatedAt).toEqual(futureDate);
    });
  });
});
