import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class RegisterDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  readonly email: string;
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  readonly name: string;
  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  readonly lastName: string;
  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  readonly password: string;
}
