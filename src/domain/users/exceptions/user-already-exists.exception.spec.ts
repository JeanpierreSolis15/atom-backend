import { UserAlreadyExistsException } from './user-already-exists.exception';
describe('UserAlreadyExistsException', () => {
  it('should create exception with correct message', () => {
    const email = 'test@example.com';
    const exception = new UserAlreadyExistsException(email);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.name).toBe('UserAlreadyExistsException');
    expect(exception.message).toBe(`Usuario con email ${email} ya existe`);
  });
  it('should work with different emails', () => {
    const email = 'another@test.com';
    const exception = new UserAlreadyExistsException(email);
    expect(exception.message).toBe(`Usuario con email ${email} ya existe`);
  });
});
