import { User } from './user.entity';

describe('User Entity', () => {
  const mockUserData = {
    id: 'test-id',
    email: 'test@example.com',
    name: 'John',
    lastName: 'Doe',
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
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      expect(user.id).toBe(mockUserData.id);
      expect(user.email).toBe(mockUserData.email);
      expect(user.name).toBe(mockUserData.name);
      expect(user.lastName).toBe(mockUserData.lastName);
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
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      expect(user.fullName).toBe(' ');
    });
  });

  describe('activate method', () => {
    it('debería activar un usuario inactivo', () => {
      const inactiveUser = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        false,
      );
      const activatedUser = inactiveUser.activate();
      expect(activatedUser.isActive).toBe(true);
      expect(activatedUser.id).toBe(inactiveUser.id);
      expect(activatedUser.email).toBe(inactiveUser.email);
      expect(activatedUser.name).toBe(inactiveUser.name);
      expect(activatedUser.lastName).toBe(inactiveUser.lastName);
      expect(activatedUser.createdAt).toEqual(inactiveUser.createdAt);
      expect(activatedUser.updatedAt.getTime()).toBeGreaterThan(
        inactiveUser.updatedAt.getTime(),
      );
    });

    it('debería mantener activo un usuario ya activo', () => {
      const activeUser = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        true,
      );
      const activatedUser = activeUser.activate();
      expect(activatedUser.isActive).toBe(true);
    });
  });

  describe('deactivate method', () => {
    it('debería desactivar un usuario activo', () => {
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        true,
      );
      const deactivatedUser = user.deactivate();
      expect(deactivatedUser.isActive).toBe(false);
      expect(deactivatedUser.id).toBe(user.id);
      expect(deactivatedUser.email).toBe(user.email);
      expect(deactivatedUser.name).toBe(user.name);
      expect(deactivatedUser.lastName).toBe(user.lastName);
      expect(deactivatedUser.createdAt).toEqual(user.createdAt);
      expect(deactivatedUser.updatedAt.getTime()).toBeGreaterThan(
        user.updatedAt.getTime(),
      );
    });

    it('debería mantener inactivo un usuario ya inactivo', () => {
      const inactiveUser = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        false,
      );
      const deactivatedUser = inactiveUser.deactivate();
      expect(deactivatedUser.isActive).toBe(false);
    });
  });

  describe('updateProfile method', () => {
    it('debería actualizar el nombre y apellido del usuario', () => {
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      const updatedUser = user.updateProfile('Jane', 'Smith');
      expect(updatedUser.name).toBe('Jane');
      expect(updatedUser.lastName).toBe('Smith');
      expect(updatedUser.id).toBe(user.id);
      expect(updatedUser.email).toBe(user.email);
      expect(updatedUser.createdAt).toEqual(user.createdAt);
      expect(updatedUser.isActive).toBe(user.isActive);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
        user.updatedAt.getTime(),
      );
    });

    it('debería manejar nombres con caracteres especiales', () => {
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      const updatedUser = user.updateProfile('José María', 'García-López');
      expect(updatedUser.name).toBe('José María');
      expect(updatedUser.lastName).toBe('García-López');
    });

    it('debería manejar nombres vacíos', () => {
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      const updatedUser = user.updateProfile('', '');
      expect(updatedUser.name).toBe('');
      expect(updatedUser.lastName).toBe('');
    });
  });

  describe('Edge cases', () => {
    it('debería manejar IDs muy largos', () => {
      const longId = 'A'.repeat(1000);
      const user = new User(
        longId,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
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
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      expect(user.name).toBe(longName);
      expect(user.lastName).toBe(longName);
    });

    it('debería manejar emails muy largos', () => {
      const longEmail = 'A'.repeat(1000) + '@example.com';
      const user = new User(
        mockUserData.id,
        longEmail,
        mockUserData.name,
        mockUserData.lastName,
        mockUserData.createdAt,
        mockUserData.updatedAt,
        mockUserData.isActive,
      );
      expect(user.email).toBe(longEmail);
    });

    it('debería manejar fechas en el futuro', () => {
      const futureDate = new Date('2030-01-01');
      const user = new User(
        mockUserData.id,
        mockUserData.email,
        mockUserData.name,
        mockUserData.lastName,
        futureDate,
        futureDate,
        mockUserData.isActive,
      );
      expect(user.createdAt).toEqual(futureDate);
      expect(user.updatedAt).toEqual(futureDate);
    });
  });
});
