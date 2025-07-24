import {
  AuthResponse,
  UserResponse,
  UsersResponse,
  TaskResponse,
  TasksResponse,
  AuthResponseWrapper,
  EmptyResponse,
} from './response-types';
import { ApiResponse } from './api-response.model';
import { User } from '@domain/users/entities/user.entity';
import { Task } from '@domain/tasks/entities/task.entity';
describe('Response Types', () => {
  describe('AuthResponse', () => {
    it('debería estar definido', () => {
      expect(AuthResponse).toBeDefined();
    });
    it('debería tener las propiedades correctas', () => {
      const authResponse = new AuthResponse();
      expect(authResponse).toBeInstanceOf(AuthResponse);
      expect(typeof authResponse).toBe('object');
    });
    it('debería permitir asignar valores', () => {
      const authResponse = new AuthResponse();
      const userData = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      };
      authResponse.accessToken = 'access-token-123';
      authResponse.refreshToken = 'refresh-token-456';
      authResponse.user = userData;
      expect(authResponse.accessToken).toBe('access-token-123');
      expect(authResponse.refreshToken).toBe('refresh-token-456');
      expect(authResponse.user).toEqual(userData);
    });
    it('debería tener la estructura de usuario correcta', () => {
      const authResponse = new AuthResponse();
      const userData = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      };
      authResponse.user = userData;
      expect(authResponse.user).toHaveProperty('id');
      expect(authResponse.user).toHaveProperty('email');
      expect(authResponse.user).toHaveProperty('name');
      expect(authResponse.user).toHaveProperty('lastName');
    });
  });
  describe('UserResponse', () => {
    it('debería estar definido', () => {
      expect(UserResponse).toBeDefined();
    });
    it('debería extender ApiResponse', () => {
      expect(UserResponse.prototype).toBeInstanceOf(ApiResponse);
    });
    it('debería poder crear instancia con constructor', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      } as User;
      const userResponse = new UserResponse(true, 200, 'Success', mockUser);
      expect(userResponse).toBeInstanceOf(ApiResponse);
      expect(userResponse.data).toBe(mockUser);
    });
    it('debería poder crear instancia con método estático success', () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      } as User;
      const userResponse = UserResponse.success(
        mockUser,
        'Usuario obtenido exitosamente',
        200,
      );
      expect(userResponse.success).toBe(true);
      expect(userResponse.statusCode).toBe(200);
      expect(userResponse.message).toBe('Usuario obtenido exitosamente');
      expect(userResponse.data).toBe(mockUser);
    });
    it('debería poder crear instancia con método estático error', () => {
      const userResponse = UserResponse.error(
        'Usuario no encontrado',
        404,
        null,
      );
      expect(userResponse.success).toBe(false);
      expect(userResponse.statusCode).toBe(404);
      expect(userResponse.message).toBe('Usuario no encontrado');
      expect(userResponse.data).toBeNull();
    });
  });
  describe('UsersResponse', () => {
    it('debería estar definido', () => {
      expect(UsersResponse).toBeDefined();
    });
    it('debería extender ApiResponse', () => {
      expect(UsersResponse.prototype).toBeInstanceOf(ApiResponse);
    });
    it('debería poder crear instancia con array de usuarios', () => {
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'John',
          lastName: 'Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'Jane',
          lastName: 'Smith',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        },
      ] as User[];
      const usersResponse = new UsersResponse(true, 200, 'Success', mockUsers);
      expect(usersResponse.data).toBe(mockUsers);
      expect(usersResponse.data).toHaveLength(2);
    });
    it('debería poder crear instancia con array vacío', () => {
      const usersResponse = new UsersResponse(true, 200, 'No hay usuarios', []);
      expect(usersResponse.data).toEqual([]);
      expect(usersResponse.data).toHaveLength(0);
    });
    it('debería poder usar método estático success', () => {
      const mockUsers = [{ id: 'user-1', email: 'test@example.com' }] as User[];
      const usersResponse = UsersResponse.success(
        mockUsers,
        'Usuarios obtenidos',
        200,
      );
      expect(usersResponse.success).toBe(true);
      expect(usersResponse.data).toBe(mockUsers);
    });
  });
  describe('TaskResponse', () => {
    it('debería estar definido', () => {
      expect(TaskResponse).toBeDefined();
    });
    it('debería extender ApiResponse', () => {
      expect(TaskResponse.prototype).toBeInstanceOf(ApiResponse);
    });
    it('debería poder crear instancia con datos de tarea', () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        userId: 'user-1',
        status: 'pending',
        priority: 'medium',
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        markAsInProgress: jest.fn(),
        markAsDone: jest.fn(),
        markAsTodo: jest.fn(),
        updateDetails: jest.fn(),
      } as unknown as Task;
      const taskResponse = new TaskResponse(true, 200, 'Success', mockTask);
      expect(taskResponse.data).toBe(mockTask);
    });
    it('debería poder usar método estático success', () => {
      const mockTask = { id: 'task-1', title: 'Test Task' } as unknown as Task;
      const taskResponse = TaskResponse.success(
        mockTask,
        'Tarea obtenida',
        200,
      );
      expect(taskResponse.success).toBe(true);
      expect(taskResponse.data).toBe(mockTask);
    });
  });
  describe('TasksResponse', () => {
    it('debería estar definido', () => {
      expect(TasksResponse).toBeDefined();
    });
    it('debería extender ApiResponse', () => {
      expect(TasksResponse.prototype).toBeInstanceOf(ApiResponse);
    });
    it('debería poder crear instancia con array de tareas', () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          userId: 'user-1',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          markAsInProgress: jest.fn(),
          markAsDone: jest.fn(),
          markAsTodo: jest.fn(),
          updateDetails: jest.fn(),
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Description 2',
          userId: 'user-1',
          status: 'completed',
          priority: 'high',
          dueDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          markAsInProgress: jest.fn(),
          markAsDone: jest.fn(),
          markAsTodo: jest.fn(),
          updateDetails: jest.fn(),
        },
      ] as unknown as Task[];
      const tasksResponse = new TasksResponse(true, 200, 'Success', mockTasks);
      expect(tasksResponse.data).toBe(mockTasks);
      expect(tasksResponse.data).toHaveLength(2);
    });
    it('debería poder crear instancia con array vacío', () => {
      const tasksResponse = new TasksResponse(true, 200, 'No hay tareas', []);
      expect(tasksResponse.data).toEqual([]);
      expect(tasksResponse.data).toHaveLength(0);
    });
  });
  describe('AuthResponseWrapper', () => {
    it('debería estar definido', () => {
      expect(AuthResponseWrapper).toBeDefined();
    });
    it('debería extender ApiResponse', () => {
      expect(AuthResponseWrapper.prototype).toBeInstanceOf(ApiResponse);
    });
    it('debería poder crear instancia con datos de autenticación', () => {
      const mockAuthResponse = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'John',
          lastName: 'Doe',
        },
      };
      const authResponseWrapper = new AuthResponseWrapper(
        true,
        200,
        'Success',
        mockAuthResponse,
      );
      expect(authResponseWrapper.data).toBe(mockAuthResponse);
      expect(authResponseWrapper.data.accessToken).toBe('access-token-123');
      expect(authResponseWrapper.data.user.id).toBe('user-1');
    });
  });
  describe('EmptyResponse', () => {
    it('debería estar definido', () => {
      expect(EmptyResponse).toBeDefined();
    });
    it('debería extender ApiResponse', () => {
      expect(EmptyResponse.prototype).toBeInstanceOf(ApiResponse);
    });
    it('debería poder crear instancia con null como datos', () => {
      const emptyResponse = new EmptyResponse(true, 204, 'No content', null);
      expect(emptyResponse.data).toBeNull();
    });
    it('debería poder usar método estático success', () => {
      const emptyResponse = EmptyResponse.success(
        null,
        'Operación exitosa',
        204,
      );
      expect(emptyResponse.success).toBe(true);
      expect(emptyResponse.data).toBeNull();
    });
  });
  describe('Herencia y tipos', () => {
    it('todas las clases de respuesta deberían extender ApiResponse', () => {
      expect(UserResponse.prototype).toBeInstanceOf(ApiResponse);
      expect(UsersResponse.prototype).toBeInstanceOf(ApiResponse);
      expect(TaskResponse.prototype).toBeInstanceOf(ApiResponse);
      expect(TasksResponse.prototype).toBeInstanceOf(ApiResponse);
      expect(AuthResponseWrapper.prototype).toBeInstanceOf(ApiResponse);
      expect(EmptyResponse.prototype).toBeInstanceOf(ApiResponse);
    });
    it('debería poder crear instancias de todas las clases', () => {
      expect(
        () => new UserResponse(true, 200, 'Success', {} as User),
      ).not.toThrow();
      expect(() => new UsersResponse(true, 200, 'Success', [])).not.toThrow();
      expect(
        () => new TaskResponse(true, 200, 'Success', {} as unknown as Task),
      ).not.toThrow();
      expect(() => new TasksResponse(true, 200, 'Success', [])).not.toThrow();
      expect(
        () =>
          new AuthResponseWrapper(true, 200, 'Success', {
            accessToken: '',
            refreshToken: '',
            user: { id: '', email: '', name: '', lastName: '' },
          }),
      ).not.toThrow();
      expect(() => new EmptyResponse(true, 200, 'Success', null)).not.toThrow();
    });
  });
  describe('Compatibilidad con ApiResponse', () => {
    it('debería heredar todas las propiedades de ApiResponse', () => {
      const userResponse = new UserResponse(true, 200, 'Success', {} as User);
      expect(userResponse).toHaveProperty('success');
      expect(userResponse).toHaveProperty('statusCode');
      expect(userResponse).toHaveProperty('message');
      expect(userResponse).toHaveProperty('timestamp');
      expect(userResponse).toHaveProperty('data');
    });
    it('debería tener propiedades readonly', () => {
      const userResponse = new UserResponse(true, 200, 'Success', {} as User);
      expect(userResponse.success).toBe(true);
      expect(userResponse.statusCode).toBe(200);
      expect(userResponse.message).toBe('Success');
      expect(userResponse.timestamp).toBeDefined();
      expect(userResponse.data).toBeDefined();
    });
    it('debería generar timestamp automáticamente', () => {
      const beforeCreation = new Date();
      const userResponse = new UserResponse(true, 200, 'Success', {} as User);
      const afterCreation = new Date();
      const responseTimestamp = new Date(userResponse.timestamp);
      expect(responseTimestamp.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime(),
      );
      expect(responseTimestamp.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime(),
      );
    });
  });
  describe('Métodos estáticos', () => {
    it('debería poder usar success() en todas las clases', () => {
      const userResponse = UserResponse.success({} as User);
      const usersResponse = UsersResponse.success([]);
      const taskResponse = TaskResponse.success({} as unknown as Task);
      const tasksResponse = TasksResponse.success([]);
      const authResponse = AuthResponseWrapper.success({
        accessToken: '',
        refreshToken: '',
        user: { id: '', email: '', name: '', lastName: '' },
      });
      const emptyResponse = EmptyResponse.success(null);
      expect(userResponse.success).toBe(true);
      expect(usersResponse.success).toBe(true);
      expect(taskResponse.success).toBe(true);
      expect(tasksResponse.success).toBe(true);
      expect(authResponse.success).toBe(true);
      expect(emptyResponse.success).toBe(true);
    });
    it('debería poder usar error() en todas las clases', () => {
      const userResponse = UserResponse.error('Error', 500, null);
      const usersResponse = UsersResponse.error('Error', 500, []);
      const taskResponse = TaskResponse.error('Error', 500, null);
      const tasksResponse = TasksResponse.error('Error', 500, []);
      const authResponse = AuthResponseWrapper.error('Error', 500, null);
      const emptyResponse = EmptyResponse.error('Error', 500, null);
      expect(userResponse.success).toBe(false);
      expect(usersResponse.success).toBe(false);
      expect(taskResponse.success).toBe(false);
      expect(tasksResponse.success).toBe(false);
      expect(authResponse.success).toBe(false);
      expect(emptyResponse.success).toBe(false);
    });
  });
});
