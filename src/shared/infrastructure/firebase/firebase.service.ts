import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';
@Injectable()
export class FirebaseService {
  private static instance: FirebaseService;
  private firestore: admin.firestore.Firestore;
  private readonly logger = new Logger(FirebaseService.name);
  private constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }
  public static getInstance(configService: ConfigService): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService(configService);
    }
    return FirebaseService.instance;
  }
  private initializeFirebase(): void {
    this.logger.log('Inicializando Firebase...');
    try {
      if (!admin.apps.length) {
        const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
        if (!projectId) {
          this.logger.error('FIREBASE_PROJECT_ID no está configurado');
          throw new Error('FIREBASE_PROJECT_ID no está configurado');
        }
        this.logger.debug(`Proyecto Firebase: ${projectId}`);
        const serviceAccountPath = this.configService.get<string>(
          'FIREBASE_SERVICE_ACCOUNT_PATH',
        );
        if (serviceAccountPath) {
          this.logger.debug(
            `Usando archivo de servicio: ${serviceAccountPath}`,
          );
          const serviceAccount = require(path.resolve(serviceAccountPath));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId,
          });
          this.logger.log('Firebase inicializado con archivo de servicio');
        } else {
          this.logger.debug('Usando variable de entorno para credenciales');
          const serviceAccountJson = this.configService.get<string>(
            'FIREBASE_SERVICE_ACCOUNT',
          );
          if (!serviceAccountJson) {
            this.logger.error(
              'FIREBASE_SERVICE_ACCOUNT_PATH o FIREBASE_SERVICE_ACCOUNT debe estar configurado',
            );
            throw new Error(
              'FIREBASE_SERVICE_ACCOUNT_PATH o FIREBASE_SERVICE_ACCOUNT debe estar configurado',
            );
          }
          admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
            projectId,
          });
          this.logger.log('Firebase inicializado con variable de entorno');
        }
      } else {
        this.logger.debug('Firebase ya está inicializado');
      }
      this.firestore = admin.firestore();
      this.logger.log('Firestore inicializado correctamente');
    } catch (error) {
      this.logger.error('Error al inicializar Firebase', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
  getFirestore(): admin.firestore.Firestore {
    if (!this.firestore) {
      this.logger.error('Firestore no está inicializado');
      throw new Error('Firestore no está inicializado');
    }
    return this.firestore;
  }
  getAuth(): admin.auth.Auth {
    try {
      const auth = admin.auth();
      this.logger.debug('Auth de Firebase obtenido correctamente');
      return auth;
    } catch (error) {
      this.logger.error('Error al obtener Auth de Firebase', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
