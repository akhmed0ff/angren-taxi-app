import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { authService } from '../services/auth.service';
import { isValidUserType, isValidName, isValidPassword } from '../utils/validators';

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, name, password, type, language } = req.body as {
        phone: string;
        name: string;
        password: string;
        type: string;
        language?: string;
      };

      if (!phone || !name || !password || !type) {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      if (!isValidUserType(type)) {
        res.status(400).json({ success: false, message: req.t?.('validation.invalid_type') });
        return;
      }

      if (!isValidName(name)) {
        res.status(400).json({ success: false, message: req.t?.('validation.invalid_name') });
        return;
      }

      if (!isValidPassword(password)) {
        res.status(400).json({ success: false, message: req.t?.('validation.invalid_password') });
        return;
      }

      const result = await authService.register({ phone, name, password, type, language });
      res.status(201).json({
        success: true,
        message: req.t?.('auth.register_success'),
        data: result,
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'USER_EXISTS') {
        res.status(409).json({ success: false, message: req.t?.('auth.user_exists') });
        return;
      }
      if (error.message === 'INVALID_PHONE') {
        res.status(400).json({ success: false, message: req.t?.('validation.invalid_phone') });
        return;
      }
      next(err);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, password } = req.body as { phone: string; password: string };

      if (!phone || !password) {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      const result = await authService.login({ phone, password });
      res.json({
        success: true,
        message: req.t?.('auth.login_success'),
        data: result,
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ success: false, message: req.t?.('auth.invalid_credentials') });
        return;
      }
      next(err);
    }
  }

  async refresh(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken: string };

      if (!refreshToken) {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      const result = await authService.refreshSession(refreshToken);
      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'INVALID_REFRESH_TOKEN') {
        res.status(401).json({ success: false, message: 'Invalid refresh token' });
        return;
      }
      next(err);
    }
  }

  getMe(req: AuthRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ success: false, message: req.t?.('auth.unauthorized') });
      return;
    }
    const user = authService.getUser(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: req.t?.('auth.user_not_found') });
      return;
    }
    res.json({ success: true, data: user });
  }
}

export const authController = new AuthController();
