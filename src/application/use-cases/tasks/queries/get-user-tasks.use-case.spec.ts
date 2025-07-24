import { Test, TestingModule } from '@nestjs/testing';
import { GetUserTasksUseCase } from './get-user-tasks.use-case';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '@domain/tasks/entities/task.entity';
describe('GetUserTasksUseCase', () => {
  let getUserTasksUseCase: GetUserTasksUseCase;
  let taskRepository: jest.Mocked<ITaskRepository>;
  const mockTasks = [
    new Task(
      'task1',
      'Task 1',
      'Description 1',
      'test-user-id',
      TaskStatus.TODO,
      TaskPriority.LOW,
      new Date('2024-01-01'),
      new Date('2023-01-01'),
      new Date('2023-01-01'),
    ),
    new Task(
      'task2',
      'Task 2',
      'Description 2',
      'test-user-id',
      TaskStatus.IN_PROGRESS,
      TaskPriority.MEDIUM,
      new Date('2024-02-01'),
      new Date('2023-01-01'),
      new Date('2023-01-01'),
    ),
    new Task(
      'task3',
      'Task 3',
      'Description 3',
      'test-user-id',
      TaskStatus.DONE,
      TaskPriority.HIGH,
      new Date('2024-03-01'),
      new Date('2023-01-01'),
      new Date('2023-01-01'),
    ),
  ];
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserTasksUseCase,
        {
          provide: 'ITaskRepository',
          useValue: {
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();
    getUserTasksUseCase = module.get<GetUserTasksUseCase>(GetUserTasksUseCase);
    taskRepository = module.get('ITaskRepository');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('execute', () => {
    it('debería obtener las tareas de un usuario exitosamente', async () => {
      const userId = 'test-user-id';
      taskRepository.findByUserId.mockResolvedValue(mockTasks);
      const result = await getUserTasksUseCase.execute(userId);
      expect(result).toEqual(mockTasks);
      expect(result).toHaveLength(3);
      expect(taskRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
    it('debería retornar una lista vacía cuando el usuario no tiene tareas', async () => {
      const userId = 'user-without-tasks';
      taskRepository.findByUserId.mockResolvedValue([]);
      const result = await getUserTasksUseCase.execute(userId);
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(taskRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
    it('debería manejar un usuario con una sola tarea', async () => {
      const userId = 'user-with-one-task';
      const singleTask = [mockTasks[0]];
      taskRepository.findByUserId.mockResolvedValue(singleTask);
      const result = await getUserTasksUseCase.execute(userId);
      expect(result).toEqual(singleTask);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task1');
      expect(taskRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
    it('debería manejar un usuario con muchas tareas', async () => {
      const userId = 'user-with-many-tasks';
      const manyTasks = Array.from(
        { length: 50 },
        (_, index) =>
          new Task(
            `task${index}`,
            `Task ${index}`,
            `Description ${index}`,
            userId,
            TaskStatus.TODO,
            TaskPriority.MEDIUM,
            new Date('2024-12-31'),
            new Date('2023-01-01'),
            new Date('2023-01-01'),
          ),
      );
      taskRepository.findByUserId.mockResolvedValue(manyTasks);
      const result = await getUserTasksUseCase.execute(userId);
      expect(result).toEqual(manyTasks);
      expect(result).toHaveLength(50);
      expect(taskRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
    it('debería manejar diferentes IDs de usuario', async () => {
      const userIds = ['user1', 'user2', 'user3', 'admin-user'];
      for (const userId of userIds) {
        taskRepository.findByUserId.mockResolvedValue(mockTasks);
        const result = await getUserTasksUseCase.execute(userId);
        expect(result).toEqual(mockTasks);
        expect(taskRepository.findByUserId).toHaveBeenCalledWith(userId);
      }
    });
    it('debería manejar tareas con diferentes estados para el mismo usuario', async () => {
      const userId = 'user-with-different-states';
      const tasksWithDifferentStates = [
        new Task(
          'todo-task',
          'Todo Task',
          'Description',
          userId,
          TaskStatus.TODO,
          TaskPriority.LOW,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
        new Task(
          'in-progress-task',
          'In Progress Task',
          'Description',
          userId,
          TaskStatus.IN_PROGRESS,
          TaskPriority.MEDIUM,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
        new Task(
          'done-task',
          'Done Task',
          'Description',
          userId,
          TaskStatus.DONE,
          TaskPriority.HIGH,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
      ];
      taskRepository.findByUserId.mockResolvedValue(tasksWithDifferentStates);
      const result = await getUserTasksUseCase.execute(userId);
      expect(result).toEqual(tasksWithDifferentStates);
      expect(result).toHaveLength(3);
      expect(result[0].status).toBe(TaskStatus.TODO);
      expect(result[1].status).toBe(TaskStatus.IN_PROGRESS);
      expect(result[2].status).toBe(TaskStatus.DONE);
    });
    it('debería manejar tareas con diferentes prioridades para el mismo usuario', async () => {
      const userId = 'user-with-different-priorities';
      const tasksWithDifferentPriorities = [
        new Task(
          'low-task',
          'Low Task',
          'Description',
          userId,
          TaskStatus.TODO,
          TaskPriority.LOW,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
        new Task(
          'medium-task',
          'Medium Task',
          'Description',
          userId,
          TaskStatus.TODO,
          TaskPriority.MEDIUM,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
        new Task(
          'high-task',
          'High Task',
          'Description',
          userId,
          TaskStatus.TODO,
          TaskPriority.HIGH,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
        new Task(
          'urgent-task',
          'Urgent Task',
          'Description',
          userId,
          TaskStatus.TODO,
          TaskPriority.URGENT,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
      ];
      taskRepository.findByUserId.mockResolvedValue(
        tasksWithDifferentPriorities,
      );
      const result = await getUserTasksUseCase.execute(userId);
      expect(result).toEqual(tasksWithDifferentPriorities);
      expect(result).toHaveLength(4);
      expect(result[0].priority).toBe(TaskPriority.LOW);
      expect(result[1].priority).toBe(TaskPriority.MEDIUM);
      expect(result[2].priority).toBe(TaskPriority.HIGH);
      expect(result[3].priority).toBe(TaskPriority.URGENT);
    });
    it('debería manejar tareas con diferentes fechas de vencimiento para el mismo usuario', async () => {
      const userId = 'user-with-different-dates';
      const tasksWithDifferentDueDates = [
        new Task(
          'task1',
          'Task 1',
          'Description',
          userId,
          TaskStatus.TODO,
          TaskPriority.LOW,
          new Date('2024-01-01'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
        new Task(
          'task2',
          'Task 2',
          'Description',
          userId,
          TaskStatus.TODO,
          TaskPriority.LOW,
          new Date('2024-06-15'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
        new Task(
          'task3',
          'Task 3',
          'Description',
          userId,
          TaskStatus.TODO,
          TaskPriority.LOW,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
      ];
      taskRepository.findByUserId.mockResolvedValue(tasksWithDifferentDueDates);
      const result = await getUserTasksUseCase.execute(userId);
      expect(result).toEqual(tasksWithDifferentDueDates);
      expect(result).toHaveLength(3);
      expect(result[0].dueDate).toEqual(new Date('2024-01-01'));
      expect(result[1].dueDate).toEqual(new Date('2024-06-15'));
      expect(result[2].dueDate).toEqual(new Date('2024-12-31'));
    });
    it('debería manejar errores del repositorio', async () => {
      const userId = 'test-user-id';
      const repositoryError = new Error('Error en repositorio');
      taskRepository.findByUserId.mockRejectedValue(repositoryError);
      await expect(getUserTasksUseCase.execute(userId)).rejects.toThrow(
        'Error en repositorio',
      );
      expect(taskRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
    it('debería manejar errores de base de datos', async () => {
      const userId = 'test-user-id';
      const databaseError = new Error('Database connection failed');
      taskRepository.findByUserId.mockRejectedValue(databaseError);
      await expect(getUserTasksUseCase.execute(userId)).rejects.toThrow(
        'Database connection failed',
      );
      expect(taskRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
    it('debería manejar errores de timeout', async () => {
      const userId = 'test-user-id';
      const timeoutError = new Error('Request timeout');
      taskRepository.findByUserId.mockRejectedValue(timeoutError);
      await expect(getUserTasksUseCase.execute(userId)).rejects.toThrow(
        'Request timeout',
      );
      expect(taskRepository.findByUserId).toHaveBeenCalledWith(userId);
    });
    it('debería manejar IDs de usuario con caracteres especiales', async () => {
      const specialUserIds = [
        'user-with-dashes',
        'user_with_underscores',
        'user.with.dots',
        'user@with#special$chars',
        'user-with-123-numbers',
        'USER-WITH-UPPERCASE',
      ];
      for (const userId of specialUserIds) {
        taskRepository.findByUserId.mockResolvedValue(mockTasks);
        const result = await getUserTasksUseCase.execute(userId);
        expect(result).toEqual(mockTasks);
        expect(taskRepository.findByUserId).toHaveBeenCalledWith(userId);
      }
    });
    it('debería manejar IDs de usuario muy largos', async () => {
      const longUserId = 'a'.repeat(100);
      taskRepository.findByUserId.mockResolvedValue(mockTasks);
      const result = await getUserTasksUseCase.execute(longUserId);
      expect(result).toEqual(mockTasks);
      expect(taskRepository.findByUserId).toHaveBeenCalledWith(longUserId);
    });
    it('debería manejar IDs de usuario vacíos', async () => {
      const emptyUserId = '';
      taskRepository.findByUserId.mockResolvedValue([]);
      const result = await getUserTasksUseCase.execute(emptyUserId);
      expect(result).toEqual([]);
      expect(taskRepository.findByUserId).toHaveBeenCalledWith(emptyUserId);
    });
    it('debería manejar IDs de usuario con espacios', async () => {
      const userIdWithSpaces = ' user with spaces ';
      taskRepository.findByUserId.mockResolvedValue(mockTasks);
      const result = await getUserTasksUseCase.execute(userIdWithSpaces);
      expect(result).toEqual(mockTasks);
      expect(taskRepository.findByUserId).toHaveBeenCalledWith(
        userIdWithSpaces,
      );
    });
    it('debería retornar tareas con todos los campos correctos', async () => {
      const userId = 'custom-user-id';
      const customTask = new Task(
        'custom-task-id',
        'Custom Task',
        'Custom Description',
        userId,
        TaskStatus.IN_PROGRESS,
        TaskPriority.HIGH,
        new Date('2024-06-15'),
        new Date('2023-01-01'),
        new Date('2023-01-01'),
      );
      taskRepository.findByUserId.mockResolvedValue([customTask]);
      const result = await getUserTasksUseCase.execute(userId);
      expect(result).toHaveLength(1);
      const task = result[0];
      expect(task.id).toBe('custom-task-id');
      expect(task.title).toBe('Custom Task');
      expect(task.description).toBe('Custom Description');
      expect(task.userId).toBe(userId);
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
      expect(task.priority).toBe(TaskPriority.HIGH);
      expect(task.dueDate).toEqual(new Date('2024-06-15'));
      expect(task.createdAt).toEqual(new Date('2023-01-01'));
      expect(task.updatedAt).toEqual(new Date('2023-01-01'));
    });
    it('debería manejar tareas con títulos y descripciones largos', async () => {
      const userId = 'user-with-long-text';
      const longTitle = 'A'.repeat(200);
      const longDescription = 'B'.repeat(1000);
      const taskWithLongText = new Task(
        'long-text-task',
        longTitle,
        longDescription,
        userId,
        TaskStatus.TODO,
        TaskPriority.LOW,
        new Date('2024-12-31'),
        new Date('2023-01-01'),
        new Date('2023-01-01'),
      );
      taskRepository.findByUserId.mockResolvedValue([taskWithLongText]);
      const result = await getUserTasksUseCase.execute(userId);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe(longTitle);
      expect(result[0].description).toBe(longDescription);
    });
    it('debería manejar tareas con caracteres especiales', async () => {
      const userId = 'user-with-special-chars';
      const specialTitle = 'Tarea con caracteres especiales: áéíóú ñ @#$%^&*()';
      const specialDescription =
        'Descripción con emojis 🚀 📝 ✅ y símbolos <>&"\'';
      const taskWithSpecialChars = new Task(
        'special-chars-task',
        specialTitle,
        specialDescription,
        userId,
        TaskStatus.TODO,
        TaskPriority.LOW,
        new Date('2024-12-31'),
        new Date('2023-01-01'),
        new Date('2023-01-01'),
      );
      taskRepository.findByUserId.mockResolvedValue([taskWithSpecialChars]);
      const result = await getUserTasksUseCase.execute(userId);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe(specialTitle);
      expect(result[0].description).toBe(specialDescription);
    });
    it('debería verificar que todas las tareas pertenecen al usuario correcto', async () => {
      const userId = 'specific-user-id';
      const userTasks = [
        new Task(
          'task1',
          'Task 1',
          'Description',
          userId,
          TaskStatus.TODO,
          TaskPriority.LOW,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
        new Task(
          'task2',
          'Task 2',
          'Description',
          userId,
          TaskStatus.IN_PROGRESS,
          TaskPriority.MEDIUM,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
        new Task(
          'task3',
          'Task 3',
          'Description',
          userId,
          TaskStatus.DONE,
          TaskPriority.HIGH,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
      ];
      taskRepository.findByUserId.mockResolvedValue(userTasks);
      const result = await getUserTasksUseCase.execute(userId);
      expect(result).toHaveLength(3);
      result.forEach((task) => {
        expect(task.userId).toBe(userId);
      });
    });
  });
});
