import { BaseRepository } from '../db/base.repository';
import { v4 as uuidv4 } from 'uuid';
import { DbRow } from '../db/db.interface';

export interface PayoutRow extends DbRow {
  id: string;
  driver_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requested_at: number;
  processed_at: number | null;
}

export class PayoutRepository extends BaseRepository {
  create(
    driverId: string,
    amount: number
  ): void {
    this.db.execute(
      `INSERT INTO payouts (id, driver_id, amount)
       VALUES (?, ?, ?)`,
      [uuidv4(), driverId, amount]
    );
  }

  findByDriver(driverId: string, limit: number = 50, offset: number = 0): PayoutRow[] {
    return this.db.query<PayoutRow>(
      `SELECT * FROM payouts WHERE driver_id = ? ORDER BY requested_at DESC LIMIT ? OFFSET ?`,
      [driverId, limit, offset]
    );
  }

  findById(payoutId: string): PayoutRow | undefined {
    return this.db.queryOne<PayoutRow>(
      `SELECT * FROM payouts WHERE id = ?`,
      [payoutId]
    );
  }

  updateStatus(payoutId: string, status: 'pending' | 'approved' | 'rejected' | 'paid'): void {
    this.db.execute(
      `UPDATE payouts SET status = ?, processed_at = strftime('%s', 'now') WHERE id = ?`,
      [status, payoutId]
    );
  }

  countPendingByDriver(driverId: string): number {
    const result = this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM payouts WHERE driver_id = ? AND status = 'pending'`,
      [driverId]
    );
    return result?.count ?? 0;
  }

  totalPendingAmountByDriver(driverId: string): number {
    const result = this.db.queryOne<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payouts WHERE driver_id = ? AND status = 'pending'`,
      [driverId]
    );
    return result?.total ?? 0;
  }
}

export const payoutRepository = new PayoutRepository();
