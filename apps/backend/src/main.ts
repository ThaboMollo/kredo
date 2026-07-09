import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configure CORS
  app.enableCors({
    origin: [
      'https://kalahari.co.za',
      'https://kredo.kalahari.co.za',
      'http://localhost:3001', // Marketing Local Dev
      'http://localhost:4200', // Angular Portal Local Dev
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 2. Configure Swagger OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Kredo Shared Platform API')
    .setDescription('Core financial service, compliance, and ledger management endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 3. Write OpenAPI JSON Schema to file
  const openApiFilePath = path.join(process.cwd(), 'openapi.json');
  fs.writeFileSync(openApiFilePath, JSON.stringify(document, null, 2));
  console.log(`OpenAPI schema successfully written to ${openApiFilePath}`);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend API running on http://localhost:${port}`);
}
bootstrap();

