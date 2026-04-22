import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { driverService } from '../services/driver.service';
import { v4 as uuidv4 } from 'uuid';

export class EarningsController {
  getEarnings(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      // TODO: calculate real week/month earnings from order_history table
      const summary = {
        totalEarnings: driver.balance,
        weekEarnings: 0,
        monthEarnings: 0,
        pendingPayout: 0,
        dailyBreakdown: [],
        payouts: [],
      };

      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  // TODO: implement real payout request when payouts table is available
  requestPayout(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { amount } = req.body as { amount?: number };

      if (typeof amount !== 'number' || amount <= 0) {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      const payout = {
        id: uuidv4(),
        amount,
        status: 'pending' as const,
        requestedAt: new Date().toISOString(),
      };

      res.json({ success: true, data: payout });
    } catch (err) {
      next(err);
    }
  }

  // TODO: implement real payout history when payouts table is available
  getPayouts(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      res.json({ success: true, data: [] });
    } catch (err) {
      next(err);
    }
  }
}

export const earningsController = new EarningsController();
