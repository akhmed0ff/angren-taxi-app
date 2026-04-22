import { Router } from 'express';
import { ratingsController } from '../controllers/ratings.controller';
import { authMiddleware, driverOnly } from '../middleware/auth.middleware';

const router = Router();

router.get('/driver', authMiddleware, driverOnly, (req, res, next) =>
  ratingsController.getDriverRatings(req, res, next)
);

router.get('/driver/reviews', authMiddleware, driverOnly, (req, res, next) =>
  ratingsController.getDriverReviews(req, res, next)
);

router.post('/passenger', authMiddleware, driverOnly, (req, res, next) =>
  ratingsController.ratePassenger(req, res, next)
);

export default router;
