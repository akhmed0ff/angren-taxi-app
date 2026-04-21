import { BaseRepository } from '../db/base.repository';
import { Driver, DriverWithUser } from '../models/driver.model';

export class DriverRepository extends BaseRepository {
  findByUserId(userId: string): Driver | undefined {
    return this.db.queryOne<Driver>('SELECT * FROM drivers WHERE user_id = ?', [userId]);
  }

  findById(id: string): Driver | undefined {
    return this.db.queryOne<Driver>('SELECT * FROM drivers WHERE id = ?', [id]);
  }

  findOnline(category?: string): DriverWithUser[] {
    if (category) {
      return this.db.query<DriverWithUser>(
        `SELECT d.*, u.phone, u.name FROM drivers d
         JOIN users u ON d.user_id = u.id
         JOIN vehicles v ON v.driver_id = d.id
         WHERE d.status = 'online' AND v.category = ? AND v.is_active = 1`,
        [category]
      );
    }

    return this.db.query<DriverWithUser>(
      `SELECT d.*, u.phone, u.name FROM drivers d
       JOIN users u ON d.user_id = u.id WHERE d.status = 'online'`
    );
  }

  setStatus(userId: string, status: 'online' | 'offline' | 'busy'): void {
    this.db.execute(
      `UPDATE drivers SET status = ?, updated_at = strftime('%s', 'now') WHERE user_id = ?`,
      [status, userId]
    );
  }

  updateLocation(userId: string, latitude: number, longitude: number): void {
    this.db.execute(
      `UPDATE drivers SET latitude = ?, longitude = ?,
       updated_at = strftime('%s', 'now') WHERE user_id = ?`,
      [latitude, longitude, userId]
    );
  }

  getBalance(userId: string): { balance: number; prepaid_balance: number } | undefined {
    return this.db.queryOne<{ balance: number; prepaid_balance: number }>(
      'SELECT balance, prepaid_balance FROM drivers WHERE user_id = ?',
      [userId]
    );
  }

  addPrepaidBalance(userId: string, amount: number): void {
    this.db.execute(
      `UPDATE drivers SET prepaid_balance = prepaid_balance + ?,
       updated_at = strftime('%s', 'now') WHERE user_id = ?`,
      [amount, userId]
    );
  }
}

export const driverRepository = new DriverRepository();
