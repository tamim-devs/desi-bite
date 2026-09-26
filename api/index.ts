import type { Request, Response } from 'express';
import { createExpressApp } from '../server.ts';

process.env.VERCEL = '1';

let cachedApp: any = null;

async function getExpressApp() {
  if (!cachedApp) {
    cachedApp = await createExpressApp();
  }

  return cachedApp;
}

function normalizeVercelRequest(req: Request) {
  if (req.body && typeof req.body === 'object') {
    (req as any)._body = true;
  }

  const forwardedUri =
    (req.headers?.['x-forwarded-uri'] as string) ||
    (req.headers?.['x-original-url'] as string) ||
    (req.headers?.['x-invoke-path'] as string) ||
    (req.headers?.['x-matched-path'] as string);

  if (
    forwardedUri &&
    forwardedUri.startsWith('/api/') &&
    forwardedUri !== '/api'
  ) {
    req.url = forwardedUri;
    return;
  }

  const routeParam =
    req.query?.path ||
    req.query?.route ||
    (req.query as any)?.[0];

  if (routeParam) {
    const subpath = Array.isArray(routeParam)
      ? routeParam.join('/')
      : String(routeParam);

    const cleanSubpath = subpath.replace(/^\/+/, '');

    const rawUrl = req.url || '';

    const queryIndex = rawUrl.indexOf('?');

    const existingSearch =
      queryIndex !== -1
        ? rawUrl.substring(queryIndex)
        : '';

    req.url = `/api/${cleanSubpath}${existingSearch}`;

    return;
  }

  if (!req.url || req.url === '/' || req.url === '') {
    req.url = '/api';
  }
}

export default async function handler(
  req: Request,
  res: Response
) {
  try {
    normalizeVercelRequest(req);

    const app = await getExpressApp();

    return app(req, res);
  } catch (error: any) {
    console.error('[Vercel API Error]', error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error:
          error?.message ||
          'Internal server error',
      });
    }
  }
}