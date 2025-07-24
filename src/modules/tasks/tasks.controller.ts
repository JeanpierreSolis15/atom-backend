import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/infrastructure/auth/jwt-auth.guard';
import { CreateTaskDto } from '@application/use-cases/tasks/dtos/create-task.dto';
import { UpdateTaskDto } from '@application/use-cases/tasks/dtos/update-task.dto';
import { CreateTaskUseCase } from '@application/use-cases/tasks/crud/create-task.use-case';
import { GetTaskUseCase } from '@application/use-cases/tasks/crud/get-task.use-case';
import { GetAllTasksUseCase } from '@application/use-cases/tasks/queries/get-all-tasks.use-case';
import { GetUserTasksUseCase } from '@application/use-cases/tasks/queries/get-user-tasks.use-case';
import { UpdateTaskUseCase } from '@application/use-cases/tasks/crud/update-task.use-case';
import { DeleteTaskUseCase } from '@application/use-cases/tasks/crud/delete-task.use-case';
import { Task } from '@domain/tasks/entities/task.entity';
import {
  SwaggerTaskResponse,
  SwaggerTasksResponse,
  SwaggerEmptyResponse,
} from '@shared/domain/responses/swagger-response-types';
@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TasksController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly getAllTasksUseCase: GetAllTasksUseCase,
    private readonly getUserTasksUseCase: GetUserTasksUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
  ) {}
  @Post()
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiResponse({
    status: 201,
    description: 'Tarea creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req,
  ): Promise<SwaggerTaskResponse> {
    const result = await this.createTaskUseCase.execute(
      createTaskDto,
      req.user.id,
    );
    return {
      success: true,
      statusCode: 201,
      message: 'Tarea creada exitosamente',
      timestamp: new Date().toISOString(),
      data: result,
    };
  }
  @Get()
  @ApiOperation({ summary: 'Obtener todas las tareas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tareas obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getAllTasks(): Promise<SwaggerTasksResponse> {
    const result = await this.getAllTasksUseCase.execute();
    return {
      success: true,
      statusCode: 200,
      message: 'Lista de tareas obtenida exitosamente',
      timestamp: new Date().toISOString(),
      data: result,
    };
  }
  @Get('my-tasks')
  @ApiOperation({ summary: 'Obtener tareas del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Tareas del usuario obtenidas exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getMyTasks(@Request() req): Promise<SwaggerTasksResponse> {
    const result = await this.getUserTasksUseCase.execute(req.user.id);
    return {
      success: true,
      statusCode: 200,
      message: 'Tareas del usuario obtenidas exitosamente',
      timestamp: new Date().toISOString(),
      data: result,
    };
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({
    status: 200,
    description: 'Tarea obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async getTask(@Param('id') id: string): Promise<SwaggerTaskResponse> {
    const result = await this.getTaskUseCase.execute(id);
    return {
      success: true,
      statusCode: 200,
      message: 'Tarea obtenida exitosamente',
      timestamp: new Date().toISOString(),
      data: result,
    };
  }
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({
    status: 200,
    description: 'Tarea actualizada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<SwaggerTaskResponse> {
    const result = await this.updateTaskUseCase.execute(id, updateTaskDto);
    return {
      success: true,
      statusCode: 200,
      message: 'Tarea actualizada exitosamente',
      timestamp: new Date().toISOString(),
      data: result,
    };
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tarea' })
  @ApiParam({ name: 'id', description: 'ID de la tarea' })
  @ApiResponse({
    status: 200,
    description: 'Tarea eliminada exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  async deleteTask(@Param('id') id: string): Promise<SwaggerEmptyResponse> {
    await this.deleteTaskUseCase.execute(id);
    return {
      success: true,
      statusCode: 200,
      message: 'Tarea eliminada exitosamente',
      timestamp: new Date().toISOString(),
      data: null,
    };
  }
}
