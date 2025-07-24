import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto } from '@application/use-cases/auth/dtos/login.dto';
import { RegisterDto } from '@application/use-cases/auth/dtos/register.dto';
import {
  LoginUseCase,
  LoginResponse,
} from '@application/use-cases/auth/crud/login.use-case';
import {
  RegisterUseCase,
  RegisterResponse,
} from '@application/use-cases/auth/crud/register.use-case';
import {
  RefreshTokenUseCase,
  RefreshTokenResponse,
} from '@application/use-cases/auth/queries/refresh-token.use-case';
import {
  SwaggerAuthResponse,
  SwaggerRegisterResponse,
} from '@shared/domain/responses/swagger-response-types';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Usuario ya existe' })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<SwaggerRegisterResponse> {
    const result = await this.registerUseCase.execute(registerDto);
    return {
      success: true,
      statusCode: 201,
      message: 'Usuario registrado exitosamente',
      timestamp: new Date().toISOString(),
      data: result,
    };
  }
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto): Promise<SwaggerAuthResponse> {
    const result = await this.loginUseCase.execute(loginDto);
    return {
      success: true,
      statusCode: 200,
      message: 'Login exitoso',
      timestamp: new Date().toISOString(),
      data: result,
    };
  }
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          description: 'Token de refresco',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens refrescados exitosamente',
  })
  @ApiResponse({ status: 401, description: 'Token de refresco inválido' })
  async refreshToken(
    @Body() body: { refreshToken: string },
  ): Promise<SwaggerAuthResponse> {
    const result = await this.refreshTokenUseCase.execute(body.refreshToken);
    return {
      success: true,
      statusCode: 200,
      message: 'Tokens refrescados exitosamente',
      timestamp: new Date().toISOString(),
      data: result,
    };
  }
}
