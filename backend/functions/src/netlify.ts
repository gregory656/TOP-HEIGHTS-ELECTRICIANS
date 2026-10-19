import express from 'express';
import serverless from 'serverless-http';
import { createCommerceApp, type CommerceDependencies } from './app';
import { runtimeDependencies } from './runtime';
export { deploymentConfig } from './runtime';

export function createNetlifyHandler(deps: CommerceDependencies) {
  const app = express();
  const commerce = createCommerceApp(deps);
  app.use('/api', commerce);
  app.use('/.netlify/functions/api', commerce);
  app.use(commerce); // Product/blog HTML rewrites preserve the original path.
  return serverless(app);
}

let cached: ReturnType<typeof createNetlifyHandler> | undefined;
export const handler: ReturnType<typeof createNetlifyHandler> = async (event, context) => {
  try {
    cached ||= createNetlifyHandler(runtimeDependencies(process.env, 'netlify'));
    return await cached(event, context);
  } catch {
    return { statusCode: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify({ error: 'The service is not configured yet.' }) };
  }
};
