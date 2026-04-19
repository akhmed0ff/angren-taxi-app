import './config/i18n';
import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { getDatabase } from './config/database';
import { i18nMiddleware } from './middleware/i18n.middleware';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { apiRateLimiter } from './middleware/rate-limit.middleware';

import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import driverRoutes from './routes/driver.routes';
import paymentRoutes from './routes/payment.routes';
import bonusRoutes from './routes/bonus.routes';

const app = express();

app.use(cors());
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

app.use(notFoundMiddleware);
app.use(errorMiddleware);

getDatabase();

app.listen(env.port, () => {
  console.log(`🚕 АНГРЕН ТАКСИ API запущен на порту ${env.port}`);
  console.log(`   Среда: ${env.nodeEnv}`);
  console.log(`   База данных: ${env.databasePath}`);
});

export default app;
