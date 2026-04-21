import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../db/base.repository';
import { Order, CreateOrderInput } from '../models/order.model';

export class OrderRepository extends BaseRepository {
  findById(id: string): Order | undefined {
    return this.db.queryOne<Order>('SELECT * FROM orders WHERE id = ?', [id]);
  }

  findPendingByPassenger(passengerId: string): Order | undefined {
    return this.db.queryOne<Order>(
      `SELECT * FROM orders WHERE passenger_id = ?
       AND status IN ('pending','accepted','in_progress')`,
      [passengerId]
    );
  }

  findPending(category?: string): Order[] {
    if (category) {
      return this.db.query<Order>(
        `SELECT * FROM orders WHERE status = 'pending' AND category = ? ORDER BY created_at ASC`,
        [category]
      );
    }
    return this.db.query<Order>(
      `SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at ASC`
    );
  }

  create(passengerId: string, input: CreateOrderInput & { estimatedPrice: number }): Order {
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

  // Атомарное принятие заказа — возвращает false если заказ уже взят
  accept(orderId: string, driverId: string, vehicleId: string): boolean {
    const result = this.db.execute(
      `UPDATE orders SET driver_id = ?, vehicle_id = ?, status = 'accepted',
       updated_at = strftime('%s', 'now')
       WHERE id = ? AND status = 'pending'`,
      [driverId, vehicleId, orderId]
    );
    return result.changes > 0;
  }

  findDriverStatus(driverId: string): { id: string; status: string } | undefined {
    return this.db.queryOne<{ id: string; status: string }>(
      'SELECT id, status FROM drivers WHERE id = ?',
      [driverId]
    );
  }

  setDriverBusy(driverId: string): void {
    this.db.execute(
      `UPDATE drivers SET status = 'busy', updated_at = strftime('%s', 'now') WHERE id = ?`,
      [driverId]
    );
  }

  insertHistory(order: Order, status: Order['status']): void {
    this.db.execute(
      `INSERT INTO order_history (id, order_id, passenger_id, driver_id, from_address,
       to_address, category, final_price, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        order.id,
        order.passenger_id,
        order.driver_id,
        order.from_address,
        order.to_address,
        order.category,
        order.final_price,
        order.payment_method,
        status,
      ]
    );
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn);
  }

  updateStatus(
    orderId: string,
    status: 'in_progress' | 'completed' | 'cancelled',
    finalPrice?: number
  ): Order {
    if (status === 'completed' && finalPrice !== undefined) {
      this.db.execute(
        `UPDATE orders SET status = ?, final_price = ?,
         updated_at = strftime('%s', 'now') WHERE id = ?`,
        [status, finalPrice, orderId]
      );
    } else {
      this.db.execute(
        `UPDATE orders SET status = ?, updated_at = strftime('%s', 'now') WHERE id = ?`,
        [status, orderId]
      );
    }
    return this.findById(orderId)!;
  }
}

export const orderRepository = new OrderRepository();
