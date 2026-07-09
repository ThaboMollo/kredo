import { NestFactory } from '@nestjs/core';
import { createNestApp } from '../src/bootstrap';

let cachedServer: any = null;

function getMissingRequiredEnv() {
  return ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'ENCRYPTION_KEY'].filter(
    (key) => !process.env[key],
  );
}

export default async function handler(req: any, res: any) {
  const missingEnv = getMissingRequiredEnv();

  if (missingEnv.length > 0) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'configuration_error',
        message: 'Backend deployment is missing required Vercel environment variables.',
        missingEnv,
      }),
    );
    return;
  }

  try {
    if (!cachedServer) {
      // Keep a direct Nest import in this entrypoint so Vercel's NestJS detector
      // recognises the API function, while all app setup stays in createNestApp().
      void NestFactory;
      const app = await createNestApp();
      await app.init();
      cachedServer = app.getHttpServer();
    }

    return cachedServer.emit('request', req, res);
  } catch (error) {
    console.error('Failed to initialize Kredo API function:', error);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(
      JSON.stringify({
        status: 'startup_error',
        message: error instanceof Error ? error.message : 'Unknown backend startup error.',
      }),
    );
  }
}
