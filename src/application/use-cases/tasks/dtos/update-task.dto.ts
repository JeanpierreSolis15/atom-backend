import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '@domain/tasks/entities/task.entity';
export class UpdateTaskDto {
  @ApiProperty({
    description: 'Título de la tarea',
    example: 'Implementar autenticación JWT',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título no puede estar vacío' })
  readonly title?: string;
  @ApiProperty({
    description: 'Descripción de la tarea',
    example: 'Implementar sistema de autenticación con JWT tokens',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  readonly description?: string;
  @ApiProperty({
    description: 'Estado de la tarea',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'El estado debe ser válido' })
  readonly status?: TaskStatus;
  @ApiProperty({
    description: 'Prioridad de la tarea',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    required: false,
  })
  @IsOptional()
  @IsEnum(TaskPriority, { message: 'La prioridad debe ser válida' })
  readonly priority?: TaskPriority;
  @ApiProperty({
    description: 'Fecha de vencimiento',
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de vencimiento debe ser una fecha válida' },
  )
  readonly dueDate?: string;
}
