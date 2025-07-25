import { HttpException, HttpStatus } from '@nestjs/common';

export class UserAlreadyExistsException extends HttpException {
  constructor(email: string) {
    super(
      `Usuario con email ${email} ya existe`,
      HttpStatus.CONFLICT,
    );
    this.name = 'UserAlreadyExistsException';
  }
}
