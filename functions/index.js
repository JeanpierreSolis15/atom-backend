const functions = require('firebase-functions');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const express = require('express');

require('dotenv').config();

let AppModule;
try {
  AppModule = require('./dist/app.module').AppModule;
} catch (error) {
  console.error('Error loading AppModule:', error);
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