import { UserFactory } from './user.factory';
import { Email } from '../value-objects/email.vo';
import { Password } from '../value-objects/password.vo';
import { User } from '../entities/user.entity';
describe('UserFactory', () => {
  let userFactory: UserFactory;
  beforeEach(() => {
    userFactory = new UserFactory();
  });
  describe('create', () => {
    it('debería crear un usuario válido con todos los datos', async () => {
      const email = 'test@example.com';
      const name = 'John';
      const lastName = 'Doe';
      const password = 'password123';
      const user = await userFactory.create(email, name, lastName, password);
      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe(email);
      expect(user.name).toBe(name);
      expect(user.lastName).toBe(lastName);
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe(password);
      expect(user.id).toBeDefined();
      expect(user.id).toHaveLength(36);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.isActive).toBe(true);
    });
    it('debería generar un hash diferente para la misma contraseña', async () => {
      const password = 'password123';
      const user1 = await userFactory.create(
        'test1@example.com',
        'John',
        'Doe',
        password,
      );
      const user2 = await userFactory.create(
        'test2@example.com',
        'Jane',
        'Smith',
        password,
      );
      expect(user1.passwordHash).not.toBe(user2.passwordHash);
      expect(user1.passwordHash).not.toBe(password);
      expect(user2.passwordHash).not.toBe(password);
    });
    it('debería generar IDs únicos para diferentes usuarios', async () => {
      const user1 = await userFactory.create(
        'test1@example.com',
        'John',
        'Doe',
        'password123',
      );
      const user2 = await userFactory.create(
        'test2@example.com',
        'Jane',
        'Smith',
        'password456',
      );
      expect(user1.id).not.toBe(user2.id);
    });
    it('debería establecer timestamps actuales', async () => {
      const beforeCreation = new Date();
      const user = await userFactory.create(
        'test@example.com',
        'John',
        'Doe',
        'password123',
      );
      const afterCreation = new Date();
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
    });
    it('debería manejar nombres con caracteres especiales', async () => {
      const user = await userFactory.create(
        'test@example.com',
        'José María',
        'García-López',
        'password123',
      );
      expect(user.name).toBe('José María');
      expect(user.lastName).toBe('García-López');
    });
    it('debería manejar emails con diferentes formatos', async () => {
      const emails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.com',
        '123@example.com',
      ];
      for (const email of emails) {
        const user = await userFactory.create(
          email,
          'John',
          'Doe',
          'password123',
        );
        expect(user.email).toBe(email);
      }
    });
    it('debería validar el email durante la creación', async () => {
      await expect(
        userFactory.create('invalid-email', 'John', 'Doe', 'password123'),
      ).rejects.toThrow('Email inválido');
    });
    it('debería aceptar contraseñas cortas (la validación se hace en el Password VO)', async () => {
      const user = await userFactory.create(
        'test@example.com',
        'John',
        'Doe',
        '123',
      );
      expect(user).toBeInstanceOf(User);
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe('123');
    });
    it('debería crear usuario sin contraseña', async () => {
      const user = await userFactory.create(
        'test@example.com',
        'John',
        'Doe',
      );
      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.passwordHash).toBe('');
      expect(user.id).toBeDefined();
      expect(user.id).toHaveLength(36);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.isActive).toBe(true);
    });
    it('debería crear usuario con contraseña vacía', async () => {
      const user = await userFactory.create(
        'test@example.com',
        'John',
        'Doe',
        '',
      );
      expect(user).toBeInstanceOf(User);
      expect(user.passwordHash).toBe('');
    });
  });
  describe('createFromData', () => {
    it('debería crear un usuario desde datos existentes', () => {
      const userData = {
        id: 'test-id-123',
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed-password-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        isActive: false,
      };
      const user = userFactory.createFromData(userData);
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe(userData.id);
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.passwordHash).toBe(userData.passwordHash);
      expect(user.createdAt).toEqual(userData.createdAt);
      expect(user.updatedAt).toEqual(userData.updatedAt);
      expect(user.isActive).toBe(userData.isActive);
    });
    it('debería preservar exactamente los datos proporcionados', () => {
      const now = new Date();
      const userData = {
        id: 'custom-id',
        email: 'custom@example.com',
        name: 'Custom Name',
        lastName: 'Custom Last Name',
        passwordHash: 'custom-hash',
        createdAt: now,
        updatedAt: now,
        isActive: true,
      };
      const user = userFactory.createFromData(userData);
      expect(user.id).toBe(userData.id);
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.passwordHash).toBe(userData.passwordHash);
      expect(user.createdAt).toBe(userData.createdAt);
      expect(user.updatedAt).toBe(userData.updatedAt);
      expect(user.isActive).toBe(userData.isActive);
    });
    it('debería manejar fechas como objetos Date', () => {
      const userData = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        passwordHash: 'hash',
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-01T11:00:00Z'),
        isActive: true,
      };
      const user = userFactory.createFromData(userData);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.createdAt.getTime()).toBe(userData.createdAt.getTime());
      expect(user.updatedAt.getTime()).toBe(userData.updatedAt.getTime());
    });
    it('debería manejar diferentes estados de isActive', () => {
      const activeUser = userFactory.createFromData({
        id: 'active-user',
        email: 'active@example.com',
        name: 'Active',
        lastName: 'User',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });
      const inactiveUser = userFactory.createFromData({
        id: 'inactive-user',
        email: 'inactive@example.com',
        name: 'Inactive',
        lastName: 'User',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: false,
      });
      expect(activeUser.isActive).toBe(true);
      expect(inactiveUser.isActive).toBe(false);
    });
  });
  describe('Casos edge', () => {
    it('debería manejar nombres vacíos', async () => {
      const user = await userFactory.create(
        'test@example.com',
        '',
        '',
        'password123',
      );
      expect(user.name).toBe('');
      expect(user.lastName).toBe('');
    });
    it('debería manejar nombres muy largos', async () => {
      const longName = 'A'.repeat(1000);
      const user = await userFactory.create(
        'test@example.com',
        longName,
        longName,
        'password123',
      );
      expect(user.name).toBe(longName);
      expect(user.lastName).toBe(longName);
    });
    it('debería manejar contraseñas muy largas', async () => {
      const longPassword = 'A'.repeat(1000);
      const user = await userFactory.create(
        'test@example.com',
        'John',
        'Doe',
        longPassword,
      );
      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe(longPassword);
    });
  });
});
