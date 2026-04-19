import { Router } from 'express';
import { driverController } from '../controllers/driver.controller';
import { authMiddleware, driverOnly } from '../middleware/auth.middleware';

const router = Router();

router.post('/online', authMiddleware, driverOnly, (req, res, next) =>
  driverController.setOnline(req, res, next)
);

router.post('/offline', authMiddleware, driverOnly, (req, res, next) =>
  driverController.setOffline(req, res, next)
);

router.get('/profile', authMiddleware, driverOnly, (req, res, next) =>
  driverController.getProfile(req, res, next)
);

router.get('/balance', authMiddleware, driverOnly, (req, res, next) =>
  driverController.getBalance(req, res, next)
);

export default router;
