import { Router } from 'express';
import { bonusController } from '../controllers/bonus.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/my-balance', authMiddleware, (req, res, next) =>
  bonusController.getMyBalance(req, res, next)
);

export default router;
