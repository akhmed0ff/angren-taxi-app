import { Router } from 'express';
import { earningsController } from '../controllers/earnings.controller';
import { authMiddleware, driverOnly } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, driverOnly, (req, res, next) =>
  earningsController.getEarnings(req, res, next)
);

router.post('/payout', authMiddleware, driverOnly, (req, res, next) =>
  earningsController.requestPayout(req, res, next)
);

router.get('/payouts', authMiddleware, driverOnly, (req, res, next) =>
  earningsController.getPayouts(req, res, next)
);

export default router;
