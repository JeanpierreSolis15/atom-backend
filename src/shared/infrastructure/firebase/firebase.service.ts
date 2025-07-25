import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
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
        const projectId =
          this.configService.get<string>('PROJECT_ID') ||
          this.configService.get<string>('FIREBASE_PROJECT_ID');
        if (!projectId) {
          this.logger.error(
            'PROJECT_ID o FIREBASE_PROJECT_ID no está configurado',
          );
          throw new Error(
            'PROJECT_ID o FIREBASE_PROJECT_ID no está configurado',
          );
        }
        this.logger.debug(`Proyecto Firebase: ${projectId}`);
        const serviceAccountPath =
          this.configService.get<string>('SERVICE_ACCOUNT_PATH') ||
          this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
        if (serviceAccountPath) {
          this.logger.debug(
            `Usando archivo de servicio: ${serviceAccountPath}`,
          );
          const serviceAccount = JSON.parse(
            fs.readFileSync(path.resolve(serviceAccountPath), 'utf8'),
          );
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId,
          });
          this.logger.log('Firebase inicializado con archivo de servicio');
        } else {
          const nodeEnv =
            this.configService.get<string>('NODE_ENV') || 'development';

          if (nodeEnv === 'production') {
            this.logger.debug(
              'Usando credenciales por defecto de Firebase Functions',
            );
            admin.initializeApp({
              projectId,
            });
            this.logger.log(
              'Firebase inicializado con credenciales por defecto',
            );
          } else {
            this.logger.debug(
              'Usando variable de entorno para credenciales (desarrollo)',
            );
            const serviceAccountJson =
              this.configService.get<string>('SERVICE_ACCOUNT') ||
              this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
            if (!serviceAccountJson) {
              this.logger.error(
                'SERVICE_ACCOUNT_PATH o SERVICE_ACCOUNT debe estar configurado para desarrollo',
              );
              throw new Error(
                'SERVICE_ACCOUNT_PATH o SERVICE_ACCOUNT debe estar configurado para desarrollo',
              );
            }
            admin.initializeApp({
              credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
              projectId,
            });
            this.logger.log(
              'Firebase inicializado con variable de entorno (desarrollo)',
            );
          }
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
