import { Task } from '../entities/task.entity';
export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findByUserId(userId: string): Promise<Task[]>;
  save(task: Task): Promise<Task>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Task[]>;
}
