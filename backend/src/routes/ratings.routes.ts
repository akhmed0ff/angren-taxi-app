import { Router } from 'express';
import { ratingsController } from '../controllers/ratings.controller';
import { authMiddleware, driverOnly, passengerOnly } from '../middleware/auth.middleware';

const router = Router();

// Driver endpoints — get their own ratings
router.get('/driver', authMiddleware, driverOnly, (req, res, next) =>
  ratingsController.getDriverRatings(req, res, next)
);

router.get('/driver/reviews', authMiddleware, driverOnly, (req, res, next) =>
  ratingsController.getDriverReviews(req, res, next)
);

// Passenger endpoint — rate a driver after completing an order
router.post('/driver', authMiddleware, passengerOnly, (req, res, next) =>
  ratingsController.rateDriver(req, res, next)
);

export default router;
