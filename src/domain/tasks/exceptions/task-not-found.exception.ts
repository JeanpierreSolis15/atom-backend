export class TaskNotFoundException extends Error {
  constructor(taskId: string) {
    super(`Tarea con ID ${taskId} no encontrada`);
    this.name = 'TaskNotFoundException';
  }
}
