import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../db/base.repository';
import { DbRow } from '../db/db.interface';

export interface OrderRow extends DbRow {
  id: string;
  passenger_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  status: 'pending' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  category: 'economy' | 'comfort' | 'premium';
  from_address: string;
  from_latitude: number;
  from_longitude: number;
  to_address: string;
  to_latitude: number;
  to_longitude: number;
  estimated_price: number;
  final_price: number | null;
  payment_method: 'cash' | 'card';
  note: string | null;
  created_at: number;
  updated_at: number;
}

export interface CreateOrderInput {
  category: 'economy' | 'comfort' | 'premium';
  from_address: string;
  from_latitude: number;
  from_longitude: number;
  to_address: string;
  to_latitude: number;
  to_longitude: number;
  estimatedPrice: number;
  payment_method: 'cash' | 'card';
  note?: string;
}

export class OrderRepository extends BaseRepository {
  findById(id: string): OrderRow | undefined {
    return this.db.queryOne<OrderRow>(
      'SELECT * FROM orders WHERE id = ?', [id]
    );
  }

  findActiveByPassenger(passengerId: string): OrderRow | undefined {
    return this.db.queryOne<OrderRow>(
      `SELECT * FROM orders WHERE passenger_id = ?
       AND status IN ('pending','accepted','in_progress')`,
      [passengerId]
    );
  }

  findPending(category?: string): OrderRow[] {
    if (category) {
      return this.db.query<OrderRow>(
        `SELECT * FROM orders WHERE status = 'pending' AND category = ?
         ORDER BY created_at ASC`,
        [category]
      );
    }
    return this.db.query<OrderRow>(
      `SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at ASC`
    );
  }

  findByPassenger(
    passengerId: string,
    limit = 20,
    offset = 0
  ): { orders: OrderRow[]; total: number } {
    const orders = this.db.query<OrderRow>(
      `SELECT * FROM orders WHERE passenger_id = ?
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [passengerId, limit, offset]
    );
    const row = this.db.queryOne<{ c: number }>(
      'SELECT COUNT(*) as c FROM orders WHERE passenger_id = ?', [passengerId]
    );
    return { orders, total: row?.c ?? 0 };
  }

  findActiveByDriver(driverId: string): OrderRow | undefined {
    return this.db.queryOne<OrderRow>(
      `SELECT * FROM orders WHERE driver_id = ?
       AND status IN ('accepted','arrived','in_progress')
       LIMIT 1`,
      [driverId]
    );
  }

  findByDriver(
    driverId: string,
    limit = 20,
    offset = 0,
    status?: string
  ): { orders: OrderRow[]; total: number } {
    let query = `SELECT * FROM orders WHERE driver_id = ?`;
    const params: any[] = [driverId];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const orders = this.db.query<OrderRow>(query, params);

    let countQuery = `SELECT COUNT(*) as c FROM orders WHERE driver_id = ?`;
    const countParams: any[] = [driverId];
    if (status) {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }
    const row = this.db.queryOne<{ c: number }>(countQuery, countParams);
    return { orders, total: row?.c ?? 0 };
  }

  reject(orderId: string, driverId: string): boolean {
    const result = this.db.execute(
      `UPDATE orders SET driver_id = NULL, vehicle_id = NULL, status = 'pending',
       updated_at = strftime('%s','now')
       WHERE id = ? AND driver_id = ? AND status = 'accepted'`,
      [orderId, driverId]
    );
    return result.changes > 0;
  }

  arrivedAtPickup(orderId: string, driverId: string): boolean {
    const result = this.db.execute(
      `UPDATE orders SET status = 'arrived', updated_at = strftime('%s','now')
       WHERE id = ? AND driver_id = ? AND status = 'accepted'`,
      [orderId, driverId]
    );
    return result.changes > 0;
  }

  startRide(orderId: string, driverId: string): boolean {
    const result = this.db.execute(
      `UPDATE orders SET status = 'in_progress', updated_at = strftime('%s','now')
       WHERE id = ? AND driver_id = ? AND status = 'arrived'`,
      [orderId, driverId]
    );
    return result.changes > 0;
  }

  completeRide(orderId: string, driverId: string, finalPrice?: number): boolean {
    const query = finalPrice !== undefined
      ? `UPDATE orders SET status = 'completed', final_price = ?, updated_at = strftime('%s','now')
         WHERE id = ? AND driver_id = ? AND status = 'in_progress'`
      : `UPDATE orders SET status = 'completed', updated_at = strftime('%s','now')
         WHERE id = ? AND driver_id = ? AND status = 'in_progress'`;

    const params = finalPrice !== undefined
      ? [finalPrice, orderId, driverId]
      : [orderId, driverId];

    const result = this.db.execute(query, params);
    return result.changes > 0;
  }

  create(passengerId: string, input: CreateOrderInput): OrderRow {
    const id = uuidv4();
    this.db.execute(
      `INSERT INTO orders
       (id, passenger_id, category, from_address, from_latitude, from_longitude,
        to_address, to_latitude, to_longitude, estimated_price, payment_method, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, passengerId, input.category,
        input.from_address, input.from_latitude, input.from_longitude,
        input.to_address, input.to_latitude, input.to_longitude,
        input.estimatedPrice, input.payment_method, input.note ?? null,
      ]
    );
    return this.findById(id)!;
  }

  // Атомарное принятие — возвращает false если уже взят
  accept(orderId: string, driverId: string, vehicleId: string): boolean {
    const result = this.db.execute(
      `UPDATE orders SET driver_id = ?, vehicle_id = ?, status = 'accepted',
       updated_at = strftime('%s','now')
       WHERE id = ? AND status = 'pending'`,
      [driverId, vehicleId, orderId]
    );
    return result.changes > 0;
  }

  updateStatus(
    orderId: string,
    status: 'in_progress' | 'completed' | 'cancelled',
    finalPrice?: number
  ): OrderRow {
    if (status === 'completed' && finalPrice !== undefined) {
      this.db.execute(
        `UPDATE orders SET status = ?, final_price = ?,
         updated_at = strftime('%s','now') WHERE id = ?`,
        [status, finalPrice, orderId]
      );
    } else {
      this.db.execute(
        `UPDATE orders SET status = ?, updated_at = strftime('%s','now') WHERE id = ?`,
        [status, orderId]
      );
    }
    return this.findById(orderId)!;
  }
}

export const orderRepository = new OrderRepository();
