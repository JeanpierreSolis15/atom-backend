import { Injectable } from '@nestjs/common';
import { Task } from '@domain/tasks/entities/task.entity';
import { ITaskRepository } from '@domain/tasks/repositories/task.repository.interface';
import { FirebaseService } from '@shared/infrastructure/firebase/firebase.service';
import { TaskFactory } from '@domain/tasks/factories/task.factory';
@Injectable()
export class FirebaseTaskRepository implements ITaskRepository {
  private readonly collectionName = 'tasks';
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly taskFactory: TaskFactory,
  ) {}
  async findById(id: string): Promise<Task | null> {
    try {
      const doc = await this.firebaseService
        .getFirestore()
        .collection(this.collectionName)
        .doc(id)
        .get();
      if (!doc.exists) {
        return null;
      }
      const data = doc.data();
      return this.taskFactory.createFromData({
        id: doc.id,
        title: data.title,
        description: data.description,
        userId: data.userId,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      });
    } catch (error) {
      return null;
    }
  }
  async findByUserId(userId: string): Promise<Task[]> {
    try {
      const querySnapshot = await this.firebaseService
        .getFirestore()
        .collection(this.collectionName)
        .where('userId', '==', userId)
        .get();
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return this.taskFactory.createFromData({
          id: doc.id,
          title: data.title,
          description: data.description,
          userId: data.userId,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });
    } catch (error) {
      return [];
    }
  }
  async save(task: Task): Promise<Task> {
    try {
      const taskData = {
        title: task.title,
        description: task.description,
        userId: task.userId,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      };
      await this.firebaseService
        .getFirestore()
        .collection(this.collectionName)
        .doc(task.id)
        .set(taskData);
      return task;
    } catch (error) {
      throw new Error('Error al guardar la tarea');
    }
  }
  async update(task: Task): Promise<Task> {
    try {
      const taskData = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        updatedAt: task.updatedAt,
      };
      await this.firebaseService
        .getFirestore()
        .collection(this.collectionName)
        .doc(task.id)
        .update(taskData);
      return task;
    } catch (error) {
      throw new Error('Error al actualizar la tarea');
    }
  }
  async delete(id: string): Promise<void> {
    try {
      await this.firebaseService
        .getFirestore()
        .collection(this.collectionName)
        .doc(id)
        .delete();
    } catch (error) {
      throw new Error('Error al eliminar la tarea');
    }
  }
  async findAll(): Promise<Task[]> {
    try {
      const querySnapshot = await this.firebaseService
        .getFirestore()
        .collection(this.collectionName)
        .get();
      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return this.taskFactory.createFromData({
          id: doc.id,
          title: data.title,
          description: data.description,
          userId: data.userId,
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
      });
    } catch (error) {
      return [];
    }
  }
}
