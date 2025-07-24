import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTaskUseCase } from './update-task.use-case';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
import { TaskNotFoundException } from '@domain/tasks/exceptions/task-not-found.exception';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '@domain/tasks/entities/task.entity';
import { UpdateTaskDto } from '../dtos/update-task.dto';
describe('UpdateTaskUseCase', () => {
  let updateTaskUseCase: UpdateTaskUseCase;
  let taskRepository: jest.Mocked<ITaskRepository>;
  const mockTask = new Task(
    'test-task-id',
    'Original Title',
    'Original Description',
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
        UpdateTaskUseCase,
        {
          provide: 'ITaskRepository',
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();
    updateTaskUseCase = module.get<UpdateTaskUseCase>(UpdateTaskUseCase);
    taskRepository = module.get('ITaskRepository');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('execute', () => {
    it('debería actualizar una tarea exitosamente con todos los campos', async () => {
      const taskId = 'test-task-id';
      const updateDto: UpdateTaskDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: '2024-06-15T00:00:00.000Z',
      };
      const updatedTask = new Task(
        taskId,
        updateDto.title!,
        updateDto.description!,
        mockTask.userId,
        updateDto.status!,
        updateDto.priority!,
        new Date(updateDto.dueDate!),
        mockTask.createdAt,
        new Date(),
      );
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue(updatedTask);
      const result = await updateTaskUseCase.execute(taskId, updateDto);
      expect(result).toEqual(updatedTask);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updatedTask,
          updatedAt: expect.any(Date),
        }),
      );
    });
    it('debería actualizar solo el título de una tarea', async () => {
      const taskId = 'test-task-id';
      const updateDto: UpdateTaskDto = {
        title: 'Updated Title',
      };
      const updatedTask = new Task(
        taskId,
        updateDto.title!,
        mockTask.description,
        mockTask.userId,
        mockTask.status,
        mockTask.priority,
        mockTask.dueDate,
        mockTask.createdAt,
        new Date(),
      );
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue(updatedTask);
      const result = await updateTaskUseCase.execute(taskId, updateDto);
      expect(result).toEqual(updatedTask);
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe(mockTask.description);
      expect(result.status).toBe(mockTask.status);
      expect(result.priority).toBe(mockTask.priority);
    });
    it('debería actualizar solo la descripción de una tarea', async () => {
      const taskId = 'test-task-id';
      const updateDto: UpdateTaskDto = {
        description: 'Updated Description',
      };
      const updatedTask = new Task(
        taskId,
        mockTask.title,
        updateDto.description!,
        mockTask.userId,
        mockTask.status,
        mockTask.priority,
        mockTask.dueDate,
        mockTask.createdAt,
        new Date(),
      );
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue(updatedTask);
      const result = await updateTaskUseCase.execute(taskId, updateDto);
      expect(result).toEqual(updatedTask);
      expect(result.title).toBe(mockTask.title);
      expect(result.description).toBe('Updated Description');
    });
    it('debería actualizar solo el estado de una tarea', async () => {
      const taskId = 'test-task-id';
      const updateDto: UpdateTaskDto = {
        status: TaskStatus.DONE,
      };
      const updatedTask = new Task(
        taskId,
        mockTask.title,
        mockTask.description,
        mockTask.userId,
        updateDto.status!,
        mockTask.priority,
        mockTask.dueDate,
        mockTask.createdAt,
        new Date(),
      );
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue(updatedTask);
      const result = await updateTaskUseCase.execute(taskId, updateDto);
      expect(result).toEqual(updatedTask);
      expect(result.status).toBe(TaskStatus.DONE);
    });
    it('debería actualizar solo la prioridad de una tarea', async () => {
      const taskId = 'test-task-id';
      const updateDto: UpdateTaskDto = {
        priority: TaskPriority.URGENT,
      };
      const updatedTask = new Task(
        taskId,
        mockTask.title,
        mockTask.description,
        mockTask.userId,
        mockTask.status,
        updateDto.priority!,
        mockTask.dueDate,
        mockTask.createdAt,
        new Date(),
      );
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue(updatedTask);
      const result = await updateTaskUseCase.execute(taskId, updateDto);
      expect(result).toEqual(updatedTask);
      expect(result.priority).toBe(TaskPriority.URGENT);
    });
    it('debería actualizar solo la fecha de vencimiento de una tarea', async () => {
      const taskId = 'test-task-id';
      const updateDto: UpdateTaskDto = {
        dueDate: '2024-06-15T00:00:00.000Z',
      };
      const updatedTask = new Task(
        taskId,
        mockTask.title,
        mockTask.description,
        mockTask.userId,
        mockTask.status,
        mockTask.priority,
        new Date(updateDto.dueDate!),
        mockTask.createdAt,
        new Date(),
      );
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue(updatedTask);
      const result = await updateTaskUseCase.execute(taskId, updateDto);
      expect(result).toEqual(updatedTask);
      expect(result.dueDate).toEqual(new Date('2024-06-15T00:00:00.000Z'));
    });
    it('debería lanzar TaskNotFoundException cuando la tarea no existe', async () => {
      const taskId = 'non-existent-task-id';
      const updateDto: UpdateTaskDto = {
        title: 'Updated Title',
      };
      taskRepository.findById.mockResolvedValue(null);
      await expect(
        updateTaskUseCase.execute(taskId, updateDto),
      ).rejects.toThrow(TaskNotFoundException);
      await expect(
        updateTaskUseCase.execute(taskId, updateDto),
      ).rejects.toThrow(taskId);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.update).not.toHaveBeenCalled();
    });
    it('debería manejar diferentes estados de tarea', async () => {
      const taskId = 'test-task-id';
      const taskStates = [
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.DONE,
      ];
      for (const status of taskStates) {
        const updateDto: UpdateTaskDto = { status };
        const updatedTask = new Task(
          taskId,
          mockTask.title,
          mockTask.description,
          mockTask.userId,
          status,
          mockTask.priority,
          mockTask.dueDate,
          mockTask.createdAt,
          new Date(),
        );
        taskRepository.findById.mockResolvedValue(mockTask);
        taskRepository.update.mockResolvedValue(updatedTask);
        const result = await updateTaskUseCase.execute(taskId, updateDto);
        expect(result.status).toBe(status);
      }
    });
    it('debería manejar diferentes prioridades de tarea', async () => {
      const taskId = 'test-task-id';
      const taskPriorities = [
        TaskPriority.LOW,
        TaskPriority.MEDIUM,
        TaskPriority.HIGH,
        TaskPriority.URGENT,
      ];
      for (const priority of taskPriorities) {
        const updateDto: UpdateTaskDto = { priority };
        const updatedTask = new Task(
          taskId,
          mockTask.title,
          mockTask.description,
          mockTask.userId,
          mockTask.status,
          priority,
          mockTask.dueDate,
          mockTask.createdAt,
          new Date(),
        );
        taskRepository.findById.mockResolvedValue(mockTask);
        taskRepository.update.mockResolvedValue(updatedTask);
        const result = await updateTaskUseCase.execute(taskId, updateDto);
        expect(result.priority).toBe(priority);
      }
    });
    it('debería manejar diferentes fechas de vencimiento', async () => {
      const taskId = 'test-task-id';
      const dueDates = [
        '2024-01-01T00:00:00.000Z',
        '2024-06-15T12:30:45.000Z',
        '2024-12-31T23:59:59.000Z',
      ];
      for (const dueDate of dueDates) {
        const updateDto: UpdateTaskDto = { dueDate };
        const updatedTask = new Task(
          taskId,
          mockTask.title,
          mockTask.description,
          mockTask.userId,
          mockTask.status,
          mockTask.priority,
          new Date(dueDate),
          mockTask.createdAt,
          new Date(),
        );
        taskRepository.findById.mockResolvedValue(mockTask);
        taskRepository.update.mockResolvedValue(updatedTask);
        const result = await updateTaskUseCase.execute(taskId, updateDto);
        expect(result.dueDate).toEqual(new Date(dueDate));
      }
    });
    it('debería manejar errores del repositorio al buscar la tarea', async () => {
      const taskId = 'test-task-id';
      const updateDto: UpdateTaskDto = { title: 'Updated Title' };
      const repositoryError = new Error('Error en repositorio al buscar');
      taskRepository.findById.mockRejectedValue(repositoryError);
      await expect(
        updateTaskUseCase.execute(taskId, updateDto),
      ).rejects.toThrow('Error en repositorio al buscar');
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.update).not.toHaveBeenCalled();
    });
    it('debería manejar errores del repositorio al actualizar la tarea', async () => {
      const taskId = 'test-task-id';
      const updateDto: UpdateTaskDto = { title: 'Updated Title' };
      const updateError = new Error('Error en repositorio al actualizar');
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockRejectedValue(updateError);
      await expect(
        updateTaskUseCase.execute(taskId, updateDto),
      ).rejects.toThrow('Error en repositorio al actualizar');
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.update).toHaveBeenCalled();
    });
    it('debería manejar DTOs vacíos sin actualizar la tarea', async () => {
      const taskId = 'test-task-id';
      const updateDto: UpdateTaskDto = {};
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue(mockTask);
      const result = await updateTaskUseCase.execute(taskId, updateDto);
      expect(result).toEqual(mockTask);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockTask,
          updatedAt: expect.any(Date),
        }),
      );
    });
    it('debería manejar títulos y descripciones largos', async () => {
      const taskId = 'test-task-id';
      const longTitle = 'A'.repeat(200);
      const longDescription = 'B'.repeat(1000);
      const updateDto: UpdateTaskDto = {
        title: longTitle,
        description: longDescription,
      };
      const updatedTask = new Task(
        taskId,
        longTitle,
        longDescription,
        mockTask.userId,
        mockTask.status,
        mockTask.priority,
        mockTask.dueDate,
        mockTask.createdAt,
        new Date(),
      );
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue(updatedTask);
      const result = await updateTaskUseCase.execute(taskId, updateDto);
      expect(result.title).toBe(longTitle);
      expect(result.description).toBe(longDescription);
    });
    it('debería manejar títulos y descripciones con caracteres especiales', async () => {
      const taskId = 'test-task-id';
      const specialTitle = 'Tarea con caracteres especiales: áéíóú ñ @#$%^&*()';
      const specialDescription =
        'Descripción con emojis 🚀 📝 ✅ y símbolos <>&"\'';
      const updateDto: UpdateTaskDto = {
        title: specialTitle,
        description: specialDescription,
      };
      const updatedTask = new Task(
        taskId,
        specialTitle,
        specialDescription,
        mockTask.userId,
        mockTask.status,
        mockTask.priority,
        mockTask.dueDate,
        mockTask.createdAt,
        new Date(),
      );
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue(updatedTask);
      const result = await updateTaskUseCase.execute(taskId, updateDto);
      expect(result.title).toBe(specialTitle);
      expect(result.description).toBe(specialDescription);
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
        const updateDto: UpdateTaskDto = { title: 'Updated Title' };
        const updatedTask = new Task(
          taskId,
          'Updated Title',
          mockTask.description,
          mockTask.userId,
          mockTask.status,
          mockTask.priority,
          mockTask.dueDate,
          mockTask.createdAt,
          new Date(),
        );
        taskRepository.findById.mockResolvedValue(mockTask);
        taskRepository.update.mockResolvedValue(updatedTask);
        const result = await updateTaskUseCase.execute(taskId, updateDto);
        expect(result).toEqual(updatedTask);
        expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      }
    });
    it('debería validar que el TaskNotFoundException contiene el ID correcto', async () => {
      const taskId = 'specific-task-id';
      const updateDto: UpdateTaskDto = { title: 'Updated Title' };
      taskRepository.findById.mockResolvedValue(null);
      try {
        await updateTaskUseCase.execute(taskId, updateDto);
        fail('Debería haber lanzado TaskNotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(TaskNotFoundException);
        expect(error.message).toContain(taskId);
      }
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.update).not.toHaveBeenCalled();
    });
    it('debería actualizar múltiples campos en una sola operación', async () => {
      const taskId = 'test-task-id';
      const updateDto: UpdateTaskDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: '2024-06-15T00:00:00.000Z',
      };
      const updatedTask = new Task(
        taskId,
        updateDto.title!,
        updateDto.description!,
        mockTask.userId,
        updateDto.status!,
        updateDto.priority!,
        new Date(updateDto.dueDate!),
        mockTask.createdAt,
        new Date(),
      );
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue(updatedTask);
      const result = await updateTaskUseCase.execute(taskId, updateDto);
      expect(result).toEqual(updatedTask);
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated Description');
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(result.priority).toBe(TaskPriority.HIGH);
      expect(result.dueDate).toEqual(new Date('2024-06-15T00:00:00.000Z'));
    });
    it('debería mantener los valores originales cuando no se proporcionan en el DTO', async () => {
      const taskId = 'test-task-id';
      const updateDto: UpdateTaskDto = {
        title: 'Updated Title',
      };
      const updatedTask = new Task(
        taskId,
        updateDto.title!,
        mockTask.description,
        mockTask.userId,
        mockTask.status,
        mockTask.priority,
        mockTask.dueDate,
        mockTask.createdAt,
        new Date(),
      );
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.update.mockResolvedValue(updatedTask);
      const result = await updateTaskUseCase.execute(taskId, updateDto);
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe(mockTask.description);
      expect(result.status).toBe(mockTask.status);
      expect(result.priority).toBe(mockTask.priority);
      expect(result.dueDate).toEqual(mockTask.dueDate);
    });
  });
});
