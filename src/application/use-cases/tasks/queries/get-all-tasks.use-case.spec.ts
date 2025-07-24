import { Test, TestingModule } from '@nestjs/testing';
import { GetAllTasksUseCase } from './get-all-tasks.use-case';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '@domain/tasks/entities/task.entity';
describe('GetAllTasksUseCase', () => {
  let getAllTasksUseCase: GetAllTasksUseCase;
  let taskRepository: jest.Mocked<ITaskRepository>;
  const mockTasks = [
    new Task(
      'task1',
      'Task 1',
      'Description 1',
      'user1',
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
      'user2',
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
      'user3',
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
        GetAllTasksUseCase,
        {
          provide: 'ITaskRepository',
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();
    getAllTasksUseCase = module.get<GetAllTasksUseCase>(GetAllTasksUseCase);
    taskRepository = module.get('ITaskRepository');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('execute', () => {
    it('debería obtener todas las tareas exitosamente', async () => {
      taskRepository.findAll.mockResolvedValue(mockTasks);
      const result = await getAllTasksUseCase.execute();
      expect(result).toEqual(mockTasks);
      expect(result).toHaveLength(3);
      expect(taskRepository.findAll).toHaveBeenCalledTimes(1);
    });
    it('debería retornar una lista vacía cuando no hay tareas', async () => {
      taskRepository.findAll.mockResolvedValue([]);
      const result = await getAllTasksUseCase.execute();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(taskRepository.findAll).toHaveBeenCalledTimes(1);
    });
    it('debería manejar una sola tarea', async () => {
      const singleTask = [mockTasks[0]];
      taskRepository.findAll.mockResolvedValue(singleTask);
      const result = await getAllTasksUseCase.execute();
      expect(result).toEqual(singleTask);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task1');
      expect(taskRepository.findAll).toHaveBeenCalledTimes(1);
    });
    it('debería manejar muchas tareas', async () => {
      const manyTasks = Array.from(
        { length: 100 },
        (_, index) =>
          new Task(
            `task${index}`,
            `Task ${index}`,
            `Description ${index}`,
            `user${index}`,
            TaskStatus.TODO,
            TaskPriority.MEDIUM,
            new Date('2024-12-31'),
            new Date('2023-01-01'),
            new Date('2023-01-01'),
          ),
      );
      taskRepository.findAll.mockResolvedValue(manyTasks);
      const result = await getAllTasksUseCase.execute();
      expect(result).toEqual(manyTasks);
      expect(result).toHaveLength(100);
      expect(taskRepository.findAll).toHaveBeenCalledTimes(1);
    });
    it('debería manejar tareas con diferentes estados', async () => {
      const tasksWithDifferentStates = [
        new Task(
          'todo-task',
          'Todo Task',
          'Description',
          'user1',
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
          'user2',
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
          'user3',
          TaskStatus.DONE,
          TaskPriority.HIGH,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
      ];
      taskRepository.findAll.mockResolvedValue(tasksWithDifferentStates);
      const result = await getAllTasksUseCase.execute();
      expect(result).toEqual(tasksWithDifferentStates);
      expect(result).toHaveLength(3);
      expect(result[0].status).toBe(TaskStatus.TODO);
      expect(result[1].status).toBe(TaskStatus.IN_PROGRESS);
      expect(result[2].status).toBe(TaskStatus.DONE);
    });
    it('debería manejar tareas con diferentes prioridades', async () => {
      const tasksWithDifferentPriorities = [
        new Task(
          'low-task',
          'Low Task',
          'Description',
          'user1',
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
          'user2',
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
          'user3',
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
          'user4',
          TaskStatus.TODO,
          TaskPriority.URGENT,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
      ];
      taskRepository.findAll.mockResolvedValue(tasksWithDifferentPriorities);
      const result = await getAllTasksUseCase.execute();
      expect(result).toEqual(tasksWithDifferentPriorities);
      expect(result).toHaveLength(4);
      expect(result[0].priority).toBe(TaskPriority.LOW);
      expect(result[1].priority).toBe(TaskPriority.MEDIUM);
      expect(result[2].priority).toBe(TaskPriority.HIGH);
      expect(result[3].priority).toBe(TaskPriority.URGENT);
    });
    it('debería manejar tareas con diferentes usuarios', async () => {
      const tasksWithDifferentUsers = [
        new Task(
          'task1',
          'Task 1',
          'Description',
          'user1',
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
          'user2',
          TaskStatus.TODO,
          TaskPriority.LOW,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
        new Task(
          'task3',
          'Task 3',
          'Description',
          'admin',
          TaskStatus.TODO,
          TaskPriority.LOW,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
      ];
      taskRepository.findAll.mockResolvedValue(tasksWithDifferentUsers);
      const result = await getAllTasksUseCase.execute();
      expect(result).toEqual(tasksWithDifferentUsers);
      expect(result).toHaveLength(3);
      expect(result[0].userId).toBe('user1');
      expect(result[1].userId).toBe('user2');
      expect(result[2].userId).toBe('admin');
    });
    it('debería manejar tareas con fechas de vencimiento diferentes', async () => {
      const tasksWithDifferentDueDates = [
        new Task(
          'task1',
          'Task 1',
          'Description',
          'user1',
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
          'user2',
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
          'user3',
          TaskStatus.TODO,
          TaskPriority.LOW,
          new Date('2024-12-31'),
          new Date('2023-01-01'),
          new Date('2023-01-01'),
        ),
      ];
      taskRepository.findAll.mockResolvedValue(tasksWithDifferentDueDates);
      const result = await getAllTasksUseCase.execute();
      expect(result).toEqual(tasksWithDifferentDueDates);
      expect(result).toHaveLength(3);
      expect(result[0].dueDate).toEqual(new Date('2024-01-01'));
      expect(result[1].dueDate).toEqual(new Date('2024-06-15'));
      expect(result[2].dueDate).toEqual(new Date('2024-12-31'));
    });
    it('debería manejar errores del repositorio', async () => {
      const repositoryError = new Error('Error en repositorio');
      taskRepository.findAll.mockRejectedValue(repositoryError);
      await expect(getAllTasksUseCase.execute()).rejects.toThrow(
        'Error en repositorio',
      );
      expect(taskRepository.findAll).toHaveBeenCalledTimes(1);
    });
    it('debería manejar errores de base de datos', async () => {
      const databaseError = new Error('Database connection failed');
      taskRepository.findAll.mockRejectedValue(databaseError);
      await expect(getAllTasksUseCase.execute()).rejects.toThrow(
        'Database connection failed',
      );
      expect(taskRepository.findAll).toHaveBeenCalledTimes(1);
    });
    it('debería manejar errores de timeout', async () => {
      const timeoutError = new Error('Request timeout');
      taskRepository.findAll.mockRejectedValue(timeoutError);
      await expect(getAllTasksUseCase.execute()).rejects.toThrow(
        'Request timeout',
      );
      expect(taskRepository.findAll).toHaveBeenCalledTimes(1);
    });
    it('debería retornar tareas con todos los campos correctos', async () => {
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
      taskRepository.findAll.mockResolvedValue([customTask]);
      const result = await getAllTasksUseCase.execute();
      expect(result).toHaveLength(1);
      const task = result[0];
      expect(task.id).toBe('custom-task-id');
      expect(task.title).toBe('Custom Task');
      expect(task.description).toBe('Custom Description');
      expect(task.userId).toBe('custom-user-id');
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
      expect(task.priority).toBe(TaskPriority.HIGH);
      expect(task.dueDate).toEqual(new Date('2024-06-15'));
      expect(task.createdAt).toEqual(new Date('2023-01-01'));
      expect(task.updatedAt).toEqual(new Date('2023-01-01'));
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
      taskRepository.findAll.mockResolvedValue([taskWithLongText]);
      const result = await getAllTasksUseCase.execute();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe(longTitle);
      expect(result[0].description).toBe(longDescription);
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
      taskRepository.findAll.mockResolvedValue([taskWithSpecialChars]);
      const result = await getAllTasksUseCase.execute();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe(specialTitle);
      expect(result[0].description).toBe(specialDescription);
    });
  });
});
