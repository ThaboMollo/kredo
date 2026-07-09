import { NestFactory } from '@nestjs/core';
import { createNestApp } from './bootstrap';

async function bootstrap() {
  // Keep a direct Nest import in this file as well because Vercel's NestJS
  // detector inspects src/main.ts even when the serverless entrypoint is api/index.ts.
  void NestFactory;
  const app = await createNestApp();
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Backend API running on http://localhost:${port}`);
}
bootstrap();
