import { getDatabase } from '../config/database';
import { Driver, DriverWithUser } from '../models/driver.model';

export class DriverService {
  getDriver(userId: string): Driver | null {
    const db = getDatabase();
    return db.prepare('SELECT * FROM drivers WHERE user_id = ?').get(userId) as Driver | null;
  }

  getDriverById(driverId: string): Driver | null {
    const db = getDatabase();
    return db.prepare('SELECT * FROM drivers WHERE id = ?').get(driverId) as Driver | null;
  }

  setOnline(userId: string, latitude: number, longitude: number): Driver {
    const db = getDatabase();
    db.prepare(
      `UPDATE drivers SET status = 'online', latitude = ?, longitude = ?,
       updated_at = strftime('%s', 'now') WHERE user_id = ?`
    ).run(latitude, longitude, userId);

    const driver = this.getDriver(userId);
    if (!driver) throw new Error('DRIVER_NOT_FOUND');
    return driver;
  }

  setOffline(userId: string): Driver {
    const db = getDatabase();
    db.prepare(
      `UPDATE drivers SET status = 'offline', updated_at = strftime('%s', 'now') WHERE user_id = ?`
    ).run(userId);

    const driver = this.getDriver(userId);
    if (!driver) throw new Error('DRIVER_NOT_FOUND');
    return driver;
  }

  updateLocation(userId: string, latitude: number, longitude: number): void {
    const db = getDatabase();
    db.prepare(
      `UPDATE drivers SET latitude = ?, longitude = ?, updated_at = strftime('%s', 'now')
       WHERE user_id = ?`
    ).run(latitude, longitude, userId);
  }

  getOnlineDrivers(category?: string): DriverWithUser[] {
    const db = getDatabase();
    if (category) {
      return db.prepare(
        `SELECT d.*, u.phone, u.name FROM drivers d
         JOIN users u ON d.user_id = u.id
         JOIN vehicles v ON v.driver_id = d.id
         WHERE d.status = 'online' AND v.category = ? AND v.is_active = 1`
      ).all(category) as DriverWithUser[];
    }
    return db.prepare(
      `SELECT d.*, u.phone, u.name FROM drivers d
       JOIN users u ON d.user_id = u.id
       WHERE d.status = 'online'`
    ).all() as DriverWithUser[];
  }

  setBusy(driverId: string): void {
    const db = getDatabase();
    db.prepare(
      `UPDATE drivers SET status = 'busy', updated_at = strftime('%s', 'now') WHERE id = ?`
    ).run(driverId);
  }

  setAvailable(driverId: string): void {
    const db = getDatabase();
    db.prepare(
      `UPDATE drivers SET status = 'online', updated_at = strftime('%s', 'now') WHERE id = ?`
    ).run(driverId);
  }

  getBalance(userId: string): { balance: number; prepaid_balance: number } {
    const db = getDatabase();
    const driver = db.prepare(
      'SELECT balance, prepaid_balance FROM drivers WHERE user_id = ?'
    ).get(userId) as { balance: number; prepaid_balance: number } | undefined;

    if (!driver) throw new Error('DRIVER_NOT_FOUND');
    return driver;
  }

  addPrepaidBalance(userId: string, amount: number): void {
    const db = getDatabase();
    db.prepare(
      `UPDATE drivers SET prepaid_balance = prepaid_balance + ?,
       updated_at = strftime('%s', 'now') WHERE user_id = ?`
    ).run(amount, userId);
  }
}

export const driverService = new DriverService();
