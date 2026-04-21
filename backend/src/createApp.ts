import './config/i18n';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { i18nMiddleware } from './middleware/i18n.middleware';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { apiRateLimiter } from './middleware/rate-limit.middleware';
import { env } from './config/env';

import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import driverRoutes from './routes/driver.routes';
import paymentRoutes from './routes/payment.routes';
import bonusRoutes from './routes/bonus.routes';
import taxiRoutes from './routes/taxi.routes';
import rideRoutes from './routes/rides.routes';

/**
 * Фабрика Express-приложения без вызова listen() и WebSocketServer.
 * Позволяет безопасно импортировать app в тестах через supertest.
 */
export function createApp(): Express {
  const app = express();

  app.use(helmet());
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
  app.use('/api/rides', rideRoutes);
  app.use('/api/taxi', taxiRoutes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
