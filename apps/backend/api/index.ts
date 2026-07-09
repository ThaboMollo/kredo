import { createNestApp } from '../src/bootstrap';

let cachedServer: any = null;

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    const app = await createNestApp();
    await app.init();
    cachedServer = app.getHttpServer();
  }

  return cachedServer.emit('request', req, res);
}
