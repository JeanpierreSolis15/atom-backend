import { Injectable, Inject } from '@nestjs/common';
import { Task } from '@domain/tasks/entities/task.entity';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
import { CreateTaskDto } from '../dtos/create-task.dto';
import { TaskFactory } from '@domain/tasks/factories/task.factory';
@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    private readonly taskFactory: TaskFactory,
  ) {}
  async execute(dto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.taskFactory.create(
      dto.title,
      dto.description,
      userId,
      dto.priority,
      new Date(dto.dueDate),
      dto.status,
    );
    return await this.taskRepository.save(task);
  }
}
