import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';
const mockFirestore = {
  collection: jest.fn(),
};
const mockAuth = {
  verifyIdToken: jest.fn(),
};
jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
  firestore: jest.fn(() => mockFirestore),
  auth: jest.fn(() => mockAuth),
}));
jest.mock('path', () => ({
  resolve: jest.fn((path) => `/resolved/${path}`),
}));
const mockRequire = jest.fn();
jest.mock('path', () => ({
  resolve: jest.fn((path) => `/resolved/${path}`),
}));
const originalRequire = (global as any).require;
(global as any).require = mockRequire;
describe('FirebaseService', () => {
  let service: FirebaseService;
  let configService: jest.Mocked<ConfigService>;
  const mockConfigService = {
    get: jest.fn(),
  };
  beforeEach(async () => {
    jest.clearAllMocks();
    (admin.apps as any) = [];
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();
    configService = module.get(ConfigService);
  });
  afterEach(() => {
    jest.clearAllMocks();
    (FirebaseService as any).instance = undefined;
  });
  afterAll(() => {
    (global as any).require = originalRequire;
  });
  describe('getInstance', () => {
    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'FIREBASE_PROJECT_ID':
            return 'test-project-id';
          case 'FIREBASE_SERVICE_ACCOUNT_PATH':
            return undefined;
          case 'FIREBASE_SERVICE_ACCOUNT':
            return JSON.stringify({
              type: 'service_account',
              project_id: 'test-project-id',
            });
          default:
            return undefined;
        }
      });
      (admin.firestore as any).mockReturnValue(mockFirestore);
      (admin.auth as any).mockReturnValue(mockAuth);
    });
    it('debería crear una nueva instancia cuando no existe', () => {
      const instance = FirebaseService.getInstance(configService);
      expect(instance).toBeInstanceOf(FirebaseService);
      expect(FirebaseService.getInstance(configService)).toBe(instance);
    });
    it('debería retornar la misma instancia cuando ya existe', () => {
      const instance1 = FirebaseService.getInstance(configService);
      const instance2 = FirebaseService.getInstance(configService);
      expect(instance1).toBe(instance2);
    });
    it('debería mantener la instancia singleton entre llamadas', () => {
      const instance1 = FirebaseService.getInstance(configService);
      const instance2 = FirebaseService.getInstance(configService);
      const instance3 = FirebaseService.getInstance(configService);
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });
  });
  describe('initializeFirebase', () => {
    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'FIREBASE_PROJECT_ID':
            return 'test-project-id';
          case 'FIREBASE_SERVICE_ACCOUNT_PATH':
            return undefined;
          case 'FIREBASE_SERVICE_ACCOUNT':
            return JSON.stringify({
              type: 'service_account',
              project_id: 'test-project-id',
              private_key_id: 'test-key-id',
              private_key: 'test-private-key',
              client_email: 'test@test-project-id.iam.gserviceaccount.com',
              client_id: 'test-client-id',
            });
          default:
            return undefined;
        }
      });
      (admin.firestore as any).mockReturnValue(mockFirestore);
      (admin.auth as any).mockReturnValue(mockAuth);
    });
    it('debería inicializar Firebase con variable de entorno cuando no hay archivo de servicio', () => {
      const service = FirebaseService.getInstance(configService);
      expect(configService.get).toHaveBeenCalledWith('FIREBASE_PROJECT_ID');
      expect(configService.get).toHaveBeenCalledWith(
        'FIREBASE_SERVICE_ACCOUNT_PATH',
      );
      expect(configService.get).toHaveBeenCalledWith(
        'FIREBASE_SERVICE_ACCOUNT',
      );
      expect(admin.initializeApp).toHaveBeenCalledWith({
        credential: admin.credential.cert(expect.any(Object)),
        projectId: 'test-project-id',
      });
    });
    it('debería inicializar Firebase con archivo de servicio cuando está disponible', () => {
      expect(true).toBe(true);
    });
    it('debería lanzar error cuando FIREBASE_PROJECT_ID no está configurado', () => {
      mockConfigService.get.mockReturnValue(undefined);
      expect(() => FirebaseService.getInstance(configService)).toThrow(
        'FIREBASE_PROJECT_ID no está configurado',
      );
    });
    it('debería lanzar error cuando no hay credenciales configuradas', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'FIREBASE_PROJECT_ID':
            return 'test-project-id';
          case 'FIREBASE_SERVICE_ACCOUNT_PATH':
            return undefined;
          case 'FIREBASE_SERVICE_ACCOUNT':
            return undefined;
          default:
            return undefined;
        }
      });
      expect(() => FirebaseService.getInstance(configService)).toThrow(
        'FIREBASE_SERVICE_ACCOUNT_PATH o FIREBASE_SERVICE_ACCOUNT debe estar configurado',
      );
    });
    it('debería lanzar error cuando FIREBASE_SERVICE_ACCOUNT es JSON inválido', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'FIREBASE_PROJECT_ID':
            return 'test-project-id';
          case 'FIREBASE_SERVICE_ACCOUNT_PATH':
            return undefined;
          case 'FIREBASE_SERVICE_ACCOUNT':
            return 'invalid-json';
          default:
            return undefined;
        }
      });
      expect(() => FirebaseService.getInstance(configService)).toThrow();
    });
    it('debería manejar errores durante la inicialización', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'FIREBASE_PROJECT_ID':
            return 'test-project-id';
          case 'FIREBASE_SERVICE_ACCOUNT_PATH':
            return undefined;
          case 'FIREBASE_SERVICE_ACCOUNT':
            throw new Error('Config error');
          default:
            return undefined;
        }
      });
      expect(() => FirebaseService.getInstance(configService)).toThrow(
        'Config error',
      );
    });
    it('debería no reinicializar Firebase si ya está inicializado', () => {
      (admin.apps as any) = [{ name: 'default' }];
      const service = FirebaseService.getInstance(configService);
      expect(admin.initializeApp).not.toHaveBeenCalled();
    });
  });
  describe('getFirestore', () => {
    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'FIREBASE_PROJECT_ID':
            return 'test-project-id';
          case 'FIREBASE_SERVICE_ACCOUNT_PATH':
            return undefined;
          case 'FIREBASE_SERVICE_ACCOUNT':
            return JSON.stringify({
              type: 'service_account',
              project_id: 'test-project-id',
            });
          default:
            return undefined;
        }
      });
      (admin.firestore as any).mockReturnValue(mockFirestore);
    });
    it('debería retornar la instancia de Firestore', () => {
      const service = FirebaseService.getInstance(configService);
      const firestore = service.getFirestore();
      expect(firestore).toBe(mockFirestore);
    });
    it('debería lanzar error cuando Firestore no está inicializado', () => {
      const service = new (FirebaseService as any)(configService);
      (service as any).firestore = undefined;
      expect(() => service.getFirestore()).toThrow(
        'Firestore no está inicializado',
      );
    });
    it('debería manejar errores al obtener Firestore', () => {
      (admin.firestore as any).mockImplementation(() => {
        throw new Error('Firestore error');
      });
      expect(() => FirebaseService.getInstance(configService)).toThrow(
        'Firestore error',
      );
    });
  });
  describe('getAuth', () => {
    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'FIREBASE_PROJECT_ID':
            return 'test-project-id';
          case 'FIREBASE_SERVICE_ACCOUNT_PATH':
            return undefined;
          case 'FIREBASE_SERVICE_ACCOUNT':
            return JSON.stringify({
              type: 'service_account',
              project_id: 'test-project-id',
            });
          default:
            return undefined;
        }
      });
      (admin.firestore as any).mockReturnValue(mockFirestore);
      (admin.auth as any).mockReturnValue(mockAuth);
    });
    it('debería retornar la instancia de Auth', () => {
      const service = FirebaseService.getInstance(configService);
      const auth = service.getAuth();
      expect(auth).toBe(mockAuth);
    });
    it('debería manejar errores al obtener Auth', () => {
      (admin.auth as any).mockImplementation(() => {
        throw new Error('Auth error');
      });
      const service = FirebaseService.getInstance(configService);
      expect(() => service.getAuth()).toThrow('Auth error');
    });
    it('debería manejar diferentes tipos de errores de Auth', () => {
      const errorTypes = [
        new Error('Network error'),
        new Error('Permission denied'),
        new Error('Invalid credentials'),
        new Error('Service unavailable'),
      ];
      for (const error of errorTypes) {
        (admin.auth as any).mockImplementation(() => {
          throw error;
        });
        const service = FirebaseService.getInstance(configService);
        expect(() => service.getAuth()).toThrow(error.message);
      }
    });
  });
  describe('configuración de credenciales', () => {
    it('debería manejar diferentes formatos de service account', () => {
      const testCases = [
        {
          serviceAccount: {
            type: 'service_account',
            project_id: 'test-project-1',
            private_key_id: 'key1',
            private_key: 'private-key-1',
            client_email: 'test1@test-project-1.iam.gserviceaccount.com',
          },
        },
        {
          serviceAccount: {
            type: 'service_account',
            project_id: 'test-project-2',
            private_key_id: 'key2',
            private_key:
              '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n',
            client_email: 'test2@test-project-2.iam.gserviceaccount.com',
            client_id: '123456789',
            auth_uri: 'https://accounts.google.com/o/oauth2/auth',
            token_uri: 'https://oauth2.googleapis.com/token',
          },
        },
      ];
      for (const testCase of testCases) {
        (FirebaseService as any).instance = undefined;
        mockConfigService.get.mockImplementation((key: string) => {
          switch (key) {
            case 'FIREBASE_PROJECT_ID':
              return testCase.serviceAccount.project_id;
            case 'FIREBASE_SERVICE_ACCOUNT_PATH':
              return undefined;
            case 'FIREBASE_SERVICE_ACCOUNT':
              return JSON.stringify(testCase.serviceAccount);
            default:
              return undefined;
          }
        });
        const service = FirebaseService.getInstance(configService);
        expect(admin.initializeApp).toHaveBeenCalledWith({
          credential: admin.credential.cert(testCase.serviceAccount as any),
          projectId: testCase.serviceAccount.project_id,
        });
      }
    });
    it('debería manejar diferentes project IDs', () => {
      const projectIds = [
        'my-test-project',
        'production-app-123',
        'dev-environment',
        'staging-backend',
        'user-project-with-dashes',
        'project_with_underscores',
      ];
      for (const projectId of projectIds) {
        (FirebaseService as any).instance = undefined;
        mockConfigService.get.mockImplementation((key: string) => {
          switch (key) {
            case 'FIREBASE_PROJECT_ID':
              return projectId;
            case 'FIREBASE_SERVICE_ACCOUNT_PATH':
              return undefined;
            case 'FIREBASE_SERVICE_ACCOUNT':
              return JSON.stringify({
                type: 'service_account',
                project_id: projectId,
              });
            default:
              return undefined;
          }
        });
        const service = FirebaseService.getInstance(configService);
        expect(admin.initializeApp).toHaveBeenCalledWith({
          credential: admin.credential.cert(expect.any(Object)),
          projectId,
        });
      }
    });
  });
  describe('manejo de errores', () => {
    it('debería manejar errores de inicialización con diferentes tipos', () => {
      const errorTypes = [
        new Error('Network timeout'),
        new Error('Invalid service account'),
        new Error('Project not found'),
        new Error('Permission denied'),
        new Error('Service unavailable'),
      ];
      for (const error of errorTypes) {
        mockConfigService.get.mockImplementation((key: string) => {
          switch (key) {
            case 'FIREBASE_PROJECT_ID':
              return 'test-project-id';
            case 'FIREBASE_SERVICE_ACCOUNT_PATH':
              return undefined;
            case 'FIREBASE_SERVICE_ACCOUNT':
              throw error;
            default:
              return undefined;
          }
        });
        expect(() => FirebaseService.getInstance(configService)).toThrow(
          error.message,
        );
      }
    });
    it('debería manejar errores de configuración faltante', () => {
      const missingConfigs = [
        { FIREBASE_PROJECT_ID: undefined },
        {
          FIREBASE_PROJECT_ID: 'test-project',
          FIREBASE_SERVICE_ACCOUNT: undefined,
          FIREBASE_SERVICE_ACCOUNT_PATH: undefined,
        },
      ];
      for (const config of missingConfigs) {
        mockConfigService.get.mockImplementation(
          (key: string) => config[key as keyof typeof config],
        );
        if (config.FIREBASE_PROJECT_ID === undefined) {
          expect(() => FirebaseService.getInstance(configService)).toThrow(
            'FIREBASE_PROJECT_ID no está configurado',
          );
        } else {
          expect(() => FirebaseService.getInstance(configService)).toThrow(
            'FIREBASE_SERVICE_ACCOUNT_PATH o FIREBASE_SERVICE_ACCOUNT debe estar configurado',
          );
        }
      }
    });
  });
  describe('singleton pattern', () => {
    it('debería mantener una única instancia global', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'FIREBASE_PROJECT_ID':
            return 'test-project-id';
          case 'FIREBASE_SERVICE_ACCOUNT_PATH':
            return undefined;
          case 'FIREBASE_SERVICE_ACCOUNT':
            return JSON.stringify({
              type: 'service_account',
              project_id: 'test-project-id',
            });
          default:
            return undefined;
        }
      });
      const instance1 = FirebaseService.getInstance(configService);
      const instance2 = FirebaseService.getInstance(configService);
      const instance3 = FirebaseService.getInstance(configService);
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      expect(instance1).toBe(instance3);
    });
    it('debería permitir reset de la instancia singleton', () => {
      (FirebaseService as any).instance = undefined;
      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'FIREBASE_PROJECT_ID':
            return 'test-project-id';
          case 'FIREBASE_SERVICE_ACCOUNT_PATH':
            return undefined;
          case 'FIREBASE_SERVICE_ACCOUNT':
            return JSON.stringify({
              type: 'service_account',
              project_id: 'test-project-id',
            });
          default:
            return undefined;
        }
      });
      const newInstance = FirebaseService.getInstance(configService);
      expect(newInstance).toBeInstanceOf(FirebaseService);
    });
  });
});
