import { Request, Response, NextFunction } from 'express';

const allowedOrigins = ['https://dev-cms.wilsonlive.app', 'https://cms.wilsonlive.app'];

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  if (allowedOrigins.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  }

  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-XSRF-TOKEN');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, HEAD, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  if (req.method === 'OPTIONS') {
    return res.end();
  }

  next();
}
