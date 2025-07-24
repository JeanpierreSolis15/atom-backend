import { Test, TestingModule } from '@nestjs/testing';
import { CreateTaskUseCase } from './create-task.use-case';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
import { TaskFactory } from '@domain/tasks/factories/task.factory';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '@domain/tasks/entities/task.entity';
import { CreateTaskDto } from '../dtos/create-task.dto';
describe('CreateTaskUseCase', () => {
  let createTaskUseCase: CreateTaskUseCase;
  let taskRepository: jest.Mocked<ITaskRepository>;
  let taskFactory: TaskFactory;
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
  const mockCreateTaskDto: CreateTaskDto = {
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: '2024-12-31T23:59:59.000Z',
  };
  const mockUserId = 'test-user-id';
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTaskUseCase,
        {
          provide: 'ITaskRepository',
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: TaskFactory,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();
    createTaskUseCase = module.get<CreateTaskUseCase>(CreateTaskUseCase);
    taskRepository = module.get('ITaskRepository');
    taskFactory = module.get<TaskFactory>(TaskFactory);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('execute', () => {
    it('debería crear una tarea exitosamente', async () => {
      (taskFactory.create as jest.Mock).mockReturnValue(mockTask);
      taskRepository.save.mockResolvedValue(mockTask);
      const result = await createTaskUseCase.execute(
        mockCreateTaskDto,
        mockUserId,
      );
      expect(result).toEqual(mockTask);
      expect(taskFactory.create).toHaveBeenCalledWith(
        mockCreateTaskDto.title,
        mockCreateTaskDto.description,
        mockUserId,
        mockCreateTaskDto.priority,
        new Date(mockCreateTaskDto.dueDate),
        mockCreateTaskDto.status,
      );
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
    });
    it('debería crear una tarea con valores por defecto cuando no se proporcionan status y priority', async () => {
      const dtoWithoutDefaults = {
        title: 'Test Task',
        description: 'Test Description',
        dueDate: '2024-12-31T23:59:59.000Z',
      };
      (taskFactory.create as jest.Mock).mockReturnValue(mockTask);
      taskRepository.save.mockResolvedValue(mockTask);
      const result = await createTaskUseCase.execute(
        dtoWithoutDefaults as CreateTaskDto,
        mockUserId,
      );
      expect(result).toEqual(mockTask);
      expect(taskFactory.create).toHaveBeenCalledWith(
        dtoWithoutDefaults.title,
        dtoWithoutDefaults.description,
        mockUserId,
        undefined,
        new Date(dtoWithoutDefaults.dueDate),
        undefined,
      );
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
    });
    it('debería manejar diferentes estados de tarea', async () => {
      const testCases = [
        { status: TaskStatus.TODO, priority: TaskPriority.LOW },
        { status: TaskStatus.IN_PROGRESS, priority: TaskPriority.MEDIUM },
        { status: TaskStatus.DONE, priority: TaskPriority.HIGH },
        { status: TaskStatus.TODO, priority: TaskPriority.URGENT },
      ];
      for (const testCase of testCases) {
        const dto = { ...mockCreateTaskDto, ...testCase };
        (taskFactory.create as jest.Mock).mockReturnValue(mockTask);
        taskRepository.save.mockResolvedValue(mockTask);
        const result = await createTaskUseCase.execute(dto, mockUserId);
        expect(result).toEqual(mockTask);
        expect(taskFactory.create).toHaveBeenCalledWith(
          dto.title,
          dto.description,
          mockUserId,
          dto.priority,
          new Date(dto.dueDate),
          dto.status,
        );
      }
    });
    it('debería manejar diferentes fechas de vencimiento', async () => {
      const testDates = [
        '2024-01-01T00:00:00.000Z',
        '2024-06-15T12:30:45.000Z',
        '2024-12-31T23:59:59.000Z',
        '2025-03-20T08:15:30.000Z',
      ];
      for (const dueDate of testDates) {
        const dto = { ...mockCreateTaskDto, dueDate };
        (taskFactory.create as jest.Mock).mockReturnValue(mockTask);
        taskRepository.save.mockResolvedValue(mockTask);
        const result = await createTaskUseCase.execute(dto, mockUserId);
        expect(result).toEqual(mockTask);
        expect(taskFactory.create).toHaveBeenCalledWith(
          dto.title,
          dto.description,
          mockUserId,
          dto.priority,
          new Date(dueDate),
          dto.status,
        );
      }
    });
    it('debería manejar errores del TaskFactory', async () => {
      const factoryError = new Error('Error en TaskFactory');
      (taskFactory.create as jest.Mock).mockImplementation(() => {
        throw factoryError;
      });
      await expect(
        createTaskUseCase.execute(mockCreateTaskDto, mockUserId),
      ).rejects.toThrow('Error en TaskFactory');
      expect(taskFactory.create).toHaveBeenCalledWith(
        mockCreateTaskDto.title,
        mockCreateTaskDto.description,
        mockUserId,
        mockCreateTaskDto.priority,
        new Date(mockCreateTaskDto.dueDate),
        mockCreateTaskDto.status,
      );
      expect(taskRepository.save).not.toHaveBeenCalled();
    });
    it('debería manejar errores del repositorio', async () => {
      const repositoryError = new Error('Error en repositorio');
      (taskFactory.create as jest.Mock).mockReturnValue(mockTask);
      taskRepository.save.mockRejectedValue(repositoryError);
      await expect(
        createTaskUseCase.execute(mockCreateTaskDto, mockUserId),
      ).rejects.toThrow('Error en repositorio');
      expect(taskFactory.create).toHaveBeenCalledWith(
        mockCreateTaskDto.title,
        mockCreateTaskDto.description,
        mockUserId,
        mockCreateTaskDto.priority,
        new Date(mockCreateTaskDto.dueDate),
        mockCreateTaskDto.status,
      );
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
    });
    it('debería validar que el userId se pasa correctamente al factory', async () => {
      const differentUserIds = ['user1', 'user2', 'user3', 'admin-user'];
      for (const userId of differentUserIds) {
        (taskFactory.create as jest.Mock).mockReturnValue(mockTask);
        taskRepository.save.mockResolvedValue(mockTask);
        await createTaskUseCase.execute(mockCreateTaskDto, userId);
        expect(taskFactory.create).toHaveBeenCalledWith(
          mockCreateTaskDto.title,
          mockCreateTaskDto.description,
          userId,
          mockCreateTaskDto.priority,
          new Date(mockCreateTaskDto.dueDate),
          mockCreateTaskDto.status,
        );
      }
    });
    it('debería manejar títulos y descripciones largos', async () => {
      const longTitle = 'A'.repeat(100);
      const longDescription = 'B'.repeat(500);
      const dto = {
        ...mockCreateTaskDto,
        title: longTitle,
        description: longDescription,
      };
      (taskFactory.create as jest.Mock).mockReturnValue(mockTask);
      taskRepository.save.mockResolvedValue(mockTask);
      const result = await createTaskUseCase.execute(dto, mockUserId);
      expect(result).toEqual(mockTask);
      expect(taskFactory.create).toHaveBeenCalledWith(
        longTitle,
        longDescription,
        mockUserId,
        mockCreateTaskDto.priority,
        new Date(mockCreateTaskDto.dueDate),
        mockCreateTaskDto.status,
      );
    });
    it('debería manejar títulos y descripciones con caracteres especiales', async () => {
      const specialTitle = 'Tarea con caracteres especiales: áéíóú ñ @#$%^&*()';
      const specialDescription =
        'Descripción con emojis 🚀 📝 ✅ y símbolos <>&"\'';
      const dto = {
        ...mockCreateTaskDto,
        title: specialTitle,
        description: specialDescription,
      };
      (taskFactory.create as jest.Mock).mockReturnValue(mockTask);
      taskRepository.save.mockResolvedValue(mockTask);
      const result = await createTaskUseCase.execute(dto, mockUserId);
      expect(result).toEqual(mockTask);
      expect(taskFactory.create).toHaveBeenCalledWith(
        specialTitle,
        specialDescription,
        mockUserId,
        mockCreateTaskDto.priority,
        new Date(mockCreateTaskDto.dueDate),
        mockCreateTaskDto.status,
      );
    });
    it('debería retornar la tarea creada con todos los campos correctos', async () => {
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
      (taskFactory.create as jest.Mock).mockReturnValue(customTask);
      taskRepository.save.mockResolvedValue(customTask);
      const result = await createTaskUseCase.execute(
        mockCreateTaskDto,
        mockUserId,
      );
      expect(result).toEqual(customTask);
      expect(result.id).toBe('custom-task-id');
      expect(result.title).toBe('Custom Task');
      expect(result.description).toBe('Custom Description');
      expect(result.userId).toBe('custom-user-id');
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(result.priority).toBe(TaskPriority.HIGH);
      expect(result.dueDate).toEqual(new Date('2024-06-15'));
    });
  });
});
