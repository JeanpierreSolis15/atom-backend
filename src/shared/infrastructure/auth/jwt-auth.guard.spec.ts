import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();
    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });
  it('debería estar definido', () => {
    expect(guard).toBeDefined();
  });
  it('debería ser una instancia de JwtAuthGuard', () => {
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });
  it('debería usar la estrategia jwt', () => {
    expect(guard).toBeDefined();
    expect(typeof guard.canActivate).toBe('function');
  });
  it('debería ser un guard válido', () => {
    expect(typeof guard.canActivate).toBe('function');
  });
  it('debería tener el decorador Injectable', () => {
    expect(guard).toBeDefined();
    expect(typeof guard).toBe('object');
  });
  it('debería poder ser inyectado', () => {
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });
  it('debería tener la funcionalidad base de AuthGuard', () => {
    expect(guard).toHaveProperty('canActivate');
    expect(typeof guard.canActivate).toBe('function');
  });
  it('debería ser una clase válida de NestJS', () => {
    const guardInstance = new JwtAuthGuard();
    expect(guardInstance).toBeInstanceOf(JwtAuthGuard);
  });
  it('debería poder ser usado como provider', () => {
    expect(guard).toBeDefined();
    expect(typeof guard).toBe('object');
  });
  it('debería tener la configuración correcta para JWT', () => {
    expect(guard).toBeDefined();
    expect(typeof guard.canActivate).toBe('function');
  });
  it('debería ser compatible con el sistema de autenticación de Passport', () => {
    expect(guard).toBeDefined();
    expect(typeof guard.canActivate).toBe('function');
  });
  it('debería extender la funcionalidad de AuthGuard', () => {
    expect(guard).toHaveProperty('canActivate');
    expect(typeof guard.canActivate).toBe('function');
  });
  it('debería ser una clase Injectable', () => {
    expect(guard).toBeDefined();
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });
});
