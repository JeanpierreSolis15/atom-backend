import { Injectable, Inject } from '@nestjs/common';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
import { TaskNotFoundException } from '@domain/tasks/exceptions/task-not-found.exception';
@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}
  async execute(id: string): Promise<void> {
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      throw new TaskNotFoundException(id);
    }
    await this.taskRepository.delete(id);
  }
}
