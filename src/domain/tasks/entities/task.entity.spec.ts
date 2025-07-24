import { Task, TaskStatus, TaskPriority } from './task.entity';
describe('Task Entity', () => {
  const mockTaskData = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    userId: 'user-1',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };
  describe('Constructor', () => {
    it('should create a task with all properties', () => {
      const task = new Task(
        mockTaskData.id,
        mockTaskData.title,
        mockTaskData.description,
        mockTaskData.userId,
        mockTaskData.status,
        mockTaskData.priority,
        mockTaskData.dueDate,
        mockTaskData.createdAt,
        mockTaskData.updatedAt,
      );
      expect(task.id).toBe(mockTaskData.id);
      expect(task.title).toBe(mockTaskData.title);
      expect(task.description).toBe(mockTaskData.description);
      expect(task.userId).toBe(mockTaskData.userId);
      expect(task.status).toBe(mockTaskData.status);
      expect(task.priority).toBe(mockTaskData.priority);
      expect(task.dueDate).toBe(mockTaskData.dueDate);
      expect(task.createdAt).toBe(mockTaskData.createdAt);
      expect(task.updatedAt).toBe(mockTaskData.updatedAt);
    });
  });
  describe('markAsInProgress', () => {
    it('should return a new task with IN_PROGRESS status', () => {
      const task = new Task(
        mockTaskData.id,
        mockTaskData.title,
        mockTaskData.description,
        mockTaskData.userId,
        TaskStatus.TODO,
        mockTaskData.priority,
        mockTaskData.dueDate,
        mockTaskData.createdAt,
        mockTaskData.updatedAt,
      );
      const inProgressTask = task.markAsInProgress();
      expect(inProgressTask).not.toBe(task);
      expect(inProgressTask.status).toBe(TaskStatus.IN_PROGRESS);
      expect(inProgressTask.id).toBe(task.id);
      expect(inProgressTask.title).toBe(task.title);
      expect(inProgressTask.description).toBe(task.description);
      expect(inProgressTask.userId).toBe(task.userId);
      expect(inProgressTask.priority).toBe(task.priority);
      expect(inProgressTask.dueDate).toBe(task.dueDate);
      expect(inProgressTask.createdAt).toBe(task.createdAt);
      expect(inProgressTask.updatedAt.getTime()).toBeGreaterThan(
        task.updatedAt.getTime(),
      );
    });
  });
  describe('markAsDone', () => {
    it('should return a new task with DONE status', () => {
      const task = new Task(
        mockTaskData.id,
        mockTaskData.title,
        mockTaskData.description,
        mockTaskData.userId,
        TaskStatus.IN_PROGRESS,
        mockTaskData.priority,
        mockTaskData.dueDate,
        mockTaskData.createdAt,
        mockTaskData.updatedAt,
      );
      const doneTask = task.markAsDone();
      expect(doneTask).not.toBe(task);
      expect(doneTask.status).toBe(TaskStatus.DONE);
      expect(doneTask.id).toBe(task.id);
    });
  });
  describe('markAsTodo', () => {
    it('should return a new task with TODO status', () => {
      const task = new Task(
        mockTaskData.id,
        mockTaskData.title,
        mockTaskData.description,
        mockTaskData.userId,
        TaskStatus.IN_PROGRESS,
        mockTaskData.priority,
        mockTaskData.dueDate,
        mockTaskData.createdAt,
        mockTaskData.updatedAt,
      );
      const todoTask = task.markAsTodo();
      expect(todoTask).not.toBe(task);
      expect(todoTask.status).toBe(TaskStatus.TODO);
      expect(todoTask.id).toBe(task.id);
    });
  });
  describe('updateDetails', () => {
    it('should return a new task with updated details', () => {
      const task = new Task(
        mockTaskData.id,
        mockTaskData.title,
        mockTaskData.description,
        mockTaskData.userId,
        TaskStatus.TODO,
        mockTaskData.priority,
        mockTaskData.dueDate,
        mockTaskData.createdAt,
        mockTaskData.updatedAt,
      );
      const newTitle = 'Updated Title';
      const newDescription = 'Updated Description';
      const newPriority = TaskPriority.HIGH;
      const newDueDate = new Date('2024-06-30');
      const updatedTask = task.updateDetails(
        newTitle,
        newDescription,
        newPriority,
        newDueDate,
      );
      expect(updatedTask).not.toBe(task);
      expect(updatedTask.title).toBe(newTitle);
      expect(updatedTask.description).toBe(newDescription);
      expect(updatedTask.priority).toBe(newPriority);
      expect(updatedTask.dueDate).toBe(newDueDate);
      expect(updatedTask.id).toBe(task.id);
      expect(updatedTask.userId).toBe(task.userId);
      expect(updatedTask.status).toBe(task.status);
      expect(updatedTask.createdAt).toBe(task.createdAt);
      expect(updatedTask.updatedAt.getTime()).toBeGreaterThan(
        task.updatedAt.getTime(),
      );
    });
  });
  describe('isOverdue', () => {
    it('should return true for overdue task', () => {
      const pastDate = new Date('2023-01-01');
      const task = new Task(
        mockTaskData.id,
        mockTaskData.title,
        mockTaskData.description,
        mockTaskData.userId,
        TaskStatus.TODO,
        mockTaskData.priority,
        pastDate,
        mockTaskData.createdAt,
        mockTaskData.updatedAt,
      );
      expect(task.isOverdue()).toBe(true);
    });
    it('should return false for future task', () => {
      const futureDate = new Date('2025-12-31');
      const task = new Task(
        mockTaskData.id,
        mockTaskData.title,
        mockTaskData.description,
        mockTaskData.userId,
        TaskStatus.TODO,
        mockTaskData.priority,
        futureDate,
        mockTaskData.createdAt,
        mockTaskData.updatedAt,
      );
      expect(task.isOverdue()).toBe(false);
    });
    it('should return false for done task even if overdue', () => {
      const pastDate = new Date('2023-01-01');
      const task = new Task(
        mockTaskData.id,
        mockTaskData.title,
        mockTaskData.description,
        mockTaskData.userId,
        TaskStatus.DONE,
        mockTaskData.priority,
        pastDate,
        mockTaskData.createdAt,
        mockTaskData.updatedAt,
      );
      expect(task.isOverdue()).toBe(false);
    });
  });
  describe('isDone', () => {
    it('should return true for done task', () => {
      const task = new Task(
        mockTaskData.id,
        mockTaskData.title,
        mockTaskData.description,
        mockTaskData.userId,
        TaskStatus.DONE,
        mockTaskData.priority,
        mockTaskData.dueDate,
        mockTaskData.createdAt,
        mockTaskData.updatedAt,
      );
      expect(task.isDone()).toBe(true);
    });
    it('should return false for non-done task', () => {
      const task = new Task(
        mockTaskData.id,
        mockTaskData.title,
        mockTaskData.description,
        mockTaskData.userId,
        TaskStatus.TODO,
        mockTaskData.priority,
        mockTaskData.dueDate,
        mockTaskData.createdAt,
        mockTaskData.updatedAt,
      );
      expect(task.isDone()).toBe(false);
    });
  });
});
