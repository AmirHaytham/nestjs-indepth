import type { NextFunction, Request, Response } from 'express';

// The function version: no class, no decorator, just (req, res, next).
// Exactly what you would write for Express.
export function courseHeader(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Course', 'SP1');
  next();
}
