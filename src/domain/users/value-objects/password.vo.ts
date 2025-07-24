import { ApiProperty } from '@nestjs/swagger';
export class Password {
  @ApiProperty({ description: 'Contraseña hasheada' })
  readonly value: string;
  constructor(value: string, isHashed: boolean = false) {
    if (!isHashed) {
      this.validate(value);
    }
    this.value = value;
  }
  private validate(password: string): void {
    if (!password || password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
  }
  equals(other: Password): boolean {
    return this.value === other.value;
  }
  toString(): string {
    return this.value;
  }
}
