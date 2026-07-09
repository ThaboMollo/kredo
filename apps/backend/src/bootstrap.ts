import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://kalahari.co.za',
  'https://www.kalahari.co.za',
  'https://kredo.kalahari.co.za',
  'http://localhost:3001',
  'http://localhost:4200',
];

export async function createNestApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  const configuredOrigins = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: configuredOrigins?.length ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Kredo Shared Platform API')
    .setDescription('Core financial service, compliance, and ledger management endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.getHttpAdapter().get('/api/openapi.json', (_req, res) => {
    res.json(document);
  });

  return app;
}
