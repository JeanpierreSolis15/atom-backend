import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@shared/domain/responses/api-response.model';
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;
    return next.handle().pipe(
      map((data) => {
        if (data instanceof ApiResponse) {
          return data;
        }
        const message = this.getDefaultMessage(statusCode);
        return ApiResponse.success(data, message, statusCode);
      }),
    );
  }
  private getDefaultMessage(statusCode: number): string {
    switch (statusCode) {
      case 200:
        return 'Operación exitosa';
      case 201:
        return 'Recurso creado exitosamente';
      case 204:
        return 'Recurso eliminado exitosamente';
      default:
        return 'Operación completada';
    }
  }
}
