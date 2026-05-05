import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activate class-validator on all incoming DTOs.
  // - whitelist: strip properties not declared in the DTO.
  // - forbidNonWhitelisted: reject requests with unknown fields.
  // - transform: enable type coercion (e.g. string -> number from query).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — allow the frontend dev server to call the API.
  // Tightened in production via env var.
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  Logger.log(`Soma API listening on http://localhost:${port}`, 'Bootstrap');
  Logger.log(`CORS origin allowed: ${corsOrigin}`, 'Bootstrap');
}

bootstrap();