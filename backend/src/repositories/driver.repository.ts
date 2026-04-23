import { BaseRepository } from '../db/base.repository';
import { v4 as uuidv4 } from 'uuid';
import { DbRow } from '../db/db.interface';

export interface DriverRow extends DbRow {
  id: string;
  user_id: string;
  status: 'online' | 'offline' | 'busy';
  latitude: number | null;
  longitude: number | null;
  rating: number;
  total_rides: number;
  balance: number;
  prepaid_balance: number;
  created_at: number;
  updated_at: number;
}

export interface DriverWithUserRow extends DriverRow {
  phone: string;
  name: string;
}

export class DriverRepository extends BaseRepository {
  create(userId: string): void {
    this.db.execute('INSERT INTO drivers (id, user_id) VALUES (?, ?)', [uuidv4(), userId]);
  }

  findByUserId(userId: string): DriverRow | undefined {
    return this.db.queryOne<DriverRow>(
      'SELECT * FROM drivers WHERE user_id = ?', [userId]
    );
  }

  findById(id: string): DriverRow | undefined {
    return this.db.queryOne<DriverRow>(
      'SELECT * FROM drivers WHERE id = ?', [id]
    );
  }

  /**
   * Find all online drivers, optionally filtered by vehicle category.
   * Uses LEFT JOIN to include drivers even if they have no vehicle (or no vehicle of requested category).
   * This is the lenient version that returns drivers regardless of vehicle availability.
   */
  findOnline(category?: string): DriverWithUserRow[] {
    if (category) {
      // LEFT JOIN allows drivers without matching vehicles to appear in results
      // Filter by category only when vehicle exists
      return this.db.query<DriverWithUserRow>(
        `SELECT d.*, u.phone, u.name FROM drivers d
         JOIN users u ON d.user_id = u.id
         LEFT JOIN vehicles v ON v.driver_id = d.id AND v.category = ? AND v.is_active = 1
         WHERE d.status = 'online'`,
        [category]
      );
    }

    return this.db.query<DriverWithUserRow>(
      `SELECT d.*, u.phone, u.name FROM drivers d
       JOIN users u ON d.user_id = u.id WHERE d.status = 'online'`
    );
  }

  /**
   * Find online drivers with strict vehicle requirements.
   * Uses INNER JOIN to exclude drivers without an active vehicle of the requested category.
   * Use this when vehicle data is strictly required (e.g., when accepting an order).
   */
  findOnlineWithVehicle(category: string): DriverWithUserRow[] {
    return this.db.query<DriverWithUserRow>(
      `SELECT d.*, u.phone, u.name FROM drivers d
       JOIN users u ON d.user_id = u.id
       JOIN vehicles v ON v.driver_id = d.id
       WHERE d.status = 'online' AND v.category = ? AND v.is_active = 1`,
      [category]
    );
  }

  setStatus(userId: string, status: 'online' | 'offline' | 'busy'): void {
    this.db.execute(
      `UPDATE drivers SET status = ?, updated_at = strftime('%s','now') WHERE user_id = ?`,
      [status, userId]
    );
  }

  setStatusById(driverId: string, status: 'online' | 'offline' | 'busy'): void {
    this.db.execute(
      `UPDATE drivers SET status = ?, updated_at = strftime('%s','now') WHERE id = ?`,
      [status, driverId]
    );
  }

  updateLocation(userId: string, latitude: number, longitude: number): void {
    this.db.execute(
      `UPDATE drivers SET latitude = ?, longitude = ?,
       updated_at = strftime('%s','now') WHERE user_id = ?`,
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

  updateRating(driverId: string, newRating: number): void {
    this.db.execute(
      `UPDATE drivers SET rating = ?, updated_at = strftime('%s', 'now') WHERE id = ?`,
      [newRating, driverId]
    );
  }
}

export const driverRepository = new DriverRepository();
