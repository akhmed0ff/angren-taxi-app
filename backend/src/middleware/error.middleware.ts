import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { logger } from '../utils/logger';

const isDev = (process.env.NODE_ENV ?? 'development') === 'development';

export function errorMiddleware(
  err: Error,
  req: AuthRequest,
  res: Response,
  _next: NextFunction,
): void {
  // Структурированный лог с контекстом запроса — для корреляции ошибок в агрегаторах
  logger.error(err.message, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.userId ?? null,
    errorName: err.name,
    // Стек только в dev и в серверном логе — никогда не уходит на клиент в prod
    stack: isDev ? err.stack : undefined,
  });

  const body: Record<string, unknown> = {
    success: false,
    message: req.t?.('errors.internal') ?? 'Internal server error',
  };

  // В режиме разработки возвращаем детали ошибки — удобно для отладки
  if (isDev) {
    body['error'] = err.message;
    body['stack'] = err.stack;
  }

  res.status(500).json(body);
}

export function notFoundMiddleware(req: Request, res: Response): void {
  res.status(404).json({ success: false, message: 'Route not found' });
}
