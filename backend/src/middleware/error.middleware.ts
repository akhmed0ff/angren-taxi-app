import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export function errorMiddleware(
  err: Error,
  req: AuthRequest,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[ERROR]', err.message, err.stack);
  res.status(500).json({
    success: false,
    message: req.t?.('errors.internal') ?? 'Internal server error',
  });
}

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({ success: false, message: 'Route not found' });
}
