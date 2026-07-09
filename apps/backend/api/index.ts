import { NestFactory } from '@nestjs/core';
import { createNestApp } from '../src/bootstrap';

let cachedServer: any = null;

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    // Keep a direct Nest import in this entrypoint so Vercel's NestJS detector
    // recognises the API function, while all app setup stays in createNestApp().
    void NestFactory;
    const app = await createNestApp();
    await app.init();
    cachedServer = app.getHttpServer();
  }

  return cachedServer.emit('request', req, res);
}
