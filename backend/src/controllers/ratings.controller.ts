import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { driverService } from '../services/driver.service';

export class RatingsController {
  getDriverRatings(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      // TODO: load ratingDistribution and reviews from ratings table when available
      const summary = {
        overallRating: driver.rating,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        reviews: [],
        tagCounts: {},
      };

      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  // TODO: return real reviews from ratings table when available
  getDriverReviews(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      res.json({ success: true, data: [] });
    } catch (err) {
      next(err);
    }
  }

  // TODO: persist passenger rating to ratings table when available
  ratePassenger(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { orderId, rating, comment } = req.body as {
        orderId?: string;
        rating?: number;
        comment?: string;
      };

      if (!orderId || typeof rating !== 'number' || rating < 1 || rating > 5) {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}

export const ratingsController = new RatingsController();
