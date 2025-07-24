import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseTaskRepository } from './task.repository';
import { FirebaseService } from '@shared/infrastructure/firebase/firebase.service';
import { TaskFactory } from '@domain/tasks/factories/task.factory';
import { Task } from '@domain/tasks/entities/task.entity';
describe('FirebaseTaskRepository', () => {
  let repository: FirebaseTaskRepository;
  let firebaseService: jest.Mocked<FirebaseService>;
  let taskFactory: jest.Mocked<TaskFactory>;
  const mockFirestore = {
    collection: jest.fn(),
  };
  const mockCollection = {
    doc: jest.fn(),
    where: jest.fn(),
    get: jest.fn(),
  };
  const mockDoc = {
    get: jest.fn(),
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockQuerySnapshot = {
    docs: [],
    empty: true,
  };
  const mockDocumentSnapshot = {
    exists: false,
    id: 'test-id',
    data: jest.fn(),
  };
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
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseTaskRepository,
        {
          provide: FirebaseService,
          useValue: {
            getFirestore: jest.fn().mockReturnValue(mockFirestore),
          },
        },
        {
          provide: TaskFactory,
          useValue: {
            createFromData: jest.fn(),
          },
        },
      ],
    }).compile();
    repository = module.get<FirebaseTaskRepository>(FirebaseTaskRepository);
    firebaseService = module.get(FirebaseService);
    taskFactory = module.get(TaskFactory);
    mockFirestore.collection.mockReturnValue(mockCollection);
    mockCollection.doc.mockReturnValue(mockDoc);
    mockCollection.where.mockReturnValue(mockCollection);
    mockCollection.get.mockResolvedValue(mockQuerySnapshot);
    mockDoc.get.mockResolvedValue(mockDocumentSnapshot);
    mockDoc.set.mockResolvedValue(undefined);
    mockDoc.update.mockResolvedValue(undefined);
    mockDoc.delete.mockResolvedValue(undefined);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('findById', () => {
    it('debería retornar una tarea cuando existe', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        userId: 'user-1',
        status: 'pending',
        priority: 'medium',
        dueDate: { toDate: () => new Date() },
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      };
      mockDocumentSnapshot.exists = true;
      mockDocumentSnapshot.data.mockReturnValue(taskData);
      taskFactory.createFromData.mockReturnValue(mockTask);
      const result = await repository.findById('task-1');
      expect(firebaseService.getFirestore).toHaveBeenCalled();
      expect(mockFirestore.collection).toHaveBeenCalledWith('tasks');
      expect(mockCollection.doc).toHaveBeenCalledWith('task-1');
      expect(mockDoc.get).toHaveBeenCalled();
      expect(taskFactory.createFromData).toHaveBeenCalledWith({
        id: 'test-id',
        title: taskData.title,
        description: taskData.description,
        userId: taskData.userId,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: expect.any(Date),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(result).toBe(mockTask);
    });
    it('debería retornar null cuando la tarea no existe', async () => {
      mockDocumentSnapshot.exists = false;
      const result = await repository.findById('task-1');
      expect(result).toBeNull();
      expect(taskFactory.createFromData).not.toHaveBeenCalled();
    });
    it('debería retornar null cuando hay un error', async () => {
      mockDoc.get.mockRejectedValue(new Error('Firebase error'));
      const result = await repository.findById('task-1');
      expect(result).toBeNull();
    });
  });
  describe('findByUserId', () => {
    it('debería retornar tareas de un usuario específico', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        userId: 'user-1',
        status: 'pending',
        priority: 'medium',
        dueDate: { toDate: () => new Date() },
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      };
      const mockDocs = [
        {
          id: 'task-1',
          data: () => taskData,
        },
        {
          id: 'task-2',
          data: () => taskData,
        },
      ];
      mockQuerySnapshot.docs = mockDocs;
      mockQuerySnapshot.empty = false;
      taskFactory.createFromData.mockReturnValue(mockTask);
      const result = await repository.findByUserId('user-1');
      expect(mockCollection.where).toHaveBeenCalledWith(
        'userId',
        '==',
        'user-1',
      );
      expect(mockCollection.get).toHaveBeenCalled();
      expect(taskFactory.createFromData).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });
    it('debería retornar array vacío cuando no hay tareas', async () => {
      mockQuerySnapshot.docs = [];
      mockQuerySnapshot.empty = true;
      const result = await repository.findByUserId('user-1');
      expect(result).toEqual([]);
    });
    it('debería retornar array vacío cuando hay un error', async () => {
      mockCollection.get.mockRejectedValue(new Error('Firebase error'));
      const result = await repository.findByUserId('user-1');
      expect(result).toEqual([]);
    });
  });
  describe('save', () => {
    it('debería guardar una nueva tarea', async () => {
      const result = await repository.save(mockTask);
      expect(mockDoc.set).toHaveBeenCalledWith({
        title: mockTask.title,
        description: mockTask.description,
        userId: mockTask.userId,
        status: mockTask.status,
        priority: mockTask.priority,
        dueDate: mockTask.dueDate,
        createdAt: mockTask.createdAt,
        updatedAt: mockTask.updatedAt,
      });
      expect(result).toBe(mockTask);
    });
    it('debería lanzar error cuando falla el guardado', async () => {
      mockDoc.set.mockRejectedValue(new Error('Firebase error'));
      await expect(repository.save(mockTask)).rejects.toThrow(
        'Error al guardar la tarea',
      );
    });
  });
  describe('update', () => {
    it('debería actualizar una tarea existente', async () => {
      const result = await repository.update(mockTask);
      expect(mockDoc.update).toHaveBeenCalledWith({
        title: mockTask.title,
        description: mockTask.description,
        status: mockTask.status,
        priority: mockTask.priority,
        dueDate: mockTask.dueDate,
        updatedAt: mockTask.updatedAt,
      });
      expect(result).toBe(mockTask);
    });
    it('debería lanzar error cuando falla la actualización', async () => {
      mockDoc.update.mockRejectedValue(new Error('Firebase error'));
      await expect(repository.update(mockTask)).rejects.toThrow(
        'Error al actualizar la tarea',
      );
    });
  });
  describe('delete', () => {
    it('debería eliminar una tarea', async () => {
      await repository.delete('task-1');
      expect(mockCollection.doc).toHaveBeenCalledWith('task-1');
      expect(mockDoc.delete).toHaveBeenCalled();
    });
    it('debería lanzar error cuando falla la eliminación', async () => {
      mockDoc.delete.mockRejectedValue(new Error('Firebase error'));
      await expect(repository.delete('task-1')).rejects.toThrow(
        'Error al eliminar la tarea',
      );
    });
  });
  describe('findAll', () => {
    it('debería retornar todas las tareas', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        userId: 'user-1',
        status: 'pending',
        priority: 'medium',
        dueDate: { toDate: () => new Date() },
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      };
      const mockDocs = [
        {
          id: 'task-1',
          data: () => taskData,
        },
        {
          id: 'task-2',
          data: () => taskData,
        },
      ];
      mockQuerySnapshot.docs = mockDocs;
      taskFactory.createFromData.mockReturnValue(mockTask);
      const result = await repository.findAll();
      expect(mockCollection.get).toHaveBeenCalled();
      expect(taskFactory.createFromData).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
    });
    it('debería retornar array vacío cuando no hay tareas', async () => {
      mockQuerySnapshot.docs = [];
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });
    it('debería retornar array vacío cuando hay un error', async () => {
      mockCollection.get.mockRejectedValue(new Error('Firebase error'));
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });
  });
  describe('configuración de colección', () => {
    it('debería usar el nombre de colección correcto', async () => {
      await repository.findById('task-1');
      expect(mockFirestore.collection).toHaveBeenCalledWith('tasks');
    });
    it('debería usar el nombre de colección en todas las operaciones', async () => {
      await repository.findByUserId('user-1');
      expect(mockFirestore.collection).toHaveBeenCalledWith('tasks');
      await repository.save(mockTask);
      expect(mockFirestore.collection).toHaveBeenCalledWith('tasks');
      await repository.update(mockTask);
      expect(mockFirestore.collection).toHaveBeenCalledWith('tasks');
      await repository.delete('task-1');
      expect(mockFirestore.collection).toHaveBeenCalledWith('tasks');
      await repository.findAll();
      expect(mockFirestore.collection).toHaveBeenCalledWith('tasks');
    });
  });
  describe('manejo de errores', () => {
    it('debería manejar diferentes tipos de errores de Firebase', async () => {
      const errorTypes = [
        new Error('Permission denied'),
        new Error('Network error'),
        new Error('Invalid document'),
        new Error('Service unavailable'),
      ];
      for (const error of errorTypes) {
        mockDoc.get.mockRejectedValue(error);
        const result = await repository.findById('task-1');
        expect(result).toBeNull();
      }
    });
    it('debería manejar errores en operaciones de escritura', async () => {
      const errorTypes = [
        new Error('Write failed'),
        new Error('Validation error'),
        new Error('Quota exceeded'),
      ];
      for (const error of errorTypes) {
        mockDoc.set.mockRejectedValue(error);
        await expect(repository.save(mockTask)).rejects.toThrow(
          'Error al guardar la tarea',
        );
      }
    });
  });
});
