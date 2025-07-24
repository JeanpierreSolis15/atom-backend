import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseInterceptor } from './response.interceptor';
import { ApiResponse } from '@shared/domain/responses/api-response.model';
describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponseInterceptor],
    }).compile();
    interceptor = module.get<ResponseInterceptor<any>>(ResponseInterceptor);
  });
  const createMockExecutionContext = (statusCode: number) => {
    const mockResponse = {
      statusCode,
    };
    return {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as ExecutionContext;
  };
  const createMockCallHandler = (data: any) => {
    return {
      handle: () => of(data),
    } as CallHandler;
  };
  describe('intercept', () => {
    it('debería envolver datos simples en ApiResponse con mensaje por defecto', (done) => {
      const testData = { id: 1, name: 'Test' };
      const statusCode = 200;
      mockExecutionContext = createMockExecutionContext(statusCode);
      mockCallHandler = createMockCallHandler(testData);
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBeInstanceOf(ApiResponse);
          expect(result.data).toEqual(testData);
          expect(result.message).toBe('Operación exitosa');
          expect(result.statusCode).toBe(statusCode);
          expect(result.success).toBe(true);
          done();
        },
        error: done,
      });
    });
    it('debería manejar datos que ya son ApiResponse sin modificarlos', (done) => {
      const existingApiResponse = ApiResponse.success(
        { id: 1, name: 'Test' },
        'Mensaje personalizado',
        201,
      );
      const statusCode = 201;
      mockExecutionContext = createMockExecutionContext(statusCode);
      mockCallHandler = createMockCallHandler(existingApiResponse);
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBe(existingApiResponse);
          expect(result.message).toBe('Mensaje personalizado');
          expect(result.statusCode).toBe(201);
          done();
        },
        error: done,
      });
    });
    it('debería manejar datos primitivos correctamente', (done) => {
      const testData = 'Datos de prueba';
      const statusCode = 200;
      mockExecutionContext = createMockExecutionContext(statusCode);
      mockCallHandler = createMockCallHandler(testData);
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBeInstanceOf(ApiResponse);
          expect(result.data).toBe(testData);
          expect(result.message).toBe('Operación exitosa');
          expect(result.statusCode).toBe(statusCode);
          done();
        },
        error: done,
      });
    });
    it('debería manejar arrays correctamente', (done) => {
      const testData = [{ id: 1 }, { id: 2 }];
      const statusCode = 200;
      mockExecutionContext = createMockExecutionContext(statusCode);
      mockCallHandler = createMockCallHandler(testData);
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBeInstanceOf(ApiResponse);
          expect(result.data).toEqual(testData);
          expect(result.message).toBe('Operación exitosa');
          expect(result.statusCode).toBe(statusCode);
          done();
        },
        error: done,
      });
    });
    it('debería manejar datos null correctamente', (done) => {
      const testData = null;
      const statusCode = 200;
      mockExecutionContext = createMockExecutionContext(statusCode);
      mockCallHandler = createMockCallHandler(testData);
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBeInstanceOf(ApiResponse);
          expect(result.data).toBeNull();
          expect(result.message).toBe('Operación exitosa');
          expect(result.statusCode).toBe(statusCode);
          done();
        },
        error: done,
      });
    });
    it('debería manejar datos undefined correctamente', (done) => {
      const testData = undefined;
      const statusCode = 200;
      mockExecutionContext = createMockExecutionContext(statusCode);
      mockCallHandler = createMockCallHandler(testData);
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toBeInstanceOf(ApiResponse);
          expect(result.data).toBeUndefined();
          expect(result.message).toBe('Operación exitosa');
          expect(result.statusCode).toBe(statusCode);
          done();
        },
        error: done,
      });
    });
  });
  describe('getDefaultMessage', () => {
    it('debería retornar mensaje correcto para status 200', (done) => {
      const testData = { test: 'data' };
      const statusCode = 200;
      mockExecutionContext = createMockExecutionContext(statusCode);
      mockCallHandler = createMockCallHandler(testData);
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Operación exitosa');
          done();
        },
        error: done,
      });
    });
    it('debería retornar mensaje correcto para status 201', (done) => {
      const testData = { test: 'data' };
      const statusCode = 201;
      mockExecutionContext = createMockExecutionContext(statusCode);
      mockCallHandler = createMockCallHandler(testData);
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Recurso creado exitosamente');
          done();
        },
        error: done,
      });
    });
    it('debería retornar mensaje correcto para status 204', (done) => {
      const testData = { test: 'data' };
      const statusCode = 204;
      mockExecutionContext = createMockExecutionContext(statusCode);
      mockCallHandler = createMockCallHandler(testData);
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Recurso eliminado exitosamente');
          done();
        },
        error: done,
      });
    });
    it('debería retornar mensaje por defecto para otros status codes', (done) => {
      const testData = { test: 'data' };
      const statusCode = 404;
      mockExecutionContext = createMockExecutionContext(statusCode);
      mockCallHandler = createMockCallHandler(testData);
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Operación completada');
          done();
        },
        error: done,
      });
    });
    it('debería retornar mensaje por defecto para status 500', (done) => {
      const testData = { test: 'data' };
      const statusCode = 500;
      mockExecutionContext = createMockExecutionContext(statusCode);
      mockCallHandler = createMockCallHandler(testData);
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.message).toBe('Operación completada');
          done();
        },
        error: done,
      });
    });
  });
  describe('estructura de ApiResponse', () => {
    it('debería crear ApiResponse con estructura correcta', (done) => {
      const testData = { id: 1, name: 'Test User' };
      const statusCode = 200;
      mockExecutionContext = createMockExecutionContext(statusCode);
      mockCallHandler = createMockCallHandler(testData);
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toHaveProperty('success');
          expect(result).toHaveProperty('data');
          expect(result).toHaveProperty('message');
          expect(result).toHaveProperty('statusCode');
          expect(result).toHaveProperty('timestamp');
          expect(result.success).toBe(true);
          expect(result.data).toEqual(testData);
          expect(result.message).toBe('Operación exitosa');
          expect(result.statusCode).toBe(statusCode);
          expect(typeof result.timestamp).toBe('string');
          done();
        },
        error: done,
      });
    });
  });
  describe('manejo de errores', () => {
    it('debería propagar errores del CallHandler', (done) => {
      const testError = new Error('Error de prueba');
      const mockCallHandlerWithError = {
        handle: () => {
          throw testError;
        },
      } as CallHandler;
      mockExecutionContext = createMockExecutionContext(200);
      try {
        interceptor
          .intercept(mockExecutionContext, mockCallHandlerWithError)
          .subscribe({
            next: () => {
              done(new Error('No debería llegar aquí'));
            },
            error: (error) => {
              expect(error).toBe(testError);
              done();
            },
          });
      } catch (error) {
        expect(error).toBe(testError);
        done();
      }
    });
  });
});
