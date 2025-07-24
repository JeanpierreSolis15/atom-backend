import { ApiProperty } from '@nestjs/swagger';
export class ApiResponse<T> {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  readonly success: boolean;
  @ApiProperty({ description: 'Código de estado HTTP' })
  readonly statusCode: number;
  @ApiProperty({ description: 'Mensaje descriptivo de la respuesta' })
  readonly message: string;
  @ApiProperty({ description: 'Timestamp de la respuesta' })
  readonly timestamp: string;
  @ApiProperty({ description: 'Datos de la respuesta' })
  readonly data: T;
  constructor(success: boolean, statusCode: number, message: string, data: T) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.timestamp = new Date().toISOString();
    this.data = data;
  }
  static success<T>(
    data: T,
    message: string = 'Operación exitosa',
    statusCode: number = 200,
  ): ApiResponse<T> {
    return new ApiResponse(true, statusCode, message, data);
  }
  static error<T>(
    message: string = 'Error en la operación',
    statusCode: number = 500,
    data: T = null as T,
  ): ApiResponse<T> {
    return new ApiResponse(false, statusCode, message, data);
  }
}
