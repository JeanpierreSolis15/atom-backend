const functions = require('firebase-functions');
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

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  await app.init();
}

bootstrap();

exports.api = functions.https.onRequest(server); 