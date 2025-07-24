import { ApiProperty } from '@nestjs/swagger';
export class Email {
  @ApiProperty({ description: 'Dirección de email válida' })
  readonly value: string;
  constructor(value: string) {
    const normalizedEmail = value.toLowerCase().trim();
    this.validate(normalizedEmail);
    this.value = normalizedEmail;
  }
  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }
  }
  equals(other: Email): boolean {
    return this.value === other.value;
  }
  toString(): string {
    return this.value;
  }
}
