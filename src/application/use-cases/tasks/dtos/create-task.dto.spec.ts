import { validate } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { TaskPriority, TaskStatus } from '@domain/tasks/entities/task.entity';
const createTaskDto = (data: Partial<CreateTaskDto> = {}) => {
  return Object.assign(new CreateTaskDto(), data);
};
describe('CreateTaskDto', () => {
  describe('validación de title', () => {
    it('debería validar un título válido', async () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un título vacío', async () => {
      const taskDto = createTaskDto({
        title: '',
        description: 'Implementar sistema de autenticación con JWT tokens',
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe('El título es requerido');
    });
    it('debería rechazar un título que no sea string', async () => {
      const taskDto = createTaskDto({
        description: 'Implementar sistema de autenticación con JWT tokens',
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      (taskDto as any).title = 123;
      const errors = await validate(taskDto);
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
        const taskDto = createTaskDto({
          title,
          description: 'Description',
          dueDate: '2024-12-31T23:59:59.000Z',
        });
        const errors = await validate(taskDto);
        expect(errors).toHaveLength(0);
      }
    });
  });
  describe('validación de description', () => {
    it('debería validar una descripción válida', async () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar una descripción vacía', async () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: '',
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'La descripción es requerida',
      );
    });
    it('debería rechazar una descripción que no sea string', async () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      (taskDto as any).description = 123;
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isString).toBe(
        'La descripción debe ser una cadena de texto',
      );
    });
    it('debería validar descripciones largas', async () => {
      const longDescription = 'a'.repeat(1000);
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: longDescription,
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación de dueDate', () => {
    it('debería validar una fecha válida', async () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar una fecha vacía', async () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        dueDate: '',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBe(
        'La fecha de vencimiento es requerida',
      );
    });
    it('debería rechazar una fecha inválida', async () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        dueDate: 'invalid-date',
      });
      const errors = await validate(taskDto);
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
        const taskDto = createTaskDto({
          title: 'Implementar autenticación JWT',
          description: 'Implementar sistema de autenticación con JWT tokens',
          dueDate: date,
        });
        const errors = await validate(taskDto);
        expect(errors).toHaveLength(0);
      }
    });
    it('debería validar fechas futuras', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        dueDate: futureDate,
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación de status', () => {
    it('debería validar un status válido', async () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        status: TaskStatus.TODO,
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería validar todos los status válidos', async () => {
      const validStatuses = [
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.DONE,
      ];
      for (const status of validStatuses) {
        const taskDto = createTaskDto({
          title: 'Implementar autenticación JWT',
          description: 'Implementar sistema de autenticación con JWT tokens',
          status,
          dueDate: '2024-12-31T23:59:59.000Z',
        });
        const errors = await validate(taskDto);
        expect(errors).toHaveLength(0);
      }
    });
    it('debería ser opcional', async () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación de priority', () => {
    it('debería validar una prioridad válida', async () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        priority: TaskPriority.MEDIUM,
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería validar todas las prioridades válidas', async () => {
      const validPriorities = [
        TaskPriority.LOW,
        TaskPriority.MEDIUM,
        TaskPriority.HIGH,
      ];
      for (const priority of validPriorities) {
        const taskDto = createTaskDto({
          title: 'Implementar autenticación JWT',
          description: 'Implementar sistema de autenticación con JWT tokens',
          priority,
          dueDate: '2024-12-31T23:59:59.000Z',
        });
        const errors = await validate(taskDto);
        expect(errors).toHaveLength(0);
      }
    });
    it('debería ser opcional', async () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación completa', () => {
    it('debería validar un DTO completo válido', async () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería rechazar un DTO con múltiples errores', async () => {
      const taskDto = createTaskDto({
        title: '',
        description: '',
        dueDate: 'invalid-date',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(3);
      const titleError = errors.find((e) => e.property === 'title');
      const descriptionError = errors.find((e) => e.property === 'description');
      const dueDateError = errors.find((e) => e.property === 'dueDate');
      expect(titleError?.constraints?.isNotEmpty).toBe(
        'El título es requerido',
      );
      expect(descriptionError?.constraints?.isNotEmpty).toBe(
        'La descripción es requerida',
      );
      expect(dueDateError?.constraints?.isDateString).toBe(
        'La fecha de vencimiento debe ser una fecha válida',
      );
    });
    it('debería rechazar un DTO completamente vacío', async () => {
      const taskDto = createTaskDto({});
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(3);
      const titleError = errors.find((e) => e.property === 'title');
      const descriptionError = errors.find((e) => e.property === 'description');
      const dueDateError = errors.find((e) => e.property === 'dueDate');
      expect(titleError?.constraints?.isNotEmpty).toBe(
        'El título es requerido',
      );
      expect(descriptionError?.constraints?.isNotEmpty).toBe(
        'La descripción es requerida',
      );
      expect(dueDateError?.constraints?.isNotEmpty).toBe(
        'La fecha de vencimiento es requerida',
      );
    });
  });
  describe('propiedades readonly', () => {
    it('debería tener propiedades readonly', () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      expect(taskDto).toHaveProperty('title');
      expect(taskDto).toHaveProperty('description');
      expect(taskDto).toHaveProperty('status');
      expect(taskDto).toHaveProperty('priority');
      expect(taskDto).toHaveProperty('dueDate');
    });
    it('debería permitir leer valores de las propiedades', () => {
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      expect(taskDto.title).toBe('Implementar autenticación JWT');
      expect(taskDto.description).toBe(
        'Implementar sistema de autenticación con JWT tokens',
      );
      expect(taskDto.status).toBe(TaskStatus.TODO);
      expect(taskDto.priority).toBe(TaskPriority.MEDIUM);
      expect(taskDto.dueDate).toBe('2024-12-31T23:59:59.000Z');
    });
  });
  describe('estructura del DTO', () => {
    it('debería estar definido', () => {
      expect(CreateTaskDto).toBeDefined();
    });
    it('debería poder crear una instancia', () => {
      const taskDto = createTaskDto({
        title: 'Test',
        description: 'Test description',
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      expect(taskDto).toBeInstanceOf(CreateTaskDto);
    });
  });
  describe('validación de límites', () => {
    it('debería validar títulos muy largos', async () => {
      const longTitle = 'a'.repeat(1000);
      const taskDto = createTaskDto({
        title: longTitle,
        description: 'Implementar sistema de autenticación con JWT tokens',
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(0);
    });
    it('debería validar fechas muy lejanas en el futuro', async () => {
      const farFutureDate = new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const taskDto = createTaskDto({
        title: 'Implementar autenticación JWT',
        description: 'Implementar sistema de autenticación con JWT tokens',
        dueDate: farFutureDate,
      });
      const errors = await validate(taskDto);
      expect(errors).toHaveLength(0);
    });
  });
  describe('validación de caracteres especiales', () => {
    it('debería validar títulos con caracteres especiales', async () => {
      const taskDto = createTaskDto({
        title:
          'Implementar sistema de autenticación con caracteres especiales!@#$%^&*()',
        description: 'Descripción con caracteres especiales: áéíóú ñ ç ß 密碼',
        dueDate: '2024-12-31T23:59:59.000Z',
      });
      const errors = await validate(taskDto);
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
        const taskDto = createTaskDto({
          title: 'Implementar autenticación JWT',
          description: 'Implementar sistema de autenticación con JWT tokens',
          dueDate: date,
        });
        const errors = await validate(taskDto);
        expect(errors).toHaveLength(0);
      }
    });
  });
});
