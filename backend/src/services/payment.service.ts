import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { Payment } from '../models/payment.model';

export class PaymentService {
  createPayment(
    orderId: string,
    passengerId: string,
    driverId: string | null,
    amount: number,
    method: 'cash' | 'card'
  ): Payment {
    const db = getDatabase();
    const id = uuidv4();
    db.prepare(
      `INSERT INTO payments (id, order_id, passenger_id, driver_id, amount, method)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, orderId, passengerId, driverId, amount, method);

    return this.getPaymentByOrderId(orderId) as Payment;
  }

  processPayment(orderId: string): Payment {
    const db = getDatabase();
    const payment = this.getPaymentByOrderId(orderId);
    if (!payment) throw new Error('PAYMENT_NOT_FOUND');
    if (payment.status !== 'pending') throw new Error('PAYMENT_ALREADY_PROCESSED');

    db.prepare(
      `UPDATE payments SET status = 'completed', updated_at = strftime('%s', 'now')
       WHERE order_id = ?`
    ).run(orderId);

    return this.getPaymentByOrderId(orderId) as Payment;
  }

  getPaymentByOrderId(orderId: string): Payment | null {
    const db = getDatabase();
    return db.prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId) as Payment | null;
  }

  getPaymentById(paymentId: string): Payment | null {
    const db = getDatabase();
    return db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId) as Payment | null;
  }
}

export const paymentService = new PaymentService();
