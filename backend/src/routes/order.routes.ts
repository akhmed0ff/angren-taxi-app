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

router.get('/active', authMiddleware, driverOnly, (req, res, next) =>
  orderController.getActiveOrder(req, res, next)
);

router.get('/history', authMiddleware, (req, res, next) =>
  orderController.getOrderHistory(req, res, next)
);

router.post('/accept', authMiddleware, driverOnly, (req, res, next) =>
  orderController.acceptOrder(req, res, next)
);

router.post('/:id/reject', authMiddleware, driverOnly, (req, res, next) =>
  orderController.rejectOrder(req, res, next)
);

router.post('/:id/arrived', authMiddleware, driverOnly, (req, res, next) =>
  orderController.arrivedAtPickup(req, res, next)
);

router.post('/:id/start', authMiddleware, driverOnly, (req, res, next) =>
  orderController.startOrder(req, res, next)
);

router.post('/:id/complete', authMiddleware, driverOnly, (req, res, next) =>
  orderController.completeOrder(req, res, next)
);

router.get('/:id', authMiddleware, (req, res, next) =>
  orderController.getOrder(req, res, next)
);

export default router;
