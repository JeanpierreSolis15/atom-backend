import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
export class UpdateUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  readonly name?: string;
  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido no puede estar vacío' })
  readonly lastName?: string;
}
