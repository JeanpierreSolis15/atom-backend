import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { CreateTaskUseCase } from '@application/use-cases/tasks/crud/create-task.use-case';
import { GetTaskUseCase } from '@application/use-cases/tasks/crud/get-task.use-case';
import { GetAllTasksUseCase } from '@application/use-cases/tasks/queries/get-all-tasks.use-case';
import { GetUserTasksUseCase } from '@application/use-cases/tasks/queries/get-user-tasks.use-case';
import { UpdateTaskUseCase } from '@application/use-cases/tasks/crud/update-task.use-case';
import { DeleteTaskUseCase } from '@application/use-cases/tasks/crud/delete-task.use-case';
import { TaskFactory } from '@domain/tasks/factories/task.factory';
import { FirebaseTaskRepository } from '@infrastructure/repositories/firebase/task.repository';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
@Module({
  controllers: [TasksController],
  providers: [
    CreateTaskUseCase,
    GetTaskUseCase,
    GetAllTasksUseCase,
    GetUserTasksUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    TaskFactory,
    {
      provide: 'ITaskRepository',
      useClass: FirebaseTaskRepository,
    },
  ],
  exports: ['ITaskRepository', TaskFactory],
})
export class TasksModule {}
