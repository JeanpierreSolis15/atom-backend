import { Test, TestingModule } from '@nestjs/testing';
import { TaskFactory } from './task.factory';
import { Task, TaskStatus, TaskPriority } from '../entities/task.entity';
describe('TaskFactory', () => {
  let taskFactory: TaskFactory;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskFactory],
    }).compile();
    taskFactory = module.get<TaskFactory>(TaskFactory);
  });
  describe('create', () => {
    it('debería crear una tarea con valores por defecto', () => {
      const title = 'Implementar autenticación JWT';
      const description = 'Implementar sistema de autenticación con JWT tokens';
      const userId = 'user-123';
      const dueDate = new Date('2024-12-31');
      const task = taskFactory.create(
        title,
        description,
        userId,
        undefined,
        dueDate,
      );
      expect(task).toBeInstanceOf(Task);
      expect(task.title).toBe(title);
      expect(task.description).toBe(description);
      expect(task.userId).toBe(userId);
      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.priority).toBe(TaskPriority.MEDIUM);
      expect(task.dueDate).toEqual(dueDate);
      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
      expect(task.createdAt.getTime()).toBeCloseTo(Date.now(), -2);
      expect(task.updatedAt.getTime()).toBeCloseTo(Date.now(), -2);
    });
    it('debería crear una tarea con valores personalizados', () => {
      const title = 'Revisar código';
      const description = 'Revisar el código del proyecto';
      const userId = 'user-456';
      const priority = TaskPriority.HIGH;
      const dueDate = new Date('2024-11-15');
      const status = TaskStatus.IN_PROGRESS;
      const task = taskFactory.create(
        title,
        description,
        userId,
        priority,
        dueDate,
        status,
      );
      expect(task).toBeInstanceOf(Task);
      expect(task.title).toBe(title);
      expect(task.description).toBe(description);
      expect(task.userId).toBe(userId);
      expect(task.status).toBe(status);
      expect(task.priority).toBe(priority);
      expect(task.dueDate).toEqual(dueDate);
      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });
    it('debería crear múltiples tareas con IDs únicos', () => {
      const title = 'Tarea de prueba';
      const description = 'Descripción de prueba';
      const userId = 'user-789';
      const dueDate = new Date();
      const task1 = taskFactory.create(
        title,
        description,
        userId,
        undefined,
        dueDate,
      );
      const task2 = taskFactory.create(
        title,
        description,
        userId,
        undefined,
        dueDate,
      );
      expect(task1.id).not.toBe(task2.id);
      expect(task1.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(task2.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
    it('debería crear tareas con diferentes prioridades', () => {
      const title = 'Tarea de prueba';
      const description = 'Descripción de prueba';
      const userId = 'user-123';
      const dueDate = new Date();
      const lowPriorityTask = taskFactory.create(
        title,
        description,
        userId,
        TaskPriority.LOW,
        dueDate,
      );
      const mediumPriorityTask = taskFactory.create(
        title,
        description,
        userId,
        TaskPriority.MEDIUM,
        dueDate,
      );
      const highPriorityTask = taskFactory.create(
        title,
        description,
        userId,
        TaskPriority.HIGH,
        dueDate,
      );
      expect(lowPriorityTask.priority).toBe(TaskPriority.LOW);
      expect(mediumPriorityTask.priority).toBe(TaskPriority.MEDIUM);
      expect(highPriorityTask.priority).toBe(TaskPriority.HIGH);
    });
    it('debería crear tareas con diferentes estados', () => {
      const title = 'Tarea de prueba';
      const description = 'Descripción de prueba';
      const userId = 'user-123';
      const dueDate = new Date();
      const todoTask = taskFactory.create(
        title,
        description,
        userId,
        undefined,
        dueDate,
        TaskStatus.TODO,
      );
      const inProgressTask = taskFactory.create(
        title,
        description,
        userId,
        undefined,
        dueDate,
        TaskStatus.IN_PROGRESS,
      );
      const doneTask = taskFactory.create(
        title,
        description,
        userId,
        undefined,
        dueDate,
        TaskStatus.DONE,
      );
      expect(todoTask.status).toBe(TaskStatus.TODO);
      expect(inProgressTask.status).toBe(TaskStatus.IN_PROGRESS);
      expect(doneTask.status).toBe(TaskStatus.DONE);
    });
    it('debería crear tareas con fechas de vencimiento específicas', () => {
      const title = 'Tarea de prueba';
      const description = 'Descripción de prueba';
      const userId = 'user-123';
      const pastDate = new Date('2023-01-01');
      const futureDate = new Date('2025-12-31');
      const currentDate = new Date();
      const pastTask = taskFactory.create(
        title,
        description,
        userId,
        undefined,
        pastDate,
      );
      const futureTask = taskFactory.create(
        title,
        description,
        userId,
        undefined,
        futureDate,
      );
      const currentTask = taskFactory.create(
        title,
        description,
        userId,
        undefined,
        currentDate,
      );
      expect(pastTask.dueDate).toEqual(pastDate);
      expect(futureTask.dueDate).toEqual(futureDate);
      expect(currentTask.dueDate).toEqual(currentDate);
    });
    it('debería crear tareas con títulos y descripciones largos', () => {
      const longTitle = 'A'.repeat(255);
      const longDescription = 'B'.repeat(1000);
      const userId = 'user-123';
      const dueDate = new Date();
      const task = taskFactory.create(
        longTitle,
        longDescription,
        userId,
        undefined,
        dueDate,
      );
      expect(task.title).toBe(longTitle);
      expect(task.description).toBe(longDescription);
    });
    it('debería crear tareas con títulos y descripciones vacíos', () => {
      const emptyTitle = '';
      const emptyDescription = '';
      const userId = 'user-123';
      const dueDate = new Date();
      const task = taskFactory.create(
        emptyTitle,
        emptyDescription,
        userId,
        undefined,
        dueDate,
      );
      expect(task.title).toBe(emptyTitle);
      expect(task.description).toBe(emptyDescription);
    });
    it('debería crear tareas con userIds especiales', () => {
      const title = 'Tarea de prueba';
      const description = 'Descripción de prueba';
      const dueDate = new Date();
      const numericUserId = taskFactory.create(
        title,
        description,
        '123',
        undefined,
        dueDate,
      );
      const uuidUserId = taskFactory.create(
        title,
        description,
        '550e8400-e29b-41d4-a716-446655440000',
        undefined,
        dueDate,
      );
      const specialUserId = taskFactory.create(
        title,
        description,
        'user@domain.com',
        undefined,
        dueDate,
      );
      expect(numericUserId.userId).toBe('123');
      expect(uuidUserId.userId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(specialUserId.userId).toBe('user@domain.com');
    });
  });
  describe('createFromData', () => {
    it('debería crear una tarea desde datos existentes', () => {
      const taskData = {
        id: 'task-123',
        title: 'Tarea existente',
        description: 'Descripción de tarea existente',
        userId: 'user-456',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-10-15'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      };
      const task = taskFactory.createFromData(taskData);
      expect(task).toBeInstanceOf(Task);
      expect(task.id).toBe(taskData.id);
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.userId).toBe(taskData.userId);
      expect(task.status).toBe(taskData.status);
      expect(task.priority).toBe(taskData.priority);
      expect(task.dueDate).toEqual(taskData.dueDate);
      expect(task.createdAt).toEqual(taskData.createdAt);
      expect(task.updatedAt).toEqual(taskData.updatedAt);
    });
    it('debería crear una tarea con todos los estados posibles', () => {
      const states = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
      states.forEach((status) => {
        const taskData = {
          id: `task-${status}`,
          title: `Tarea ${status}`,
          description: `Descripción ${status}`,
          userId: 'user-123',
          status,
          priority: TaskPriority.MEDIUM,
          dueDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const task = taskFactory.createFromData(taskData);
        expect(task.status).toBe(status);
      });
    });
    it('debería crear una tarea con todas las prioridades posibles', () => {
      const priorities = [
        TaskPriority.LOW,
        TaskPriority.MEDIUM,
        TaskPriority.HIGH,
      ];
      priorities.forEach((priority) => {
        const taskData = {
          id: `task-${priority}`,
          title: `Tarea ${priority}`,
          description: `Descripción ${priority}`,
          userId: 'user-123',
          status: TaskStatus.TODO,
          priority,
          dueDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const task = taskFactory.createFromData(taskData);
        expect(task.priority).toBe(priority);
      });
    });
    it('debería crear una tarea con fechas específicas', () => {
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-01-15T15:30:00Z');
      const dueDate = new Date('2024-12-31T23:59:59Z');
      const taskData = {
        id: 'task-dates',
        title: 'Tarea con fechas específicas',
        description: 'Descripción con fechas específicas',
        userId: 'user-123',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate,
        createdAt,
        updatedAt,
      };
      const task = taskFactory.createFromData(taskData);
      expect(task.createdAt).toEqual(createdAt);
      expect(task.updatedAt).toEqual(updatedAt);
      expect(task.dueDate).toEqual(dueDate);
    });
    it('debería crear una tarea con datos mínimos', () => {
      const taskData = {
        id: 'minimal-task',
        title: '',
        description: '',
        userId: '',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: new Date(0),
        createdAt: new Date(0),
        updatedAt: new Date(0),
      };
      const task = taskFactory.createFromData(taskData);
      expect(task.id).toBe(taskData.id);
      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.userId).toBe(taskData.userId);
      expect(task.status).toBe(taskData.status);
      expect(task.priority).toBe(taskData.priority);
      expect(task.dueDate).toEqual(taskData.dueDate);
      expect(task.createdAt).toEqual(taskData.createdAt);
      expect(task.updatedAt).toEqual(taskData.updatedAt);
    });
    it('debería crear una tarea con datos máximos', () => {
      const longTitle = 'A'.repeat(255);
      const longDescription = 'B'.repeat(1000);
      const longUserId = 'C'.repeat(100);
      const taskData = {
        id: 'maximal-task',
        title: longTitle,
        description: longDescription,
        userId: longUserId,
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2099-12-31T23:59:59.999Z'),
        createdAt: new Date('2020-01-01T00:00:00.000Z'),
        updatedAt: new Date('2099-12-31T23:59:59.999Z'),
      };
      const task = taskFactory.createFromData(taskData);
      expect(task.title).toBe(longTitle);
      expect(task.description).toBe(longDescription);
      expect(task.userId).toBe(longUserId);
      expect(task.dueDate).toEqual(taskData.dueDate);
      expect(task.createdAt).toEqual(taskData.createdAt);
      expect(task.updatedAt).toEqual(taskData.updatedAt);
    });
    it('debería crear múltiples tareas desde datos diferentes', () => {
      const taskData1 = {
        id: 'task-1',
        title: 'Tarea 1',
        description: 'Descripción 1',
        userId: 'user-1',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      const taskData2 = {
        id: 'task-2',
        title: 'Tarea 2',
        description: 'Descripción 2',
        userId: 'user-2',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-12-31'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-12-31'),
      };
      const task1 = taskFactory.createFromData(taskData1);
      const task2 = taskFactory.createFromData(taskData2);
      expect(task1.id).toBe(taskData1.id);
      expect(task2.id).toBe(taskData2.id);
      expect(task1.status).toBe(TaskStatus.TODO);
      expect(task2.status).toBe(TaskStatus.DONE);
      expect(task1.priority).toBe(TaskPriority.LOW);
      expect(task2.priority).toBe(TaskPriority.HIGH);
    });
  });
  describe('integración', () => {
    it('debería crear tareas consistentes entre create y createFromData', () => {
      const title = 'Tarea de integración';
      const description = 'Descripción de integración';
      const userId = 'user-integration';
      const priority = TaskPriority.HIGH;
      const dueDate = new Date('2024-06-15');
      const status = TaskStatus.IN_PROGRESS;
      const createdTask = taskFactory.create(
        title,
        description,
        userId,
        priority,
        dueDate,
        status,
      );
      const taskData = {
        id: createdTask.id,
        title: createdTask.title,
        description: createdTask.description,
        userId: createdTask.userId,
        status: createdTask.status,
        priority: createdTask.priority,
        dueDate: createdTask.dueDate,
        createdAt: createdTask.createdAt,
        updatedAt: createdTask.updatedAt,
      };
      const recreatedTask = taskFactory.createFromData(taskData);
      expect(recreatedTask).toEqual(createdTask);
      expect(recreatedTask.id).toBe(createdTask.id);
      expect(recreatedTask.title).toBe(createdTask.title);
      expect(recreatedTask.description).toBe(createdTask.description);
      expect(recreatedTask.userId).toBe(createdTask.userId);
      expect(recreatedTask.status).toBe(createdTask.status);
      expect(recreatedTask.priority).toBe(createdTask.priority);
      expect(recreatedTask.dueDate).toEqual(createdTask.dueDate);
      expect(recreatedTask.createdAt).toEqual(createdTask.createdAt);
      expect(recreatedTask.updatedAt).toEqual(createdTask.updatedAt);
    });
    it('debería manejar múltiples instancias de TaskFactory', async () => {
      const module1: TestingModule = await Test.createTestingModule({
        providers: [TaskFactory],
      }).compile();
      const module2: TestingModule = await Test.createTestingModule({
        providers: [TaskFactory],
      }).compile();
      const factory1 = module1.get<TaskFactory>(TaskFactory);
      const factory2 = module2.get<TaskFactory>(TaskFactory);
      const task1 = factory1.create(
        'Tarea 1',
        'Descripción 1',
        'user-1',
        undefined,
        new Date(),
      );
      const task2 = factory2.create(
        'Tarea 2',
        'Descripción 2',
        'user-2',
        undefined,
        new Date(),
      );
      expect(task1.id).not.toBe(task2.id);
      expect(task1.title).toBe('Tarea 1');
      expect(task2.title).toBe('Tarea 2');
    });
  });
});
