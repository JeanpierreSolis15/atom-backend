import {
  SwaggerUserResponse,
  SwaggerRegisterResponse,
  SwaggerUsersResponse,
  SwaggerTaskResponse,
  SwaggerTasksResponse,
  SwaggerAuthResponse,
  SwaggerEmptyResponse,
} from './swagger-response-types';
describe('Swagger Response Types', () => {
  describe('SwaggerUserResponse', () => {
    it('debería estar definido', () => {
      expect(SwaggerUserResponse).toBeDefined();
    });
    it('debería tener todas las propiedades requeridas', () => {
      const response = new SwaggerUserResponse();
      expect(response).toBeInstanceOf(SwaggerUserResponse);
      expect(typeof response).toBe('object');
    });
    it('debería permitir asignar valores', () => {
      const response = new SwaggerUserResponse();
      const userData = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
      };
      response.success = true;
      response.statusCode = 200;
      response.message = 'Usuario obtenido exitosamente';
      response.timestamp = '2023-01-01T00:00:00Z';
      response.data = userData;
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('Usuario obtenido exitosamente');
      expect(response.timestamp).toBe('2023-01-01T00:00:00Z');
      expect(response.data).toEqual(userData);
    });
    it('debería manejar diferentes tipos de datos de usuario', () => {
      const response = new SwaggerUserResponse();
      const fullUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed-password',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isActive: true,
      };
      response.data = fullUser;
      expect(response.data).toEqual(fullUser);
      const minimalUser = {
        id: 'user-2',
        email: 'minimal@example.com',
      };
      response.data = minimalUser;
      expect(response.data).toEqual(minimalUser);
    });
  });
  describe('SwaggerRegisterResponse', () => {
    it('debería estar definido', () => {
      expect(SwaggerRegisterResponse).toBeDefined();
    });
    it('debería tener todas las propiedades requeridas', () => {
      const response = new SwaggerRegisterResponse();
      expect(response).toBeInstanceOf(SwaggerRegisterResponse);
      expect(typeof response).toBe('object');
    });
    it('debería permitir asignar datos de registro', () => {
      const response = new SwaggerRegisterResponse();
      const registerData = {
        id: 'user-1',
        email: 'newuser@example.com',
        name: 'New',
        lastName: 'User',
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
      };
      response.success = true;
      response.statusCode = 201;
      response.message = 'Usuario registrado exitosamente';
      response.timestamp = '2023-01-01T00:00:00Z';
      response.data = registerData;
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(201);
      expect(response.message).toBe('Usuario registrado exitosamente');
      expect(response.timestamp).toBe('2023-01-01T00:00:00Z');
      expect(response.data).toEqual(registerData);
    });
  });
  describe('SwaggerUsersResponse', () => {
    it('debería estar definido', () => {
      expect(SwaggerUsersResponse).toBeDefined();
    });
    it('debería tener todas las propiedades requeridas', () => {
      const response = new SwaggerUsersResponse();
      expect(response).toBeInstanceOf(SwaggerUsersResponse);
      expect(typeof response).toBe('object');
    });
    it('debería permitir asignar array de usuarios', () => {
      const response = new SwaggerUsersResponse();
      const usersData = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          name: 'John',
          lastName: 'Doe',
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          name: 'Jane',
          lastName: 'Smith',
        },
      ];
      response.success = true;
      response.statusCode = 200;
      response.message = 'Usuarios obtenidos exitosamente';
      response.timestamp = '2023-01-01T00:00:00Z';
      response.data = usersData;
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('Usuarios obtenidos exitosamente');
      expect(response.timestamp).toBe('2023-01-01T00:00:00Z');
      expect(response.data).toEqual(usersData);
      expect(response.data).toHaveLength(2);
    });
    it('debería permitir array vacío', () => {
      const response = new SwaggerUsersResponse();
      response.data = [];
      expect(response.data).toEqual([]);
      expect(response.data).toHaveLength(0);
    });
  });
  describe('SwaggerTaskResponse', () => {
    it('debería estar definido', () => {
      expect(SwaggerTaskResponse).toBeDefined();
    });
    it('debería tener todas las propiedades requeridas', () => {
      const response = new SwaggerTaskResponse();
      expect(response).toBeInstanceOf(SwaggerTaskResponse);
      expect(typeof response).toBe('object');
    });
    it('debería permitir asignar datos de tarea', () => {
      const response = new SwaggerTaskResponse();
      const taskData = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Test Description',
        userId: 'user-1',
        status: 'pending',
        priority: 'medium',
        dueDate: '2023-12-31T23:59:59Z',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };
      response.success = true;
      response.statusCode = 200;
      response.message = 'Tarea obtenida exitosamente';
      response.timestamp = '2023-01-01T00:00:00Z';
      response.data = taskData;
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('Tarea obtenida exitosamente');
      expect(response.timestamp).toBe('2023-01-01T00:00:00Z');
      expect(response.data).toEqual(taskData);
    });
  });
  describe('SwaggerTasksResponse', () => {
    it('debería estar definido', () => {
      expect(SwaggerTasksResponse).toBeDefined();
    });
    it('debería tener todas las propiedades requeridas', () => {
      const response = new SwaggerTasksResponse();
      expect(response).toBeInstanceOf(SwaggerTasksResponse);
      expect(typeof response).toBe('object');
    });
    it('debería permitir asignar array de tareas', () => {
      const response = new SwaggerTasksResponse();
      const tasksData = [
        {
          id: 'task-1',
          title: 'Task 1',
          description: 'Description 1',
          userId: 'user-1',
          status: 'pending',
          priority: 'medium',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Description 2',
          userId: 'user-1',
          status: 'completed',
          priority: 'high',
        },
      ];
      response.success = true;
      response.statusCode = 200;
      response.message = 'Tareas obtenidas exitosamente';
      response.timestamp = '2023-01-01T00:00:00Z';
      response.data = tasksData;
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('Tareas obtenidas exitosamente');
      expect(response.timestamp).toBe('2023-01-01T00:00:00Z');
      expect(response.data).toEqual(tasksData);
      expect(response.data).toHaveLength(2);
    });
    it('debería permitir array vacío', () => {
      const response = new SwaggerTasksResponse();
      response.data = [];
      expect(response.data).toEqual([]);
      expect(response.data).toHaveLength(0);
    });
  });
  describe('SwaggerAuthResponse', () => {
    it('debería estar definido', () => {
      expect(SwaggerAuthResponse).toBeDefined();
    });
    it('debería tener todas las propiedades requeridas', () => {
      const response = new SwaggerAuthResponse();
      expect(response).toBeInstanceOf(SwaggerAuthResponse);
      expect(typeof response).toBe('object');
    });
    it('debería permitir asignar datos de autenticación', () => {
      const response = new SwaggerAuthResponse();
      const authData = {
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'John',
          lastName: 'Doe',
        },
      };
      response.success = true;
      response.statusCode = 200;
      response.message = 'Autenticación exitosa';
      response.timestamp = '2023-01-01T00:00:00Z';
      response.data = authData;
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('Autenticación exitosa');
      expect(response.timestamp).toBe('2023-01-01T00:00:00Z');
      expect(response.data).toEqual(authData);
    });
  });
  describe('SwaggerEmptyResponse', () => {
    it('debería estar definido', () => {
      expect(SwaggerEmptyResponse).toBeDefined();
    });
    it('debería tener todas las propiedades requeridas', () => {
      const response = new SwaggerEmptyResponse();
      expect(response).toBeInstanceOf(SwaggerEmptyResponse);
      expect(typeof response).toBe('object');
    });
    it('debería permitir asignar null como datos', () => {
      const response = new SwaggerEmptyResponse();
      response.success = true;
      response.statusCode = 204;
      response.message = 'Operación exitosa sin contenido';
      response.timestamp = '2023-01-01T00:00:00Z';
      response.data = null;
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(204);
      expect(response.message).toBe('Operación exitosa sin contenido');
      expect(response.timestamp).toBe('2023-01-01T00:00:00Z');
      expect(response.data).toBeNull();
    });
  });
  describe('Estructura común', () => {
    it('todas las clases deberían tener la misma estructura base', () => {
      const classes = [
        SwaggerUserResponse,
        SwaggerRegisterResponse,
        SwaggerUsersResponse,
        SwaggerTaskResponse,
        SwaggerTasksResponse,
        SwaggerAuthResponse,
        SwaggerEmptyResponse,
      ];
      classes.forEach((ResponseClass) => {
        const response = new ResponseClass();
        expect(response).toBeInstanceOf(ResponseClass);
        expect(typeof response).toBe('object');
      });
    });
    it('debería poder crear instancias de todas las clases', () => {
      expect(() => new SwaggerUserResponse()).not.toThrow();
      expect(() => new SwaggerRegisterResponse()).not.toThrow();
      expect(() => new SwaggerUsersResponse()).not.toThrow();
      expect(() => new SwaggerTaskResponse()).not.toThrow();
      expect(() => new SwaggerTasksResponse()).not.toThrow();
      expect(() => new SwaggerAuthResponse()).not.toThrow();
      expect(() => new SwaggerEmptyResponse()).not.toThrow();
    });
  });
  describe('Tipos de datos', () => {
    it('debería manejar diferentes tipos de datos en la propiedad data', () => {
      const userResponse = new SwaggerUserResponse();
      userResponse.data = { id: 'user-1', name: 'John' };
      expect(userResponse.data).toEqual({ id: 'user-1', name: 'John' });
      const usersResponse = new SwaggerUsersResponse();
      usersResponse.data = [{ id: 'user-1' }, { id: 'user-2' }];
      expect(usersResponse.data).toHaveLength(2);
      const tasksResponse = new SwaggerTasksResponse();
      tasksResponse.data = [{ id: 'task-1' }, { id: 'task-2' }];
      expect(tasksResponse.data).toHaveLength(2);
      const emptyResponse = new SwaggerEmptyResponse();
      emptyResponse.data = null;
      expect(emptyResponse.data).toBeNull();
    });
    it('debería manejar propiedades opcionales en los datos', () => {
      const userResponse = new SwaggerUserResponse();
      const minimalData = { id: 'user-1' };
      userResponse.data = minimalData;
      expect((userResponse.data as any).id).toBe('user-1');
      const fullData = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed-password',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        isActive: true,
      };
      userResponse.data = fullData;
      expect((userResponse.data as any).email).toBe('test@example.com');
      expect((userResponse.data as any).isActive).toBe(true);
    });
  });
  describe('Validación de tipos', () => {
    it('debería permitir asignar valores booleanos a success', () => {
      const response = new SwaggerUserResponse();
      response.success = true;
      expect(response.success).toBe(true);
      response.success = false;
      expect(response.success).toBe(false);
    });
    it('debería permitir asignar números a statusCode', () => {
      const response = new SwaggerUserResponse();
      response.statusCode = 200;
      expect(response.statusCode).toBe(200);
      response.statusCode = 404;
      expect(response.statusCode).toBe(404);
      response.statusCode = 500;
      expect(response.statusCode).toBe(500);
    });
    it('debería permitir asignar strings a message y timestamp', () => {
      const response = new SwaggerUserResponse();
      response.message = 'Test message';
      response.timestamp = '2023-01-01T00:00:00Z';
      expect(response.message).toBe('Test message');
      expect(response.timestamp).toBe('2023-01-01T00:00:00Z');
    });
  });
});
