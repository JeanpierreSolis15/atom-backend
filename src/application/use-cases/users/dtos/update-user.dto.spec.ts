import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';
const createUpdateUserDto = (data: Partial<UpdateUserDto> = {}) => {
  return Object.assign(new UpdateUserDto(), data);
};
describe('UpdateUserDto', () => {
  describe('validación de name', () => {
    it('debería validar un nombre válido', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 'Juan',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un nombre vacío', async () => {
      const updateUserDto = createUpdateUserDto({
        name: '',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'El nombre no puede estar vacío',
      );
    });
    it('debería aceptar un nombre con solo espacios (propiedad opcional)', async () => {
      const updateUserDto = createUpdateUserDto({
        name: '   ',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un nombre que no sea string', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 123 as any,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'El nombre debe ser una cadena de texto',
      );
    });
    it('debería aceptar un nombre que sea null (propiedad opcional)', async () => {
      const updateUserDto = createUpdateUserDto({
        name: null as any,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería aceptar un nombre que sea undefined (propiedad opcional)', async () => {
      const updateUserDto = createUpdateUserDto({
        name: undefined as any,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería aceptar un nombre con caracteres especiales', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 'José María',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería aceptar un nombre con números', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 'Juan123',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería aceptar un nombre con caracteres Unicode', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 'José María Ñoño',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería aceptar un nombre muy largo', async () => {
      const longName = 'A'.repeat(100);
      const updateUserDto = createUpdateUserDto({
        name: longName,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería aceptar un nombre con un solo carácter', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 'A',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación de lastName', () => {
    it('debería validar un apellido válido', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: 'Pérez',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un apellido vacío', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: '',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'El apellido no puede estar vacío',
      );
    });
    it('debería aceptar un apellido con solo espacios (propiedad opcional)', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: '   ',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un apellido que no sea string', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: 456 as any,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'El apellido debe ser una cadena de texto',
      );
    });
    it('debería aceptar un apellido que sea null (propiedad opcional)', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: null as any,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería aceptar un apellido que sea undefined (propiedad opcional)', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: undefined as any,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería aceptar un apellido con caracteres especiales', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: 'García-López',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería aceptar un apellido con números', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: 'Pérez123',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería aceptar un apellido con caracteres Unicode', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: 'García Ñoño',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería aceptar un apellido muy largo', async () => {
      const longLastName = 'B'.repeat(100);
      const updateUserDto = createUpdateUserDto({
        lastName: longLastName,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería aceptar un apellido con un solo carácter', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: 'B',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación de propiedades opcionales', () => {
    it('debería validar un DTO sin propiedades', async () => {
      const updateUserDto = createUpdateUserDto();
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería validar un DTO solo con name', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 'Juan',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería validar un DTO solo con lastName', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: 'Pérez',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería validar un DTO con ambas propiedades', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 'Juan',
        lastName: 'Pérez',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un DTO con name inválido y lastName válido', async () => {
      const updateUserDto = createUpdateUserDto({
        name: '',
        lastName: 'Pérez',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'El nombre no puede estar vacío',
      );
    });
    it('debería rechazar un DTO con name válido y lastName inválido', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 'Juan',
        lastName: '',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('lastName');
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'El apellido no puede estar vacío',
      );
    });
    it('debería rechazar un DTO con ambas propiedades inválidas', async () => {
      const updateUserDto = createUpdateUserDto({
        name: '',
        lastName: '',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(2);
      const nameError = errors.find((error) => error.property === 'name');
      const lastNameError = errors.find(
        (error) => error.property === 'lastName',
      );
      expect(nameError?.constraints?.isNotEmpty).toBe(
        'El nombre no puede estar vacío',
      );
      expect(lastNameError?.constraints?.isNotEmpty).toBe(
        'El apellido no puede estar vacío',
      );
    });
  });
  describe('casos edge', () => {
    it('debería manejar nombres con espacios al inicio y final', async () => {
      const updateUserDto = createUpdateUserDto({
        name: '  Juan  ',
        lastName: '  Pérez  ',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería manejar nombres con tabulaciones', async () => {
      const updateUserDto = createUpdateUserDto({
        name: '\tJuan\t',
        lastName: '\tPérez\t',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería manejar nombres con saltos de línea', async () => {
      const updateUserDto = createUpdateUserDto({
        name: '\nJuan\n',
        lastName: '\nPérez\n',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería manejar nombres con caracteres de control', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 'Juan\x00',
        lastName: 'Pérez\x00',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería manejar nombres con emojis', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 'Juan 😀',
        lastName: 'Pérez 🎉',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería manejar nombres con caracteres de diferentes idiomas', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 'José María',
        lastName: 'García-López',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería manejar nombres con caracteres chinos', async () => {
      const updateUserDto = createUpdateUserDto({
        name: '张伟',
        lastName: '李娜',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería manejar nombres con caracteres árabes', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 'أحمد',
        lastName: 'محمد',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
    it('debería manejar nombres con caracteres cirílicos', async () => {
      const updateUserDto = createUpdateUserDto({
        name: 'Иван',
        lastName: 'Петров',
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación de tipos de datos', () => {
    it('debería rechazar un objeto como name', async () => {
      const updateUserDto = createUpdateUserDto({
        name: {} as any,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'El nombre debe ser una cadena de texto',
      );
    });
    it('debería rechazar un array como name', async () => {
      const updateUserDto = createUpdateUserDto({
        name: [] as any,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'El nombre debe ser una cadena de texto',
      );
    });
    it('debería rechazar un boolean como name', async () => {
      const updateUserDto = createUpdateUserDto({
        name: true as any,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'El nombre debe ser una cadena de texto',
      );
    });
    it('debería rechazar un objeto como lastName', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: {} as any,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'El apellido debe ser una cadena de texto',
      );
    });
    it('debería rechazar un array como lastName', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: [] as any,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'El apellido debe ser una cadena de texto',
      );
    });
    it('debería rechazar un boolean como lastName', async () => {
      const updateUserDto = createUpdateUserDto({
        lastName: false as any,
      });
      const errors = await validate(updateUserDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'El apellido debe ser una cadena de texto',
      );
    });
  });
  describe('validación de propiedades readonly', () => {
    it('debería permitir asignación durante la creación', () => {
      const updateUserDto = createUpdateUserDto({
        name: 'Juan',
        lastName: 'Pérez',
      });
      expect(updateUserDto.name).toBe('Juan');
      expect(updateUserDto.lastName).toBe('Pérez');
    });
    it('debería tener propiedades readonly definidas en el tipo', () => {
      const updateUserDto = new UpdateUserDto();
      expect(updateUserDto).toBeInstanceOf(UpdateUserDto);
      expect(typeof updateUserDto.name).toBe('undefined');
      expect(typeof updateUserDto.lastName).toBe('undefined');
    });
  });
});
