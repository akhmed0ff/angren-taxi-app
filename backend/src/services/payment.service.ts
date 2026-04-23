import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';
import { Payment } from '../models/payment.model';

const CASHBACK_RATE = 0.01;

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

  /**
   * Атомарный расчёт: создание/проверка платежа, перевод в completed,
   * начисление кэшбэка и освобождение водителя — всё в одной SQLite-транзакции.
   * Бросает PAYMENT_ALREADY_PROCESSED если платёж уже завершён.
   */
  settle(
    orderId: string,
    passengerId: string,
    driverId: string | null,
    amount: number,
    method: 'cash' | 'card'
  ): Payment {
    const db = getDatabase();

    return db.transaction((): Payment => {
      // 1. Создаём платёж, если его ещё нет
      let payment = this.getPaymentByOrderId(orderId);
      if (!payment) {
        const id = uuidv4();
        db.prepare(
          `INSERT INTO payments (id, order_id, passenger_id, driver_id, amount, method)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).run(id, orderId, passengerId, driverId, amount, method);
        payment = this.getPaymentByOrderId(orderId) as Payment;
      }

      // 2. Проверяем, что платёж не завершён
      if (payment.status !== 'pending') {
        throw new Error('PAYMENT_ALREADY_PROCESSED');
      }

      // 3. Переводим платёж в completed
      db.prepare(
        `UPDATE payments SET status = 'completed', updated_at = strftime('%s', 'now')
         WHERE order_id = ?`
      ).run(orderId);

      // 4. Начисляем кэшбэк пассажиру (INSERT OR IGNORE — защита от дубликатов,
      //    дублирует UNIQUE INDEX idx_bonuses_order_type на уровне кода)
      const bonusAmount = Math.round(amount * CASHBACK_RATE);
      db.prepare(
        `INSERT OR IGNORE INTO bonuses (id, user_id, order_id, amount, type)
         VALUES (?, ?, ?, ?, 'cashback')`
      ).run(uuidv4(), passengerId, orderId, bonusAmount);

      // 5. Освобождаем водителя и добавляем заработок (если назначен)
      if (driverId) {
        const driverEarnings = Math.round(amount * 0.85); // 85% after 15% platform fee
        db.prepare(
          `UPDATE drivers SET balance = balance + ?, total_rides = total_rides + 1,
           status = 'online', updated_at = strftime('%s', 'now') WHERE id = ?`
        ).run(driverEarnings, driverId);
      }

      return this.getPaymentByOrderId(orderId) as Payment;
    })();
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
