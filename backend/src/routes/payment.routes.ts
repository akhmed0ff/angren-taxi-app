import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/process', authMiddleware, (req, res, next) =>
  paymentController.processPayment(req, res, next)
);

router.get('/:orderId', authMiddleware, (req, res, next) =>
  paymentController.getPayment(req, res, next)
);

export default router;
