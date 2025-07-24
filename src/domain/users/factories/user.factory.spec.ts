import { UserFactory } from './user.factory';
import { Email } from '../value-objects/email.vo';
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
      const user = await userFactory.create(email, name, lastName);
      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe(email);
      expect(user.name).toBe(name);
      expect(user.lastName).toBe(lastName);
      expect(user.id).toBeDefined();
      expect(user.id).toHaveLength(36);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.isActive).toBe(true);
    });

    it('debería generar IDs únicos para diferentes usuarios', async () => {
      const user1 = await userFactory.create(
        'test1@example.com',
        'John',
        'Doe',
      );
      const user2 = await userFactory.create(
        'test2@example.com',
        'Jane',
        'Smith',
      );
      expect(user1.id).not.toBe(user2.id);
    });

    it('debería establecer timestamps actuales', async () => {
      const beforeCreation = new Date();
      const user = await userFactory.create('test@example.com', 'John', 'Doe');
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
      );
      expect(user.name).toBe('José María');
      expect(user.lastName).toBe('García-López');
    });

    it('debería manejar nombres vacíos', async () => {
      const user = await userFactory.create('test@example.com', '', '');
      expect(user.name).toBe('');
      expect(user.lastName).toBe('');
    });

    it('debería manejar nombres muy largos', async () => {
      const longName = 'A'.repeat(1000);
      const user = await userFactory.create(
        'test@example.com',
        longName,
        longName,
      );
      expect(user).toBeInstanceOf(User);
      expect(user.name).toBe(longName);
      expect(user.lastName).toBe(longName);
    });

    it('debería validar el email durante la creación', async () => {
      await expect(
        userFactory.create('invalid-email', 'John', 'Doe'),
      ).rejects.toThrow('Email inválido');
    });

    it('debería manejar emails con diferentes formatos válidos', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.com',
        '123@example.com',
      ];

      for (const email of validEmails) {
        const user = await userFactory.create(email, 'John', 'Doe');
        expect(user.email).toBe(email);
      }
    });

    it('debería manejar emails muy largos', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      const user = await userFactory.create(longEmail, 'John', 'Doe');
      expect(user.email).toBe(longEmail);
    });
  });

  describe('createFromData', () => {
    it('debería crear un usuario desde datos existentes', () => {
      const userData = {
        id: 'existing-id',
        email: 'existing@example.com',
        name: 'Existing',
        lastName: 'User',
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
      expect(user.createdAt).toEqual(userData.createdAt);
      expect(user.updatedAt).toEqual(userData.updatedAt);
      expect(user.isActive).toBe(userData.isActive);
    });

    it('debería manejar usuarios activos', () => {
      const userData = {
        id: 'active-id',
        email: 'active@example.com',
        name: 'Active',
        lastName: 'User',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        isActive: true,
      };

      const user = userFactory.createFromData(userData);
      expect(user.isActive).toBe(true);
    });

    it('debería manejar usuarios con nombres especiales', () => {
      const userData = {
        id: 'special-id',
        email: 'special@example.com',
        name: 'José María',
        lastName: 'García-López',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
        isActive: true,
      };

      const user = userFactory.createFromData(userData);
      expect(user.name).toBe('José María');
      expect(user.lastName).toBe('García-López');
    });
  });
});
