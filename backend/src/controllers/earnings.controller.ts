import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { driverService } from '../services/driver.service';
import { earningsService } from '../services/earnings.service';
import { payoutRepository } from '../repositories/payout.repository';

export class EarningsController {
  getEarnings(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      const weekEarnings = earningsService.getWeekEarnings(driver.id);
      const monthEarnings = earningsService.getMonthEarnings(driver.id);
      const dailyBreakdown = earningsService.getDailyBreakdown(driver.id);
      const pendingPayout = payoutRepository.totalPendingAmountByDriver(driver.id);

      const summary = {
        totalEarnings: driver.balance,
        weekEarnings,
        monthEarnings,
        pendingPayout,
        dailyBreakdown,
      };

      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  requestPayout(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { amount } = req.body as { amount?: number };

      if (typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      // Check if balance is sufficient
      if (driver.balance < amount) {
        res.status(400).json({ success: false, message: req.t?.('earnings.insufficient_balance') });
        return;
      }

      // Create payout request
      payoutRepository.create(driver.id, amount);

      res.json({ success: true, message: req.t?.('earnings.payout_requested') });
    } catch (err) {
      next(err);
    }
  }

  getPayouts(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const payouts = payoutRepository.findByDriver(driver.id, limit, offset);

      res.json({
        success: true,
        data: payouts,
        pagination: { page, limit },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const earningsController = new EarningsController();
