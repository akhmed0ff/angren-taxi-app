import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';

const CASHBACK_RATE = 0.01;

export interface Bonus {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  type: string;
  created_at: number;
}

export class BonusService {
  awardCashback(userId: string, orderId: string, rideAmount: number): Bonus {
    const db = getDatabase();
    const bonusAmount = Math.round(rideAmount * CASHBACK_RATE);
    const id = uuidv4();

    db.prepare(
      `INSERT INTO bonuses (id, user_id, order_id, amount, type) VALUES (?, ?, ?, ?, 'cashback')`
    ).run(id, userId, orderId, bonusAmount);

    return db.prepare('SELECT * FROM bonuses WHERE id = ?').get(id) as Bonus;
  }

  getBalance(userId: string): number {
    const db = getDatabase();
    const result = db.prepare(
      'SELECT COALESCE(SUM(amount), 0) as total FROM bonuses WHERE user_id = ?'
    ).get(userId) as { total: number };
    return result.total;
  }

  getHistory(userId: string): Bonus[] {
    const db = getDatabase();
    return db.prepare(
      'SELECT * FROM bonuses WHERE user_id = ? ORDER BY created_at DESC'
    ).all(userId) as Bonus[];
  }
}

export const bonusService = new BonusService();
