import { ApiProperty } from '@nestjs/swagger';
export class User {
  @ApiProperty({ description: 'ID único del usuario' })
  readonly id: string;
  @ApiProperty({ description: 'Email del usuario' })
  readonly email: string;
  @ApiProperty({ description: 'Nombre del usuario' })
  readonly name: string;
  @ApiProperty({ description: 'Apellido del usuario' })
  readonly lastName: string;
  @ApiProperty({ description: 'Hash de la contraseña' })
  readonly passwordHash: string;
  @ApiProperty({ description: 'Fecha de creación' })
  readonly createdAt: Date;
  @ApiProperty({ description: 'Fecha de actualización' })
  readonly updatedAt: Date;
  @ApiProperty({ description: 'Indica si el usuario está activo' })
  readonly isActive: boolean;
  constructor(
    id: string,
    email: string,
    name: string,
    lastName: string,
    passwordHash: string,
    createdAt: Date,
    updatedAt: Date,
    isActive: boolean = true,
  ) {
    this.id = id;
    this.email = email;
    this.name = name;
    this.lastName = lastName;
    this.passwordHash = passwordHash;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isActive = isActive;
  }
  get fullName(): string {
    return `${this.name} ${this.lastName}`;
  }
  deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.lastName,
      this.passwordHash,
      this.createdAt,
      new Date(),
      false,
    );
  }
  activate(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.lastName,
      this.passwordHash,
      this.createdAt,
      new Date(),
      true,
    );
  }
  updateProfile(name: string, lastName: string): User {
    return new User(
      this.id,
      this.email,
      name,
      lastName,
      this.passwordHash,
      this.createdAt,
      new Date(),
      this.isActive,
    );
  }
}
