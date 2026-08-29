import 'reflect-metadata';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // ─── Security ──────────────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
        },
      },
    }),
  );

  app.enableCors({
    origin: (process.env['CORS_ORIGINS'] ?? 'http://localhost:3000').split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Institution-Id'],
    credentials: true,
  });

  // ─── Versioning ────────────────────────────────────────────────────────────
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  // ─── Global Pipes ──────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── API Prefix ────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ─── OpenAPI / Swagger ─────────────────────────────────────────────────────
  if (process.env['NODE_ENV'] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Impact API')
      .setDescription('Academic Decision Impact Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('students', 'Student data and profiles')
      .addTag('simulations', 'Decision simulation engine')
      .addTag('advisor', 'Advisor dashboard and tools')
      .addTag('policies', 'Policy management')
      .addTag('rules', 'Rule engine management')
      .addTag('admin', 'Institution administration')
      .addTag('appeals', 'Appeal workflow')
      .addTag('notifications', 'Notification system')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = Number(process.env['PORT'] ?? 3001);
  await app.listen(port);

  console.warn(`🚀 Impact API running on: http://localhost:${port}/api`);
  console.warn(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Failed to start Impact API:', err);
  process.exit(1);
});
