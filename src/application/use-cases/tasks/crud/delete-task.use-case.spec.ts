import { Test, TestingModule } from '@nestjs/testing';
import { DeleteTaskUseCase } from './delete-task.use-case';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
import { TaskNotFoundException } from '@domain/tasks/exceptions/task-not-found.exception';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '@domain/tasks/entities/task.entity';
describe('DeleteTaskUseCase', () => {
  let deleteTaskUseCase: DeleteTaskUseCase;
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
        DeleteTaskUseCase,
        {
          provide: 'ITaskRepository',
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();
    deleteTaskUseCase = module.get<DeleteTaskUseCase>(DeleteTaskUseCase);
    taskRepository = module.get('ITaskRepository');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('execute', () => {
    it('debería eliminar una tarea exitosamente', async () => {
      const taskId = 'test-task-id';
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.delete.mockResolvedValue(undefined);
      await deleteTaskUseCase.execute(taskId);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.delete).toHaveBeenCalledWith(taskId);
    });
    it('debería lanzar TaskNotFoundException cuando la tarea no existe', async () => {
      const taskId = 'non-existent-task-id';
      taskRepository.findById.mockResolvedValue(null);
      await expect(deleteTaskUseCase.execute(taskId)).rejects.toThrow(
        TaskNotFoundException,
      );
      await expect(deleteTaskUseCase.execute(taskId)).rejects.toThrow(taskId);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.delete).not.toHaveBeenCalled();
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
        taskRepository.delete.mockResolvedValue(undefined);
        await deleteTaskUseCase.execute(taskId);
        expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
        expect(taskRepository.delete).toHaveBeenCalledWith(taskId);
      }
    });
    it('debería manejar errores del repositorio al buscar la tarea', async () => {
      const taskId = 'test-task-id';
      const repositoryError = new Error('Error en repositorio al buscar');
      taskRepository.findById.mockRejectedValue(repositoryError);
      await expect(deleteTaskUseCase.execute(taskId)).rejects.toThrow(
        'Error en repositorio al buscar',
      );
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.delete).not.toHaveBeenCalled();
    });
    it('debería manejar errores del repositorio al eliminar la tarea', async () => {
      const taskId = 'test-task-id';
      const deleteError = new Error('Error en repositorio al eliminar');
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.delete.mockRejectedValue(deleteError);
      await expect(deleteTaskUseCase.execute(taskId)).rejects.toThrow(
        'Error en repositorio al eliminar',
      );
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.delete).toHaveBeenCalledWith(taskId);
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
        taskRepository.delete.mockResolvedValue(undefined);
        await deleteTaskUseCase.execute(taskId);
        expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
        expect(taskRepository.delete).toHaveBeenCalledWith(taskId);
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
        taskRepository.delete.mockResolvedValue(undefined);
        await deleteTaskUseCase.execute(taskId);
        expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
        expect(taskRepository.delete).toHaveBeenCalledWith(taskId);
      }
    });
    it('debería validar que el TaskNotFoundException contiene el ID correcto', async () => {
      const taskId = 'specific-task-id';
      taskRepository.findById.mockResolvedValue(null);
      try {
        await deleteTaskUseCase.execute(taskId);
        fail('Debería haber lanzado TaskNotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(TaskNotFoundException);
        expect(error.message).toContain(taskId);
      }
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(taskRepository.delete).not.toHaveBeenCalled();
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
        taskRepository.delete.mockResolvedValue(undefined);
        await deleteTaskUseCase.execute(taskId);
        expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
        expect(taskRepository.delete).toHaveBeenCalledWith(taskId);
      }
    });
    it('debería manejar IDs de tarea muy largos', async () => {
      const longTaskId = 'a'.repeat(100);
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.delete.mockResolvedValue(undefined);
      await deleteTaskUseCase.execute(longTaskId);
      expect(taskRepository.findById).toHaveBeenCalledWith(longTaskId);
      expect(taskRepository.delete).toHaveBeenCalledWith(longTaskId);
    });
    it('debería manejar IDs de tarea vacíos', async () => {
      const emptyTaskId = '';
      taskRepository.findById.mockResolvedValue(null);
      await expect(deleteTaskUseCase.execute(emptyTaskId)).rejects.toThrow(
        TaskNotFoundException,
      );
      expect(taskRepository.findById).toHaveBeenCalledWith(emptyTaskId);
      expect(taskRepository.delete).not.toHaveBeenCalled();
    });
    it('debería manejar IDs de tarea con espacios', async () => {
      const taskIdWithSpaces = ' task with spaces ';
      taskRepository.findById.mockResolvedValue(mockTask);
      taskRepository.delete.mockResolvedValue(undefined);
      await deleteTaskUseCase.execute(taskIdWithSpaces);
      expect(taskRepository.findById).toHaveBeenCalledWith(taskIdWithSpaces);
      expect(taskRepository.delete).toHaveBeenCalledWith(taskIdWithSpaces);
    });
  });
});
