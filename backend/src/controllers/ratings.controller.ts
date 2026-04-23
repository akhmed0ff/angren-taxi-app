import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { driverService } from '../services/driver.service';
import { ratingRepository } from '../repositories/rating.repository';
import { orderRepository } from '../repositories/order.repository';
import { v4 as uuidv4 } from 'uuid';

export class RatingsController {
  getDriverRatings(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      const averageScore = ratingRepository.getAverageScore(driver.id);
      const totalReviews = ratingRepository.countByToUser(driver.id);
      const ratingDistribution = ratingRepository.getDistribution(driver.id);

      const summary = {
        overallRating: averageScore,
        totalReviews,
        ratingDistribution,
        tagCounts: {},
      };

      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  getDriverReviews(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const reviews = ratingRepository.findByToUser(driver.id, limit, offset);
      const total = ratingRepository.countByToUser(driver.id);

      res.json({
        success: true,
        data: reviews,
        pagination: { page, limit, total },
      });
    } catch (err) {
      next(err);
    }
  }

  rateDriver(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { orderId, score, comment } = req.body as {
        orderId?: string;
        score?: number;
        comment?: string;
      };

      if (!orderId || typeof score !== 'number' || score < 1 || score > 5) {
        res.status(400).json({ success: false, message: req.t?.('validation.invalid_rating') });
        return;
      }

      const order = orderRepository.findById(orderId);
      if (!order) {
        res.status(404).json({ success: false, message: req.t?.('order.not_found') });
        return;
      }

      // Only passenger can rate a driver after completed order
      if (order.passenger_id !== req.user!.userId) {
        res.status(403).json({ success: false, message: req.t?.('common.forbidden') });
        return;
      }

      if (order.status !== 'completed') {
        res.status(400).json({
          success: false,
          message: req.t?.('rating.order_not_completed'),
        });
        return;
      }

      if (!order.driver_id) {
        res.status(400).json({
          success: false,
          message: req.t?.('rating.no_driver_assigned'),
        });
        return;
      }

      // Check if already rated this order
      const existingRating = ratingRepository.findByOrder(orderId);
      if (existingRating) {
        res.status(400).json({
          success: false,
          message: req.t?.('rating.already_rated'),
        });
        return;
      }

      // Create rating
      ratingRepository.create(orderId, req.user!.userId, order.driver_id, 'driver', score, comment);

      res.json({ success: true, message: req.t?.('rating.created_successfully') });
    } catch (err) {
      next(err);
    }
  }
}

export const ratingsController = new RatingsController();
