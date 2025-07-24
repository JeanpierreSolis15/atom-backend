import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl, ip, headers } = req;
    this.logger.log(`Incoming ${method} ${originalUrl}`, {
      method,
      url: originalUrl,
      ip,
      userAgent: headers['user-agent'],
      timestamp: new Date().toISOString(),
    });
    if (method !== 'GET' && req.body) {
      const sanitizedBody = this.sanitizeBody(req.body);
      this.logger.debug('Request body', {
        body: sanitizedBody,
        url: originalUrl,
      });
    }
    res.on('finish', () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const statusCode = res.statusCode;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${duration}ms`,
        {
          method,
          url: originalUrl,
          statusCode,
          duration,
          timestamp: new Date().toISOString(),
        },
      );
      if (statusCode >= 400) {
        this.logger.error(`Error response for ${method} ${originalUrl}`, {
          statusCode,
          duration,
          timestamp: new Date().toISOString(),
        });
      }
    });
    next();
  }
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }
    const sanitized = { ...body };
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
    ];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    return sanitized;
  }
}
