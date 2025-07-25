import { HttpException, HttpStatus } from '@nestjs/common';

export class TaskNotFoundException extends HttpException {
  constructor(taskId: string) {
    super(
      `Tarea con ID ${taskId} no encontrada`,
      HttpStatus.NOT_FOUND,
    );
    this.name = 'TaskNotFoundException';
  }
}
