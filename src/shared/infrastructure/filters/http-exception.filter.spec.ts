import { Test, TestingModule } from '@nestjs/testing';
import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiResponse } from '@shared/domain/responses/api-response.model';
describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: jest.Mocked<Response>;
  let mockRequest: jest.Mocked<Request>;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile();
    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter);
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as any;
    mockRequest = {
      url: '/test-endpoint',
      method: 'GET',
      body: { test: 'data' },
      params: { id: '123' },
      query: { page: '1' },
      headers: { authorization: 'Bearer token' },
    } as any;
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('catch', () => {
    it('debería estar definido', () => {
      expect(filter).toBeDefined();
    });
    it('debería manejar HttpException correctamente', () => {
      const httpException = new HttpException(
        'Test error',
        HttpStatus.BAD_REQUEST,
      );
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Test error',
          data: null,
        }),
      );
    });
    it('debería manejar HttpException con array de mensajes', () => {
      const httpException = new HttpException(
        { message: ['Error 1', 'Error 2'] },
        HttpStatus.BAD_REQUEST,
      );
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Error 1',
          data: null,
        }),
      );
    });
    it('debería manejar HttpException con objeto de respuesta', () => {
      const httpException = new HttpException(
        { message: 'Custom error message' },
        HttpStatus.NOT_FOUND,
      );
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Custom error message',
          data: null,
        }),
      );
    });
    it('debería manejar errores no controlados', () => {
      const genericError = new Error('Generic error');
      filter.catch(genericError, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno del servidor',
          data: null,
        }),
      );
    });
    it('debería manejar errores de string', () => {
      const stringError = 'String error message';
      filter.catch(stringError, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno del servidor',
          data: null,
        }),
      );
    });
    it('debería manejar errores de número', () => {
      const numberError = 500;
      filter.catch(numberError, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno del servidor',
          data: null,
        }),
      );
    });
    it('debería manejar errores null', () => {
      filter.catch(null, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno del servidor',
          data: null,
        }),
      );
    });
    it('debería manejar errores undefined', () => {
      filter.catch(undefined, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno del servidor',
          data: null,
        }),
      );
    });
    it('debería manejar diferentes tipos de HttpException', () => {
      const testCases = [
        {
          exception: new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED),
          expectedStatus: HttpStatus.UNAUTHORIZED,
        },
        {
          exception: new HttpException('Forbidden', HttpStatus.FORBIDDEN),
          expectedStatus: HttpStatus.FORBIDDEN,
        },
        {
          exception: new HttpException('Not Found', HttpStatus.NOT_FOUND),
          expectedStatus: HttpStatus.NOT_FOUND,
        },
        {
          exception: new HttpException('Conflict', HttpStatus.CONFLICT),
          expectedStatus: HttpStatus.CONFLICT,
        },
        {
          exception: new HttpException(
            'Validation Error',
            HttpStatus.UNPROCESSABLE_ENTITY,
          ),
          expectedStatus: HttpStatus.UNPROCESSABLE_ENTITY,
        },
      ];
      for (const testCase of testCases) {
        filter.catch(testCase.exception, mockArgumentsHost);
        expect(mockResponse.status).toHaveBeenCalledWith(
          testCase.expectedStatus,
        );
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            statusCode: testCase.expectedStatus,
            message: testCase.exception.message,
            data: null,
          }),
        );
      }
    });
    it('debería manejar HttpException con mensajes complejos', () => {
      const complexException = new HttpException(
        {
          message: 'Validation failed',
          errors: ['Field is required', 'Invalid format'],
          code: 'VALIDATION_ERROR',
        },
        HttpStatus.BAD_REQUEST,
      );
      filter.catch(complexException, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          data: null,
        }),
      );
    });
    it('debería manejar HttpException con mensaje de string en objeto', () => {
      const exception = new HttpException(
        { message: 'Simple string message' },
        HttpStatus.BAD_REQUEST,
      );
      filter.catch(exception, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Simple string message',
          data: null,
        }),
      );
    });
    it('debería manejar HttpException sin propiedad message en objeto', () => {
      const exception = new HttpException(
        { error: 'Some error', code: 'ERROR_CODE' },
        HttpStatus.BAD_REQUEST,
      );
      filter.catch(exception, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: exception.message,
          data: null,
        }),
      );
    });
    it('debería manejar HttpException con mensaje de string directo', () => {
      const exception = new HttpException(
        'Direct string message',
        HttpStatus.BAD_REQUEST,
      );
      filter.catch(exception, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Direct string message',
          data: null,
        }),
      );
    });
    it('debería manejar errores con stack trace', () => {
      const errorWithStack = new Error('Error with stack');
      errorWithStack.stack = 'Error: Error with stack\n    at test.js:1:1';
      filter.catch(errorWithStack, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno del servidor',
          data: null,
        }),
      );
    });
    it('debería manejar errores con caracteres especiales', () => {
      const specialError = new Error(
        'Error con caracteres especiales: áéíóú ñ',
      );
      filter.catch(specialError, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno del servidor',
          data: null,
        }),
      );
    });
    it('debería manejar errores con emojis', () => {
      const emojiError = new Error('Error with emojis 🚀 💻 🎯');
      filter.catch(emojiError, mockArgumentsHost);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno del servidor',
          data: null,
        }),
      );
    });
    it('debería manejar errores con URLs largas', () => {
      const longUrlRequest = {
        ...mockRequest,
        url: '/api/v1/users/123/tasks/456/comments/789/replies/101112/attachments/131415',
      };
      const mockArgumentsHostWithLongUrl = {
        switchToHttp: jest.fn().mockReturnValue({
          getResponse: jest.fn().mockReturnValue(mockResponse),
          getRequest: jest.fn().mockReturnValue(longUrlRequest),
        }),
      } as any;
      const error = new Error('Error with long URL');
      filter.catch(error, mockArgumentsHostWithLongUrl);
      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno del servidor',
          data: null,
        }),
      );
    });
    it('debería manejar errores con métodos HTTP diferentes', () => {
      const httpMethods = [
        'GET',
        'POST',
        'PUT',
        'DELETE',
        'PATCH',
        'OPTIONS',
        'HEAD',
      ];
      for (const method of httpMethods) {
        const methodRequest = {
          ...mockRequest,
          method,
        };
        const mockArgumentsHostWithMethod = {
          switchToHttp: jest.fn().mockReturnValue({
            getResponse: jest.fn().mockReturnValue(mockResponse),
            getRequest: jest.fn().mockReturnValue(methodRequest),
          }),
        } as any;
        const error = new Error(`Error with ${method} method`);
        filter.catch(error, mockArgumentsHostWithMethod);
        expect(mockResponse.status).toHaveBeenCalledWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error interno del servidor',
            data: null,
          }),
        );
      }
    });
    it('debería manejar errores con diferentes tipos de body', () => {
      const testBodies = [
        { simple: 'data' },
        { complex: { nested: { data: 'value' } } },
        { array: [1, 2, 3, 4, 5] },
        { mixed: { string: 'text', number: 123, boolean: true, null: null } },
        {},
        null,
      ];
      for (const body of testBodies) {
        const bodyRequest = {
          ...mockRequest,
          body,
        };
        const mockArgumentsHostWithBody = {
          switchToHttp: jest.fn().mockReturnValue({
            getResponse: jest.fn().mockReturnValue(mockResponse),
            getRequest: jest.fn().mockReturnValue(bodyRequest),
          }),
        } as any;
        const error = new Error(`Error with body: ${JSON.stringify(body)}`);
        filter.catch(error, mockArgumentsHostWithBody);
        expect(mockResponse.status).toHaveBeenCalledWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error interno del servidor',
            data: null,
          }),
        );
      }
    });
  });
  describe('Logger', () => {
    it('debería tener un logger configurado', () => {
      expect(filter['logger']).toBeInstanceOf(Logger);
    });
    it('debería tener un logger configurado', () => {
      expect(filter['logger']).toBeInstanceOf(Logger);
    });
  });
  describe('ApiResponse', () => {
    it('debería usar ApiResponse.error para crear la respuesta', () => {
      const httpException = new HttpException(
        'Test error',
        HttpStatus.BAD_REQUEST,
      );
      filter.catch(httpException, mockArgumentsHost);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Test error',
          data: null,
          timestamp: expect.any(String),
        }),
      );
    });
  });
});
