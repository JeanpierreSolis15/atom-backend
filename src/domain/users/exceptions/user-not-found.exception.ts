export class UserNotFoundException extends Error {
  constructor(userId: string) {
    super(`Usuario con ID ${userId} no encontrado`);
    this.name = 'UserNotFoundException';
  }
}
