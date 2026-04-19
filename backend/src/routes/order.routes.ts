import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authMiddleware, passengerOnly, driverOnly } from '../middleware/auth.middleware';

const router = Router();

router.post('/create', authMiddleware, passengerOnly, (req, res, next) =>
  orderController.createOrder(req, res, next)
);

router.get('/available', authMiddleware, driverOnly, (req, res, next) =>
  orderController.getAvailableOrders(req, res, next)
);

router.post('/accept', authMiddleware, driverOnly, (req, res, next) =>
  orderController.acceptOrder(req, res, next)
);

router.get('/:id', authMiddleware, (req, res, next) =>
  orderController.getOrder(req, res, next)
);

export default router;
