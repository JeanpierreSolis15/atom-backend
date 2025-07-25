import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(userId: string) {
    super(
      `Usuario con ID ${userId} no encontrado`,
      HttpStatus.NOT_FOUND,
    );
    this.name = 'UserNotFoundException';
  }
}
