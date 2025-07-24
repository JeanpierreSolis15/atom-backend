import { ApiProperty } from '@nestjs/swagger';
import { ApiResponse } from './api-response.model';
import { User } from '@domain/users/entities/user.entity';
import { Task } from '@domain/tasks/entities/task.entity';
export class AuthResponse {
  @ApiProperty({ description: 'Token de acceso JWT' })
  accessToken: string;
  @ApiProperty({ description: 'Token de refresco JWT' })
  refreshToken: string;
  @ApiProperty({ description: 'Información del usuario' })
  user: {
    id: string;
    email: string;
    name: string;
    lastName: string;
  };
}
export class UserResponse extends ApiResponse<User> {}
export class UsersResponse extends ApiResponse<User[]> {}
export class TaskResponse extends ApiResponse<Task> {}
export class TasksResponse extends ApiResponse<Task[]> {}
export class AuthResponseWrapper extends ApiResponse<AuthResponse> {}
export class EmptyResponse extends ApiResponse<null> {}
