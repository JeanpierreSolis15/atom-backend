import { Injectable, Inject } from '@nestjs/common';
import { Task } from '@domain/tasks/entities/task.entity';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
@Injectable()
export class GetUserTasksUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}
  async execute(userId: string): Promise<Task[]> {
    return await this.taskRepository.findByUserId(userId);
  }
}
