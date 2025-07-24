import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '@shared/domain/responses/api-response.model';
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    this.logger.error('Error capturado por HttpExceptionFilter', {
      exception:
        exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
      url: request.url,
      method: request.method,
      body: request.body,
      params: request.params,
      query: request.query,
      headers: request.headers,
      timestamp: new Date().toISOString(),
    });
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        message = Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message[0]
          : exceptionResponse.message;
      } else {
        message = exception.message;
      }
      this.logger.warn(`HttpException: ${status} - ${message}`, {
        status,
        message,
        url: request.url,
        method: request.method,
      });
    } else {
      this.logger.error('Error no controlado', {
        exception:
          exception instanceof Error ? exception.message : String(exception),
        stack: exception instanceof Error ? exception.stack : undefined,
        url: request.url,
        method: request.method,
      });
    }
    const errorResponse = ApiResponse.error(message, status, null);
    response.status(status).json(errorResponse);
  }
}
