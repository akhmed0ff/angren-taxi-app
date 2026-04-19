import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { bonusService } from '../services/bonus.service';

export class BonusController {
  getMyBalance(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const balance = bonusService.getBalance(req.user!.userId);
      const history = bonusService.getHistory(req.user!.userId);
      res.json({
        success: true,
        data: {
          balance,
          history,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

export const bonusController = new BonusController();
