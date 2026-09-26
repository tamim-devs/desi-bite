import type { Request, Response } from 'express';
import { createExpressApp } from '../server.ts';

// Mark Vercel runtime environment
process.env.VERCEL = '1';

let cachedApp: any = null;

export async function getExpressApp() {
  if (!cachedApp) {
    cachedApp = await createExpressApp();
  }
  return cachedApp;
}

export function normalizeVercelRequest(req: Request): void {
  // Mark pre-parsed body so express.json() doesn't hang on an already-consumed stream in Vercel
  if (req.body && typeof req.body === 'object') {
    (req as any)._body = true;
  }

  // 1. Inspect Vercel URL preservation headers
  const forwardedUri =
    (req.headers?.['x-forwarded-uri'] as string) ||
    (req.headers?.['x-original-url'] as string) ||
    (req.headers?.['x-invoke-path'] as string) ||
    (req.headers?.['x-matched-path'] as string);

  if (forwardedUri && forwardedUri.startsWith('/api/') && forwardedUri !== '/api') {
    req.url = forwardedUri;
    return;
  }

  // 2. Query param based routing (e.g., from vercel.json rewrite /api?path=$1 or /api/[...route])
  const routeParam = req.query?.path || req.query?.route || (req.query as any)?.[0];
  if (routeParam) {
    const subpath = Array.isArray(routeParam) ? routeParam.join('/') : String(routeParam);
    const cleanSubpath = subpath.replace(/^\/+/, '');

    // Preserve existing query string if any
    const rawUrl = req.url || '';
    const queryIdx = rawUrl.indexOf('?');
    const existingSearch = queryIdx !== -1 ? rawUrl.substring(queryIdx) : '';

    req.url = `/api/${cleanSubpath}${existingSearch}`;
    return;
  }

  // 3. Fallback: ensure valid url
  if (!req.url || req.url === '/' || req.url === '') {
    req.url = '/api';
  }
}

export default async function handler(req: Request, res: Response) {
  normalizeVercelRequest(req);
  const app = await getExpressApp();
  return app(req, res);
}
