import { Injectable } from '@nestjs/common';
import { Task, TaskStatus, TaskPriority } from '../entities/task.entity';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class TaskFactory {
  create(
    title: string,
    description: string,
    userId: string,
    priority: TaskPriority = TaskPriority.MEDIUM,
    dueDate: Date,
    status: TaskStatus = TaskStatus.TODO,
  ): Task {
    const now = new Date();
    return new Task(
      uuidv4(),
      title,
      description,
      userId,
      status,
      priority,
      dueDate,
      now,
      now,
    );
  }
  createFromData(data: {
    id: string;
    title: string;
    description: string;
    userId: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: Date;
    createdAt: Date;
    updatedAt: Date;
  }): Task {
    return new Task(
      data.id,
      data.title,
      data.description,
      data.userId,
      data.status,
      data.priority,
      data.dueDate,
      data.createdAt,
      data.updatedAt,
    );
  }
}
