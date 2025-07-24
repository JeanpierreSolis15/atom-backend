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
import { UpdateUserDto } from '@application/use-cases/users/dtos/update-user.dto';
import { GetUserUseCase } from '@application/use-cases/users/crud/get-user.use-case';
import { GetAllUsersUseCase } from '@application/use-cases/users/queries/get-all-users.use-case';
import { UpdateUserUseCase } from '@application/use-cases/users/crud/update-user.use-case';
import { DeleteUserUseCase } from '@application/use-cases/users/crud/delete-user.use-case';
import { User } from '@domain/users/entities/user.entity';
import {
  SwaggerUserResponse,
  SwaggerUsersResponse,
  SwaggerEmptyResponse,
} from '@shared/domain/responses/swagger-response-types';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async getAllUsers(): Promise<SwaggerUsersResponse> {
    const result = await this.getAllUsersUseCase.execute();
    return {
      success: true,
      statusCode: 200,
      message: 'Lista de usuarios obtenida exitosamente',
      timestamp: new Date().toISOString(),
      data: result,
    };
  }
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario obtenido exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getProfile(@Request() req): Promise<SwaggerUserResponse> {
    const result = await this.getUserUseCase.execute(req.user.id);
    return {
      success: true,
      statusCode: 200,
      message: 'Perfil del usuario obtenido exitosamente',
      timestamp: new Date().toISOString(),
      data: result,
    };
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario obtenido exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getUser(@Param('id') id: string): Promise<SwaggerUserResponse> {
    const result = await this.getUserUseCase.execute(id);
    return {
      success: true,
      statusCode: 200,
      message: 'Usuario obtenido exitosamente',
      timestamp: new Date().toISOString(),
      data: result,
    };
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<SwaggerUserResponse> {
    const result = await this.updateUserUseCase.execute(id, updateUserDto);
    return {
      success: true,
      statusCode: 200,
      message: 'Usuario actualizado exitosamente',
      timestamp: new Date().toISOString(),
      data: result,
    };
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deleteUser(@Param('id') id: string): Promise<SwaggerEmptyResponse> {
    await this.deleteUserUseCase.execute(id);
    return {
      success: true,
      statusCode: 200,
      message: 'Usuario eliminado exitosamente',
      timestamp: new Date().toISOString(),
      data: null,
    };
  }
}
