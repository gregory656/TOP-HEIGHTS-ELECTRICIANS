import express, { type Request, type Response } from 'express';
import { createCommerceApp, type CommerceDependencies } from './app';
import { runtimeDependencies } from './runtime';

export function vercelEnvironment(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const production = env.VERCEL_ENV === 'production';
  const commerceEnvironment = production ? 'production' : 'staging';
  if (env.COMMERCE_ENVIRONMENT && env.COMMERCE_ENVIRONMENT !== commerceEnvironment) {
    throw Error('Deployment environment does not match Vercel.');
  }
  const resolved = { ...env, COMMERCE_ENVIRONMENT: commerceEnvironment };
  return !production && env.VERCEL_URL ? { ...resolved, STOREFRONT_ORIGIN: `https://${env.VERCEL_URL}` } : resolved;
}

export function createVercelApp(deps: CommerceDependencies) {
  const app = express();
  app.disable('x-powered-by');
  const commerce = createCommerceApp(deps);
  app.use('/api', commerce);
  app.use(commerce);
  return app;
}

export function createVercelHandler(load = () => runtimeDependencies(vercelEnvironment(process.env), 'vercel')) {
  let cached: ReturnType<typeof createVercelApp> | undefined;
  return (req: Request, res: Response) => {
    try {
      const url = new URL(req.url, 'https://internal.invalid');
      const route = url.searchParams.get('__commerce_path');
      if (route) {
        if (!/^\/(?:api\/|shop\/|blog\/|sitemap\.xml$)/.test(route) || /[?#\\]/.test(route)) throw Error('Invalid route.');
        url.searchParams.delete('__commerce_path');
        const query = url.searchParams.toString();
        req.url = route + (query ? '?' + query : '');
      }
      cached ||= createVercelApp(load());
    } catch {
      res.statusCode = 503;
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'The service is not configured yet.' }));
      return;
    }
    cached(req, res);
  };
}
export const handler = createVercelHandler();
