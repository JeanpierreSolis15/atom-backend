import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '@domain/tasks/entities/task.entity';
export class CreateTaskDto {
  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Implementar autenticación JWT',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es requerido' })
  readonly title: string;
  @ApiProperty({
    description: 'Descripción de la tarea',
    example: 'Implementar sistema de autenticación con JWT tokens',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  readonly description: string;
  @ApiProperty({
    description: 'Estado de la tarea',
    enum: TaskStatus,
    example: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus, { message: 'El estado debe ser válido' })
  @IsOptional()
  readonly status?: TaskStatus;
  @ApiProperty({
    description: 'Prioridad de la tarea',
    enum: TaskPriority,
    example: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority, { message: 'La prioridad debe ser válida' })
  @IsOptional()
  readonly priority?: TaskPriority;
  @ApiProperty({
    description: 'Fecha de vencimiento',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsDateString(
    {},
    { message: 'La fecha de vencimiento debe ser una fecha válida' },
  )
  @IsNotEmpty({ message: 'La fecha de vencimiento es requerida' })
  readonly dueDate: string;
}
