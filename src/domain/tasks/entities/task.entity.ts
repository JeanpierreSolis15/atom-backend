import { ApiProperty } from '@nestjs/swagger';
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}
export class Task {
  @ApiProperty({ description: 'ID único de la tarea' })
  readonly id: string;
  @ApiProperty({ description: 'Título de la tarea' })
  readonly title: string;
  @ApiProperty({ description: 'Descripción de la tarea' })
  readonly description: string;
  @ApiProperty({ description: 'ID del usuario asignado' })
  readonly userId: string;
  @ApiProperty({ description: 'Estado de la tarea', enum: TaskStatus })
  readonly status: TaskStatus;
  @ApiProperty({ description: 'Prioridad de la tarea', enum: TaskPriority })
  readonly priority: TaskPriority;
  @ApiProperty({ description: 'Fecha de vencimiento' })
  readonly dueDate: Date;
  @ApiProperty({ description: 'Fecha de creación' })
  readonly createdAt: Date;
  @ApiProperty({ description: 'Fecha de actualización' })
  readonly updatedAt: Date;
  constructor(
    id: string,
    title: string,
    description: string,
    userId: string,
    status: TaskStatus,
    priority: TaskPriority,
    dueDate: Date,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.userId = userId;
    this.status = status;
    this.priority = priority;
    this.dueDate = dueDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  markAsInProgress(): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      this.userId,
      TaskStatus.IN_PROGRESS,
      this.priority,
      this.dueDate,
      this.createdAt,
      new Date(),
    );
  }
  markAsDone(): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      this.userId,
      TaskStatus.DONE,
      this.priority,
      this.dueDate,
      this.createdAt,
      new Date(),
    );
  }
  markAsTodo(): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      this.userId,
      TaskStatus.TODO,
      this.priority,
      this.dueDate,
      this.createdAt,
      new Date(),
    );
  }
  updateDetails(
    title: string,
    description: string,
    priority: TaskPriority,
    dueDate: Date,
  ): Task {
    return new Task(
      this.id,
      title,
      description,
      this.userId,
      this.status,
      priority,
      dueDate,
      this.createdAt,
      new Date(),
    );
  }
  updateStatus(status: TaskStatus): Task {
    return new Task(
      this.id,
      this.title,
      this.description,
      this.userId,
      status,
      this.priority,
      this.dueDate,
      this.createdAt,
      new Date(),
    );
  }
  isOverdue(): boolean {
    return new Date() > this.dueDate && this.status !== TaskStatus.DONE;
  }
  isDone(): boolean {
    return this.status === TaskStatus.DONE;
  }
}
