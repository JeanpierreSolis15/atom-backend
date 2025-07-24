import { Test, TestingModule } from '@nestjs/testing';
import { GetAllUsersUseCase } from './get-all-users.use-case';
import { IUserRepository } from '@domain/users/repositories/user.repository.interface';
import { User } from '@domain/users/entities/user.entity';
describe('GetAllUsersUseCase', () => {
  let useCase: GetAllUsersUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  const mockUsers = [
    {
      id: 'user-1',
      email: 'user1@example.com',
      name: 'John',
      lastName: 'Doe',
      passwordHash: 'hashed-password-1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      isActive: true,
    },
    {
      id: 'user-2',
      email: 'user2@example.com',
      name: 'Jane',
      lastName: 'Smith',
      passwordHash: 'hashed-password-2',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      isActive: true,
    },
    {
      id: 'user-3',
      email: 'user3@example.com',
      name: 'Bob',
      lastName: 'Johnson',
      passwordHash: 'hashed-password-3',
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03'),
      isActive: false,
    },
  ] as User[];
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllUsersUseCase,
        {
          provide: 'IUserRepository',
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();
    useCase = module.get<GetAllUsersUseCase>(GetAllUsersUseCase);
    userRepository = module.get('IUserRepository');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('execute', () => {
    it('debería retornar todos los usuarios cuando existen', async () => {
      userRepository.findAll.mockResolvedValue(mockUsers);
      const result = await useCase.execute();
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
      expect(userRepository.findAll).toHaveBeenCalledWith();
      expect(result).toBe(mockUsers);
      expect(result).toHaveLength(3);
    });
    it('debería retornar array vacío cuando no hay usuarios', async () => {
      userRepository.findAll.mockResolvedValue([]);
      const result = await useCase.execute();
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
      expect(userRepository.findAll).toHaveBeenCalledWith();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
    it('debería retornar un solo usuario cuando solo existe uno', async () => {
      const singleUser = [mockUsers[0]];
      userRepository.findAll.mockResolvedValue(singleUser);
      const result = await useCase.execute();
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
      expect(userRepository.findAll).toHaveBeenCalledWith();
      expect(result).toBe(singleUser);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('user-1');
      expect(result[0].email).toBe('user1@example.com');
    });
    it('debería retornar múltiples usuarios con diferentes estados', async () => {
      userRepository.findAll.mockResolvedValue(mockUsers);
      const result = await useCase.execute();
      expect(result).toHaveLength(3);
      expect(result[0].isActive).toBe(true);
      expect(result[1].isActive).toBe(true);
      expect(result[2].isActive).toBe(false);
    });
    it('debería manejar usuarios con diferentes fechas de creación', async () => {
      const usersWithDifferentDates = [
        {
          ...mockUsers[0],
          createdAt: new Date('2023-01-01T10:00:00Z'),
          updatedAt: new Date('2023-01-01T10:00:00Z'),
        },
        {
          ...mockUsers[1],
          createdAt: new Date('2023-06-15T14:30:00Z'),
          updatedAt: new Date('2023-06-15T14:30:00Z'),
        },
        {
          ...mockUsers[2],
          createdAt: new Date('2023-12-31T23:59:59Z'),
          updatedAt: new Date('2023-12-31T23:59:59Z'),
        },
      ] as User[];
      userRepository.findAll.mockResolvedValue(usersWithDifferentDates);
      const result = await useCase.execute();
      expect(result).toHaveLength(3);
      expect(result[0].createdAt).toEqual(new Date('2023-01-01T10:00:00Z'));
      expect(result[1].createdAt).toEqual(new Date('2023-06-15T14:30:00Z'));
      expect(result[2].createdAt).toEqual(new Date('2023-12-31T23:59:59Z'));
    });
    it('debería manejar usuarios con diferentes formatos de email', async () => {
      const usersWithDifferentEmails = [
        {
          ...mockUsers[0],
          email: 'john.doe@company.com',
        },
        {
          ...mockUsers[1],
          email: 'jane+tag@domain.org',
        },
        {
          ...mockUsers[2],
          email: 'admin@subdomain.example.co.uk',
        },
      ] as User[];
      userRepository.findAll.mockResolvedValue(usersWithDifferentEmails);
      const result = await useCase.execute();
      expect(result).toHaveLength(3);
      expect(result[0].email).toBe('john.doe@company.com');
      expect(result[1].email).toBe('jane+tag@domain.org');
      expect(result[2].email).toBe('admin@subdomain.example.co.uk');
    });
    it('debería manejar usuarios con nombres y apellidos especiales', async () => {
      const usersWithSpecialNames = [
        {
          ...mockUsers[0],
          name: 'José',
          lastName: 'García-López',
        },
        {
          ...mockUsers[1],
          name: 'Mary-Jane',
          lastName: "O'Connor",
        },
        {
          ...mockUsers[2],
          name: 'Jean-Pierre',
          lastName: 'van der Berg',
        },
      ] as User[];
      userRepository.findAll.mockResolvedValue(usersWithSpecialNames);
      const result = await useCase.execute();
      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('José');
      expect(result[0].lastName).toBe('García-López');
      expect(result[1].name).toBe('Mary-Jane');
      expect(result[1].lastName).toBe("O'Connor");
      expect(result[2].name).toBe('Jean-Pierre');
      expect(result[2].lastName).toBe('van der Berg');
    });
    it('debería propagar errores del repositorio', async () => {
      const error = new Error('Error al obtener usuarios');
      userRepository.findAll.mockRejectedValue(error);
      await expect(useCase.execute()).rejects.toThrow(
        'Error al obtener usuarios',
      );
      expect(userRepository.findAll).toHaveBeenCalledTimes(1);
    });
    it('debería manejar diferentes tipos de errores del repositorio', async () => {
      const errorTypes = [
        new Error('Database connection failed'),
        new Error('Permission denied'),
        new Error('Network timeout'),
        new Error('Service unavailable'),
      ];
      for (const error of errorTypes) {
        userRepository.findAll.mockRejectedValue(error);
        await expect(useCase.execute()).rejects.toThrow(error.message);
      }
    });
    it('debería manejar errores con detalles específicos', async () => {
      const detailedError = new Error('Firebase error: PERMISSION_DENIED');
      userRepository.findAll.mockRejectedValue(detailedError);
      await expect(useCase.execute()).rejects.toThrow(
        'Firebase error: PERMISSION_DENIED',
      );
    });
  });
  describe('configuración de dependencias', () => {
    it('debería estar definido', () => {
      expect(useCase).toBeDefined();
    });
    it('debería tener el repositorio inyectado correctamente', () => {
      expect(userRepository).toBeDefined();
      expect(userRepository.findAll).toBeDefined();
      expect(typeof userRepository.findAll).toBe('function');
    });
    it('debería usar el token de inyección correcto', () => {
      expect(userRepository).toBeDefined();
    });
  });
  describe('comportamiento asíncrono', () => {
    it('debería manejar operaciones asíncronas correctamente', async () => {
      userRepository.findAll.mockResolvedValue(mockUsers);
      const promise = useCase.execute();
      expect(promise).toBeInstanceOf(Promise);
      const result = await promise;
      expect(result).toBe(mockUsers);
    });
    it('debería manejar múltiples llamadas concurrentes', async () => {
      userRepository.findAll.mockResolvedValue(mockUsers);
      const promises = [
        useCase.execute(),
        useCase.execute(),
        useCase.execute(),
      ];
      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toBe(mockUsers);
      });
      expect(userRepository.findAll).toHaveBeenCalledTimes(3);
    });
  });
  describe('validación de datos', () => {
    it('debería retornar usuarios con estructura válida', async () => {
      userRepository.findAll.mockResolvedValue(mockUsers);
      const result = await useCase.execute();
      result.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('lastName');
        expect(user).toHaveProperty('passwordHash');
        expect(user).toHaveProperty('createdAt');
        expect(user).toHaveProperty('updatedAt');
        expect(user).toHaveProperty('isActive');
      });
    });
    it('debería manejar usuarios con propiedades opcionales', async () => {
      const usersWithOptionalProps = [
        {
          ...mockUsers[0],
        },
      ] as User[];
      userRepository.findAll.mockResolvedValue(usersWithOptionalProps);
      const result = await useCase.execute();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeDefined();
    });
  });
});
