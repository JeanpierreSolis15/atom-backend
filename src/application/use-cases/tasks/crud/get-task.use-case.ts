import { Injectable, Inject } from '@nestjs/common';
import { Task } from '@domain/tasks/entities/task.entity';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
import { TaskNotFoundException } from '@domain/tasks/exceptions/task-not-found.exception';
@Injectable()
export class GetTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}
  async execute(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new TaskNotFoundException(id);
    }
    return task;
  }
}
