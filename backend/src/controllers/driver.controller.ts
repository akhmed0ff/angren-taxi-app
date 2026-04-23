import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { emitDriverLocationUpdated } from '../realtime/socket';
import { driverService } from '../services/driver.service';
import { userRepository } from '../repositories/user.repository';
import { vehicleRepository, VehicleData } from '../repositories/vehicle.repository';
import { isValidCategory } from '../utils/validators';

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

  setStatus(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { isOnline, latitude, longitude } = req.body as {
        isOnline: boolean;
        latitude?: number;
        longitude?: number;
      };

      if (typeof isOnline !== 'boolean') {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      let driver;
      if (isOnline) {
        const lat = typeof latitude === 'number' ? latitude : 0;
        const lon = typeof longitude === 'number' ? longitude : 0;
        driver = driverService.setOnline(req.user!.userId, lat, lon);
      } else {
        driver = driverService.setOffline(req.user!.userId);
      }

      res.json({ success: true, data: driver });
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

  updateProfile(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { name } = req.body as { name?: string };

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      const user = userRepository.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ success: false, message: req.t?.('auth.user_not_found') });
        return;
      }

      userRepository.updateName(req.user!.userId, name.trim());

      res.json({ success: true, data: { ...driver, name: name.trim() } });
    } catch (err) {
      next(err);
    }
  }

  getStats(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      res.json({
        success: true,
        data: {
          totalRides: driver.total_rides,
          rating: driver.rating,
          balance: driver.balance,
        },
      });
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

  // TODO: implement real vehicle update when vehicles table is linked to driver profile
  updateVehicle(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { make, model, color, plate, year, category } = req.body as Partial<VehicleData>;

      // Validate required fields
      if (!make || !model || !color || !plate || !year || !category) {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      // Validate year is a reasonable number
      if (typeof year !== 'number' || year < 1900 || year > new Date().getFullYear() + 1) {
        res.status(400).json({ success: false, message: req.t?.('validation.invalid_year') });
        return;
      }

      // Validate category
      if (!isValidCategory(category)) {
        res.status(400).json({ success: false, message: req.t?.('validation.invalid_category') });
        return;
      }

      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      const vehicleData: VehicleData = { make, model, color, plate, year, category };
      const vehicle = vehicleRepository.upsert(driver.id, vehicleData);

      res.json({
        success: true,
        message: req.t?.('vehicle.updated'),
        data: vehicle,
      });
    } catch (err) {
      next(err);
    }
  }

  getVehicle(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const driver = driverService.getDriver(req.user!.userId);
      if (!driver) {
        res.status(404).json({ success: false, message: req.t?.('driver.not_found') });
        return;
      }

      const vehicle = vehicleRepository.findActiveByDriverId(driver.id);
      if (!vehicle) {
        res.status(404).json({ success: false, message: req.t?.('vehicle.not_found') });
        return;
      }

      res.json({ success: true, data: vehicle });
    } catch (err) {
      next(err);
    }
  }

  uploadDocuments(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { documentType, documentNumber } = req.body as {
        documentType?: string;
        documentNumber?: string;
      };

      if (!documentType || !documentNumber) {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      // Document upload not yet implemented
      res.status(501).json({
        success: false,
        message: req.t?.('document.not_implemented') || 'Загрузка документов будет доступна в следующей версии',
      });
    } catch (err) {
      next(err);
    }
  }

  // TODO: implement real bank details storage when bank_details table is available
  updateBankDetails(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
      const { bankName, accountNumber } = req.body as { bankName?: string; accountNumber?: string };

      if (!bankName || !accountNumber) {
        res.status(400).json({ success: false, message: req.t?.('validation.required') });
        return;
      }

      res.json({ success: true, message: 'Bank details saved' });
    } catch (err) {
      next(err);
    }
  }
}

export const driverController = new DriverController();
