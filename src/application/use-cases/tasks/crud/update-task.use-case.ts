import { Injectable, Inject } from '@nestjs/common';
import { Task } from '@domain/tasks/entities/task.entity';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
import { UpdateTaskDto } from '../dtos/update-task.dto';
import { TaskNotFoundException } from '@domain/tasks/exceptions/task-not-found.exception';
@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}
  async execute(id: string, dto: UpdateTaskDto): Promise<Task> {
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      throw new TaskNotFoundException(id);
    }
    let updatedTask = existingTask;
    if (dto.title || dto.description || dto.priority || dto.dueDate) {
      updatedTask = existingTask.updateDetails(
        dto.title || existingTask.title,
        dto.description || existingTask.description,
        dto.priority || existingTask.priority,
        dto.dueDate ? new Date(dto.dueDate) : existingTask.dueDate,
      );
    }
    if (dto.status) {
      updatedTask = updatedTask.updateStatus(dto.status);
    }
    return await this.taskRepository.update(updatedTask);
  }
}
