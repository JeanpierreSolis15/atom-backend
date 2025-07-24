import { ApiProperty } from '@nestjs/swagger';
export class SwaggerUserResponse {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;
  @ApiProperty({ description: 'Código de estado HTTP' })
  statusCode: number;
  @ApiProperty({ description: 'Mensaje descriptivo de la respuesta' })
  message: string;
  @ApiProperty({ description: 'Timestamp de la respuesta' })
  timestamp: string;
  @ApiProperty({ description: 'Datos del usuario' })
  data: object;
}
export class SwaggerRegisterResponse {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;
  @ApiProperty({ description: 'Código de estado HTTP' })
  statusCode: number;
  @ApiProperty({ description: 'Mensaje descriptivo de la respuesta' })
  message: string;
  @ApiProperty({ description: 'Timestamp de la respuesta' })
  timestamp: string;
  @ApiProperty({ description: 'Datos del usuario registrado' })
  data: object;
}
export class SwaggerUsersResponse {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;
  @ApiProperty({ description: 'Código de estado HTTP' })
  statusCode: number;
  @ApiProperty({ description: 'Mensaje descriptivo de la respuesta' })
  message: string;
  @ApiProperty({ description: 'Timestamp de la respuesta' })
  timestamp: string;
  @ApiProperty({ description: 'Lista de usuarios' })
  data: object[];
}
export class SwaggerTaskResponse {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;
  @ApiProperty({ description: 'Código de estado HTTP' })
  statusCode: number;
  @ApiProperty({ description: 'Mensaje descriptivo de la respuesta' })
  message: string;
  @ApiProperty({ description: 'Timestamp de la respuesta' })
  timestamp: string;
  @ApiProperty({ description: 'Datos de la tarea' })
  data: object;
}
export class SwaggerTasksResponse {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;
  @ApiProperty({ description: 'Código de estado HTTP' })
  statusCode: number;
  @ApiProperty({ description: 'Mensaje descriptivo de la respuesta' })
  message: string;
  @ApiProperty({ description: 'Timestamp de la respuesta' })
  timestamp: string;
  @ApiProperty({ description: 'Lista de tareas' })
  data: object[];
}
export class SwaggerAuthResponse {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;
  @ApiProperty({ description: 'Código de estado HTTP' })
  statusCode: number;
  @ApiProperty({ description: 'Mensaje descriptivo de la respuesta' })
  message: string;
  @ApiProperty({ description: 'Timestamp de la respuesta' })
  timestamp: string;
  @ApiProperty({ description: 'Datos de autenticación' })
  data: object;
}
export class SwaggerEmptyResponse {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;
  @ApiProperty({ description: 'Código de estado HTTP' })
  statusCode: number;
  @ApiProperty({ description: 'Mensaje descriptivo de la respuesta' })
  message: string;
  @ApiProperty({ description: 'Timestamp de la respuesta' })
  timestamp: string;
  @ApiProperty({ description: 'Datos de la respuesta', nullable: true })
  data: null;
}
