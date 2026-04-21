import './config/i18n';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { i18nMiddleware } from './middleware/i18n.middleware';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { apiRateLimiter } from './middleware/rate-limit.middleware';
import { env } from './config/env';
import { logger } from './utils/logger';

import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import driverRoutes from './routes/driver.routes';
import paymentRoutes from './routes/payment.routes';
import bonusRoutes from './routes/bonus.routes';
import adminRoutes from '@/routes/admin.routes';

/**
 * Фабрика Express-приложения без вызова listen() и WebSocketServer.
 * Позволяет безопасно импортировать app в тестах через supertest.
 */
export function createApp(): Express {
  const app = express();

  app.use(helmet());
  if (env.nodeEnv !== 'test') {
    app.use(pinoHttp({
      logger: logger as any,
      autoLogging: {
        ignore: (req) => req.url === '/health',
      },
      customLogLevel: (_req, res) => {
        if (res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    }));
  }
  app.use(cors({
    origin: env.allowedOrigins.length > 0 ? env.allowedOrigins : false,
    credentials: true,
  }));
  app.use(express.json());
  app.use(i18nMiddleware);
  app.use('/api', apiRateLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'АНГРЕН ТАКСИ API', version: '1.0.0' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/drivers', driverRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/bonuses', bonusRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
