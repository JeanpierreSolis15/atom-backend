const { onRequest } = require('firebase-functions/v2/https');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');

require('dotenv').config();

process.env.PROJECT_ID = process.env.PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'atom-cddbd';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

let AppModule;
try {
  console.log('Loading AppModule from ./dist/app.module');
  AppModule = require('./dist/app.module').AppModule;
  console.log('AppModule loaded successfully');
} catch (error) {
  console.error('Error loading AppModule:', error);
  console.error('Current directory:', process.cwd());
  console.error('Files in current directory:', require('fs').readdirSync('.'));
  if (require('fs').existsSync('./dist')) {
    console.error('Files in dist directory:', require('fs').readdirSync('./dist'));
  }
  throw error;
}

const server = express();

// Endpoint de prueba simple
server.get('/test', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

async function bootstrap() {
  try {
    console.log('Creating NestJS application...');
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
    );

    console.log('Enabling CORS...');
    app.enableCors({
      origin: ['*', 'http://localhost:3000', 'https://api-hptdammiqq-uc.a.run.app'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true,
    });

    console.log('Setting global prefix...');
    app.setGlobalPrefix('api');

    console.log('Initializing application...');
    await app.init();

    console.log('NestJS application initialized successfully');
  } catch (error) {
    console.error('Error during bootstrap:', error);
    throw error;
  }
}

bootstrap().catch(error => {
  console.error('Failed to bootstrap application:', error);
  process.exit(1);
});

exports.api = onRequest({
  cors: true,
  maxInstances: 10,
}, server); 