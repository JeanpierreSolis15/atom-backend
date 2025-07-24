import { Injectable, Inject } from '@nestjs/common';
import { Task } from '@domain/tasks/entities/task.entity';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
@Injectable()
export class GetAllTasksUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}
  async execute(): Promise<Task[]> {
    return await this.taskRepository.findAll();
  }
}
