import { Driver, DriverWithUser } from '../models/driver.model';
import { locationCache } from './location-cache.service';
import { driverRepository } from '../repositories/driver.repository';

export class DriverService {
  getDriver(userId: string): Driver | null {
    return driverRepository.findByUserId(userId) ?? null;
  }

  getDriverById(driverId: string): Driver | null {
    return driverRepository.findById(driverId) ?? null;
  }

  setOnline(userId: string, latitude: number, longitude: number): Driver {
    driverRepository.setStatus(userId, 'online');
    driverRepository.updateLocation(userId, latitude, longitude);

    const driver = this.getDriver(userId);
    if (!driver) throw new Error('DRIVER_NOT_FOUND');
    return driver;
  }

  setOffline(userId: string): Driver {
    driverRepository.setStatus(userId, 'offline');

    const driver = this.getDriver(userId);
    if (!driver) throw new Error('DRIVER_NOT_FOUND');
    return driver;
  }

  updateLocation(userId: string, latitude: number, longitude: number): void {
    // Только в кэш — flush в БД каждые 30 сек
    locationCache.update(userId, latitude, longitude);
  }

  getOnlineDrivers(category?: string): DriverWithUser[] {
    return driverRepository.findOnline(category);
  }

  setBusy(driverId: string): void {
    const driver = driverRepository.findById(driverId);
    if (driver) {
      driverRepository.setStatus(driver.user_id, 'busy');
    }
  }

  setAvailable(driverId: string): void {
    const driver = driverRepository.findById(driverId);
    if (driver) {
      driverRepository.setStatus(driver.user_id, 'online');
    }
  }

  getBalance(userId: string): { balance: number; prepaid_balance: number } {
    const driver = driverRepository.getBalance(userId);

    if (!driver) throw new Error('DRIVER_NOT_FOUND');
    return driver;
  }

  addPrepaidBalance(userId: string, amount: number): void {
    driverRepository.addPrepaidBalance(userId, amount);
  }
}

export const driverService = new DriverService();
