import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import i18next from '../config/i18n';

export interface AuthRequest extends Request {
  user?: JwtPayload;
  t?: typeof i18next.t;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: req.t?.('auth.unauthorized') ?? 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: req.t?.('auth.token_invalid') ?? 'Invalid token' });
  }
}

export function driverOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.type !== 'driver') {
    res.status(403).json({ success: false, message: req.t?.('errors.forbidden') ?? 'Forbidden' });
    return;
  }
  next();
}

export function passengerOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.type !== 'passenger') {
    res.status(403).json({ success: false, message: req.t?.('errors.forbidden') ?? 'Forbidden' });
    return;
  }
  next();
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.type !== 'admin') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
}
