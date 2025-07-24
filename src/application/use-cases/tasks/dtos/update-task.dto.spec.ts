import { validate } from 'class-validator';
import { UpdateTaskDto } from './update-task.dto';
import { TaskPriority, TaskStatus } from '@domain/tasks/entities/task.entity';
const createUpdateTaskDto = (data: Partial<UpdateTaskDto> = {}) => {
  return Object.assign(new UpdateTaskDto(), data);
};
describe('UpdateTaskDto', () => {
  describe('validación de title', () => {
    it('debería validar un título válido', async () => {
      const updateTaskDto = createUpdateTaskDto({
        title: 'Implementar autenticación JWT',
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un título vacío', async () => {
      const updateTaskDto = createUpdateTaskDto({
        title: '',
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'El título no puede estar vacío',
      );
    });
    it('debería rechazar un título que no sea string', async () => {
      const updateTaskDto = createUpdateTaskDto({});
      (updateTaskDto as any).title = 123;
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'El título debe ser una cadena de texto',
      );
    });
    it('debería validar títulos con caracteres especiales', async () => {
      const validTitles = [
        'Implementar autenticación JWT',
        'Fix bug #123',
        'Update API endpoints',
        'Refactor user service',
        'Add unit tests',
        '密碼 implementation',
        'Implementar sistema de autenticación con caracteres especiales!@#$%',
      ];
      for (const title of validTitles) {
        const updateTaskDto = createUpdateTaskDto({ title });
        const errors = await validate(updateTaskDto);
        expect(errors).toHaveLength(0);
      }
    });
  });
  describe('validación de description', () => {
    it('debería validar una descripción válida', async () => {
      const updateTaskDto = createUpdateTaskDto({
        description: 'Implementar sistema de autenticación con JWT tokens',
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar una descripción vacía', async () => {
      const updateTaskDto = createUpdateTaskDto({
        description: '',
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'La descripción no puede estar vacía',
      );
    });
    it('debería rechazar una descripción que no sea string', async () => {
      const updateTaskDto = createUpdateTaskDto({});
      (updateTaskDto as any).description = 123;
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'La descripción debe ser una cadena de texto',
      );
    });
    it('debería validar descripciones largas', async () => {
      const longDescription = 'a'.repeat(1000);
      const updateTaskDto = createUpdateTaskDto({
        description: longDescription,
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación de status', () => {
    it('debería validar un status válido', async () => {
      const updateTaskDto = createUpdateTaskDto({
        status: TaskStatus.IN_PROGRESS,
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería validar todos los status válidos', async () => {
      const validStatuses = [
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.DONE,
      ];
      for (const status of validStatuses) {
        const updateTaskDto = createUpdateTaskDto({ status });
        const errors = await validate(updateTaskDto);
        expect(errors).toHaveLength(0);
      }
    });
    it('debería ser opcional', async () => {
      const updateTaskDto = createUpdateTaskDto({});
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación de priority', () => {
    it('debería validar una prioridad válida', async () => {
      const updateTaskDto = createUpdateTaskDto({
        priority: TaskPriority.HIGH,
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería validar todas las prioridades válidas', async () => {
      const validPriorities = [
        TaskPriority.LOW,
        TaskPriority.MEDIUM,
        TaskPriority.HIGH,
      ];
      for (const priority of validPriorities) {
        const updateTaskDto = createUpdateTaskDto({ priority });
        const errors = await validate(updateTaskDto);
        expect(errors).toHaveLength(0);
      }
    });
    it('debería ser opcional', async () => {
      const updateTaskDto = createUpdateTaskDto({});
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación de dueDate', () => {
    it('debería validar una fecha válida', async () => {
      const updateTaskDto = createUpdateTaskDto({
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar una fecha inválida', async () => {
      const updateTaskDto = createUpdateTaskDto({
        dueDate: 'invalid-date',
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isDateString).toBe(
        'La fecha de vencimiento debe ser una fecha válida',
      );
    });
    it('debería validar diferentes formatos de fecha válidos', async () => {
      const validDates = [
        '2024-12-31T23:59:59.000Z',
        '2024-12-31T00:00:00.000Z',
        '2024-01-01T12:00:00.000Z',
      ];
      for (const date of validDates) {
        const updateTaskDto = createUpdateTaskDto({ dueDate: date });
        const errors = await validate(updateTaskDto);
        expect(errors).toHaveLength(0);
      }
    });
    it('debería validar fechas futuras', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const updateTaskDto = createUpdateTaskDto({
        dueDate: futureDate,
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería ser opcional', async () => {
      const updateTaskDto = createUpdateTaskDto({});
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación completa', () => {
    it('debería validar un DTO completo válido', async () => {
      const updateTaskDto = createUpdateTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un DTO con múltiples errores', async () => {
      const updateTaskDto = createUpdateTaskDto({
        title: '',
        description: '',
        dueDate: 'invalid-date',
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(3);
      const titleError = errors.find((e) => e.property === 'title');
      const descriptionError = errors.find((e) => e.property === 'description');
      const dueDateError = errors.find((e) => e.property === 'dueDate');
      expect(titleError?.constraints?.isNotEmpty).toBe(
        'El título no puede estar vacío',
      );
      expect(descriptionError?.constraints?.isNotEmpty).toBe(
        'La descripción no puede estar vacía',
      );
      expect(dueDateError?.constraints?.isDateString).toBe(
        'La fecha de vencimiento debe ser una fecha válida',
      );
    });
    it('debería validar un DTO completamente vacío', async () => {
      const updateTaskDto = createUpdateTaskDto({});
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('actualizaciones parciales', () => {
    it('debería permitir actualizar solo el título', async () => {
      const updateTaskDto = createUpdateTaskDto({
        title: 'Nuevo título',
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería permitir actualizar solo el status', async () => {
      const updateTaskDto = createUpdateTaskDto({
        status: TaskStatus.DONE,
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería permitir actualizar solo la prioridad', async () => {
      const updateTaskDto = createUpdateTaskDto({
        priority: TaskPriority.LOW,
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería permitir actualizar solo la fecha', async () => {
      const updateTaskDto = createUpdateTaskDto({
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('propiedades readonly', () => {
    it('debería tener propiedades readonly', () => {
      const updateTaskDto = createUpdateTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      expect(updateTaskDto).toHaveProperty('title');
      expect(updateTaskDto).toHaveProperty('description');
      expect(updateTaskDto).toHaveProperty('status');
      expect(updateTaskDto).toHaveProperty('priority');
      expect(updateTaskDto).toHaveProperty('dueDate');
    });
    it('debería permitir leer valores de las propiedades', () => {
      const updateTaskDto = createUpdateTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      expect(updateTaskDto.title).toBe('Implementar autenticación JWT');
      expect(updateTaskDto.description).toBe(
        'Implementar sistema de autenticación con JWT tokens',
      );
      expect(updateTaskDto.status).toBe(TaskStatus.IN_PROGRESS);
      expect(updateTaskDto.priority).toBe(TaskPriority.HIGH);
      expect(updateTaskDto.dueDate).toBe('2024-12-31T23:59:59.000Z');
    });
  });
  describe('estructura del DTO', () => {
    it('debería estar definido', () => {
      expect(UpdateTaskDto).toBeDefined();
    });
    it('debería poder crear una instancia', () => {
      const updateTaskDto = createUpdateTaskDto({
        title: 'Test',
        description: 'Test description',
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      expect(updateTaskDto).toBeInstanceOf(UpdateTaskDto);
    });
  });
  describe('validación de límites', () => {
    it('debería validar títulos muy largos', async () => {
      const longTitle = 'a'.repeat(1000);
      const updateTaskDto = createUpdateTaskDto({
        title: longTitle,
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería validar fechas muy lejanas en el futuro', async () => {
      const farFutureDate = new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const updateTaskDto = createUpdateTaskDto({
        dueDate: farFutureDate,
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación de caracteres especiales', () => {
    it('debería validar títulos con caracteres especiales', async () => {
      const updateTaskDto = createUpdateTaskDto({
        title:
          'Implementar sistema de autenticación con caracteres especiales!@#$%^&*()',
        description: 'Descripción con caracteres especiales: áéíóú ñ ç ß 密碼',
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación de fechas específicas', () => {
    it('debería validar fechas en diferentes zonas horarias', async () => {
      const dates = [
        '2024-12-31T23:59:59.000Z',
        '2024-12-31T23:59:59.000+00:00',
        '2024-12-31T23:59:59.000-05:00',
      ];
      for (const date of dates) {
        const updateTaskDto = createUpdateTaskDto({ dueDate: date });
        const errors = await validate(updateTaskDto);
        expect(errors).toHaveLength(0);
      }
    });
  });
  describe('casos edge', () => {
    it('debería manejar valores undefined correctamente', async () => {
      const updateTaskDto = createUpdateTaskDto({
        title: undefined,
        description: undefined,
        status: undefined,
        priority: undefined,
        dueDate: undefined,
      });
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería manejar valores null correctamente', async () => {
      const updateTaskDto = createUpdateTaskDto({});
      (updateTaskDto as any).title = null;
      (updateTaskDto as any).description = null;
      (updateTaskDto as any).status = null;
      (updateTaskDto as any).priority = null;
      (updateTaskDto as any).dueDate = null;
      const errors = await validate(updateTaskDto);
      expect(errors).toHaveLength(0);
    });
  });
});
