import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from '@shared/infrastructure/interceptors/response.interceptor';
import { HttpExceptionFilter } from '@shared/infrastructure/filters/http-exception.filter';
import { createCustomLogger } from '@shared/infrastructure/logger/logger.config';
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const loggerConfig = createCustomLogger();
  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig.logger,
  });
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  const config = new DocumentBuilder()
    .setTitle('Atom Backend API')
    .setDescription(
      'Prueba técnica Atom - Backend con NestJS, Clean Architecture y DDD',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  logger.log(`🔍 Log level: ${loggerConfig.logger.join(', ')}`);
}
bootstrap();
