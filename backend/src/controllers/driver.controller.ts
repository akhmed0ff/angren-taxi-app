import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { emitDriverLocationUpdated } from '../realtime/socket';
import { driverService } from '../services/driver.service';

export class DriverController {
  setOnline(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { latitude, longitude } = req.body as { latitude: number; longitude: number };

      if (latitude === undefined || longitude === undefined) {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      const driver = driverService.setOnline(req.user!.userId, latitude, longitude);
      res.json({
        success: true,
        message: req.t?.('driver.online'),
        data: driver,
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'DRIVER_NOT_FOUND') {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }
      next(err);
    }
  }

  setOffline(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const driver = driverService.setOffline(req.user!.userId);
      res.json({
        success: true,
        message: req.t?.('driver.offline'),
        data: driver,
      });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'DRIVER_NOT_FOUND') {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }
      next(err);
    }
  }

  updateLocation(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { latitude, longitude } = req.body as { latitude: number; longitude: number };

      if (
        typeof latitude !== 'number' || latitude < -90 || latitude > 90 ||
        typeof longitude !== 'number' || longitude < -180 || longitude > 180
      ) {
        res.status(400).json({ success: false, message: 'Invalid coordinates' });
        return;
      }

      driverService.updateLocation(req.user!.userId, latitude, longitude);

      const driver = driverService.getDriver(req.user!.userId);
      if (driver) {
        emitDriverLocationUpdated({
          driverId: driver.id,
          latitude,
          longitude,
        });
      }

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  getProfile(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }
      res.json({ success: true, data: driver });
    } catch (err) {
      next(err);
    }
  }

  getBalance(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const balance = driverService.getBalance(req.user!.userId);
      res.json({ success: true, data: balance });
    } catch (err) {
      const error = err as Error;
      if (error.message === 'DRIVER_NOT_FOUND') {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }
      next(err);
    }
  }
}

export const driverController = new DriverController();
