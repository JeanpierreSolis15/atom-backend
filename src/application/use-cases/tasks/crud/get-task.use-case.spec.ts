import { Test, TestingModule } from '@nestjs/testing';
import { GetTaskUseCase } from './get-task.use-case';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
import { TaskNotFoundException } from '@domain/tasks/exceptions/task-not-found.exception';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '@domain/tasks/entities/task.entity';
describe('GetTaskUseCase', () => {
  let getTaskUseCase: GetTaskUseCase;
  let taskRepository: jest.Mocked<ITaskRepository>;
  const mockTask = new Task(
    'test-task-id',
    'Test Task',
    'Test Description',
    'test-user-id',
    TaskStatus.TODO,
    TaskPriority.MEDIUM,
    new Date('2024-12-31'),
    new Date('2023-01-01'),
    new Date('2023-01-01'),
  );
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTaskUseCase,
        {
          provide: 'ITaskRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();
    getTaskUseCase = module.get<GetTaskUseCase>(GetTaskUseCase);
    taskRepository = module.get('ITaskRepository');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('execute', () => {
    it('debería obtener una tarea exitosamente', async () => {
      const taskId = 'test-task-id';
      taskRepository.findById.mockResolvedValue(mockTask);
      const result = await getTaskUseCase.execute(taskId);
      expect(result).toEqual(mockTask);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });
    it('debería lanzar TaskNotFoundException cuando la tarea no existe', async () => {
      const taskId = 'non-existent-task-id';
      taskRepository.findById.mockResolvedValue(null);
      await expect(getTaskUseCase.execute(taskId)).rejects.toThrow(
        TaskNotFoundException,
      );
      await expect(getTaskUseCase.execute(taskId)).rejects.toThrow(taskId);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });
    it('debería manejar diferentes IDs de tarea', async () => {
      const taskIds = [
        'task1',
        'task2',
        'task3',
        'long-task-id-with-special-chars',
      ];
      for (const taskId of taskIds) {
        taskRepository.findById.mockResolvedValue(mockTask);
        const result = await getTaskUseCase.execute(taskId);
        expect(result).toEqual(mockTask);
        expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      }
    });
    it('debería manejar tareas con diferentes estados', async () => {
      const taskIds = ['todo-task', 'in-progress-task', 'done-task'];
      const taskStates = [
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.DONE,
      ];
      for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];
        const taskState = taskStates[i];
        const taskWithState = new Task(
          taskId,
          'Test Task',
          'Test Description',
          'test-user-id',
          taskState,
          TaskPriority.MEDIUM,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        );
        taskRepository.findById.mockResolvedValue(taskWithState);
        const result = await getTaskUseCase.execute(taskId);
        expect(result).toEqual(taskWithState);
        expect(result.status).toBe(taskState);
        expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      }
    });
    it('debería manejar tareas con diferentes prioridades', async () => {
      const taskIds = ['low-task', 'medium-task', 'high-task', 'urgent-task'];
      const taskPriorities = [
        TaskPriority.LOW,
        TaskPriority.MEDIUM,
        TaskPriority.HIGH,
        TaskPriority.URGENT,
      ];
      for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];
        const taskPriority = taskPriorities[i];
        const taskWithPriority = new Task(
          taskId,
          'Test Task',
          'Test Description',
          'test-user-id',
          TaskStatus.TODO,
          taskPriority,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        );
        taskRepository.findById.mockResolvedValue(taskWithPriority);
        const result = await getTaskUseCase.execute(taskId);
        expect(result).toEqual(taskWithPriority);
        expect(result.priority).toBe(taskPriority);
        expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      }
    });
    it('debería manejar tareas con diferentes usuarios', async () => {
      const taskIds = ['user1-task', 'user2-task', 'admin-task'];
      const userIds = ['user1', 'user2', 'admin'];
      for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];
        const userId = userIds[i];
        const taskWithUser = new Task(
          taskId,
          'Test Task',
          'Test Description',
          userId,
          TaskStatus.TODO,
          TaskPriority.MEDIUM,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        );
        taskRepository.findById.mockResolvedValue(taskWithUser);
        const result = await getTaskUseCase.execute(taskId);
        expect(result).toEqual(taskWithUser);
        expect(result.userId).toBe(userId);
        expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      }
    });
    it('debería manejar tareas con diferentes fechas de vencimiento', async () => {
      const taskIds = ['task1', 'task2', 'task3'];
      const dueDates = [
        new Date('2024-01-01'),
        new Date('2024-06-15'),
        new Date('2024-12-31'),
      ];
      for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];
        const dueDate = dueDates[i];
        const taskWithDueDate = new Task(
          taskId,
          'Test Task',
          'Test Description',
          'test-user-id',
          TaskStatus.TODO,
          TaskPriority.MEDIUM,
          dueDate,
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        );
        taskRepository.findById.mockResolvedValue(taskWithDueDate);
        const result = await getTaskUseCase.execute(taskId);
        expect(result).toEqual(taskWithDueDate);
        expect(result.dueDate).toEqual(dueDate);
        expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      }
    });
    it('debería manejar errores del repositorio', async () => {
      const taskId = 'test-task-id';
      const repositoryError = new Error('Error en repositorio');
      taskRepository.findById.mockRejectedValue(repositoryError);
      await expect(getTaskUseCase.execute(taskId)).rejects.toThrow(
        'Error en repositorio',
      );
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });
    it('debería manejar errores de base de datos', async () => {
      const taskId = 'test-task-id';
      const databaseError = new Error('Database connection failed');
      taskRepository.findById.mockRejectedValue(databaseError);
      await expect(getTaskUseCase.execute(taskId)).rejects.toThrow(
        'Database connection failed',
      );
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });
    it('debería manejar errores de timeout', async () => {
      const taskId = 'test-task-id';
      const timeoutError = new Error('Request timeout');
      taskRepository.findById.mockRejectedValue(timeoutError);
      await expect(getTaskUseCase.execute(taskId)).rejects.toThrow(
        'Request timeout',
      );
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });
    it('debería validar que el TaskNotFoundException contiene el ID correcto', async () => {
      const taskId = 'specific-task-id';
      taskRepository.findById.mockResolvedValue(null);
      try {
        await getTaskUseCase.execute(taskId);
        fail('Debería haber lanzado TaskNotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(TaskNotFoundException);
        expect(error.message).toContain(taskId);
      }
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    });
    it('debería manejar IDs de tarea con caracteres especiales', async () => {
      const specialTaskIds = [
        'task-with-dashes',
        'task_with_underscores',
        'task.with.dots',
        'task@with#special$chars',
        'task-with-123-numbers',
        'TASK-WITH-UPPERCASE',
      ];
      for (const taskId of specialTaskIds) {
        taskRepository.findById.mockResolvedValue(mockTask);
        const result = await getTaskUseCase.execute(taskId);
        expect(result).toEqual(mockTask);
        expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      }
    });
    it('debería manejar IDs de tarea muy largos', async () => {
      const longTaskId = 'a'.repeat(100);
      taskRepository.findById.mockResolvedValue(mockTask);
      const result = await getTaskUseCase.execute(longTaskId);
      expect(result).toEqual(mockTask);
      expect(taskRepository.findById).toHaveBeenCalledWith(longTaskId);
    });
    it('debería manejar IDs de tarea vacíos', async () => {
      const emptyTaskId = '';
      taskRepository.findById.mockResolvedValue(null);
      await expect(getTaskUseCase.execute(emptyTaskId)).rejects.toThrow(
        TaskNotFoundException,
      );
      expect(taskRepository.findById).toHaveBeenCalledWith(emptyTaskId);
    });
    it('debería manejar IDs de tarea con espacios', async () => {
      const taskIdWithSpaces = ' task with spaces ';
      taskRepository.findById.mockResolvedValue(mockTask);
      const result = await getTaskUseCase.execute(taskIdWithSpaces);
      expect(result).toEqual(mockTask);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskIdWithSpaces);
    });
    it('debería retornar la tarea con todos los campos correctos', async () => {
      const customTask = new Task(
        'custom-task-id',
        'Custom Task',
        'Custom Description',
        'custom-user-id',
        TaskStatus.IN_PROGRESS,
        TaskPriority.HIGH,
        new Date('2024-06-15'),
        new Date('2023-01-01'),
        new Date('2023-01-01'),
      );
      taskRepository.findById.mockResolvedValue(customTask);
      const result = await getTaskUseCase.execute('custom-task-id');
      expect(result).toEqual(customTask);
      expect(result.id).toBe('custom-task-id');
      expect(result.title).toBe('Custom Task');
      expect(result.description).toBe('Custom Description');
      expect(result.userId).toBe('custom-user-id');
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(result.priority).toBe(TaskPriority.HIGH);
      expect(result.dueDate).toEqual(new Date('2024-06-15'));
      expect(result.createdAt).toEqual(new Date('2023-01-01'));
      expect(result.updatedAt).toEqual(new Date('2023-01-01'));
    });
    it('debería manejar tareas con títulos y descripciones largos', async () => {
      const longTitle = 'A'.repeat(200);
      const longDescription = 'B'.repeat(1000);
      const taskWithLongText = new Task(
        'long-text-task',
        longTitle,
        longDescription,
        'user1',
        TaskStatus.TODO,
        TaskPriority.LOW,
        new Date('2024-12-31'),
        new Date('2023-01-01'),
        new Date('2023-01-01'),
      );
      taskRepository.findById.mockResolvedValue(taskWithLongText);
      const result = await getTaskUseCase.execute('long-text-task');
      expect(result).toEqual(taskWithLongText);
      expect(result.title).toBe(longTitle);
      expect(result.description).toBe(longDescription);
    });
    it('debería manejar tareas con caracteres especiales', async () => {
      const specialTitle = 'Tarea con caracteres especiales: áéíóú ñ @#$%^&*()';
      const specialDescription =
        'Descripción con emojis 🚀 📝 ✅ y símbolos <>&"\'';
      const taskWithSpecialChars = new Task(
        'special-chars-task',
        specialTitle,
        specialDescription,
        'user1',
        TaskStatus.TODO,
        TaskPriority.LOW,
        new Date('2024-12-31'),
        new Date('2023-01-01'),
        new Date('2023-01-01'),
      );
      taskRepository.findById.mockResolvedValue(taskWithSpecialChars);
      const result = await getTaskUseCase.execute('special-chars-task');
      expect(result).toEqual(taskWithSpecialChars);
      expect(result.title).toBe(specialTitle);
      expect(result.description).toBe(specialDescription);
    });
  });
});
