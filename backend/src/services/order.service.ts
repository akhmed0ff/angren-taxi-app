import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { Order, CreateOrderInput } from '../models/order.model';
import { haversineDistance } from '../utils/distance';

const PRICE_PER_KM: Record<string, number> = {
  economy: 1500,
  comfort: 2500,
  premium: 4000,
};

const BASE_FARE: Record<string, number> = {
  economy: 3000,
  comfort: 5000,
  premium: 8000,
};

function estimatePrice(category: string, fromLat: number, fromLon: number, toLat: number, toLon: number): number {
  const distKm = haversineDistance(fromLat, fromLon, toLat, toLon);
  const base = BASE_FARE[category] ?? 3000;
  const perKm = PRICE_PER_KM[category] ?? 1500;
  return Math.round(base + perKm * distKm);
}

export class OrderService {
  createOrder(passengerId: string, input: CreateOrderInput): Order {
    const db = getDatabase();

    const activeOrder = db.prepare(
      `SELECT id FROM orders WHERE passenger_id = ? AND status IN ('pending', 'accepted', 'in_progress')`
    ).get(passengerId);

    if (activeOrder) {
      throw new Error('ALREADY_ACTIVE_ORDER');
    }

    const estimated_price = estimatePrice(
      input.category,
      input.from_latitude,
      input.from_longitude,
      input.to_latitude,
      input.to_longitude
    );

    const orderId = uuidv4();
    db.prepare(
      `INSERT INTO orders (id, passenger_id, category, from_address, from_latitude, from_longitude,
       to_address, to_latitude, to_longitude, estimated_price, payment_method, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      orderId,
      passengerId,
      input.category,
      input.from_address,
      input.from_latitude,
      input.from_longitude,
      input.to_address,
      input.to_latitude,
      input.to_longitude,
      estimated_price,
      input.payment_method,
      input.note ?? null
    );

    return this.getOrderById(orderId) as Order;
  }

  getOrderById(orderId: string): Order | null {
    const db = getDatabase();
    return db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as Order | null;
  }

  getAvailableOrders(category?: string): Order[] {
    const db = getDatabase();
    if (category) {
      return db.prepare(
        `SELECT * FROM orders WHERE status = 'pending' AND category = ? ORDER BY created_at ASC`
      ).all(category) as Order[];
    }
    return db.prepare(
      `SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at ASC`
    ).all() as Order[];
  }

  acceptOrder(orderId: string, driverId: string, vehicleId: string): Order {
    const db = getDatabase();
    db.prepare(
      `UPDATE orders SET driver_id = ?, vehicle_id = ?, status = 'accepted',
       updated_at = strftime('%s', 'now') WHERE id = ? AND status = 'pending'`
    ).run(driverId, vehicleId, orderId);

    const order = this.getOrderById(orderId);
    if (!order || order.status !== 'accepted') {
      throw new Error('ORDER_NOT_AVAILABLE');
    }
    return order;
  }

  updateStatus(
    orderId: string,
    status: 'in_progress' | 'completed' | 'cancelled',
    finalPrice?: number
  ): Order {
    const db = getDatabase();
    if (status === 'completed' && finalPrice !== undefined) {
      db.prepare(
        `UPDATE orders SET status = ?, final_price = ?, updated_at = strftime('%s', 'now') WHERE id = ?`
      ).run(status, finalPrice, orderId);

      const order = this.getOrderById(orderId);
      if (order) {
        db.prepare(
          `INSERT INTO order_history (id, order_id, passenger_id, driver_id, from_address,
           to_address, category, final_price, payment_method, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          uuidv4(),
          order.id,
          order.passenger_id,
          order.driver_id,
          order.from_address,
          order.to_address,
          order.category,
          order.final_price,
          order.payment_method,
          status
        );
      }
    } else {
      db.prepare(
        `UPDATE orders SET status = ?, updated_at = strftime('%s', 'now') WHERE id = ?`
      ).run(status, orderId);
    }

    return this.getOrderById(orderId) as Order;
  }
}

export const orderService = new OrderService();
