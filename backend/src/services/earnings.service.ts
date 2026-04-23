import { getDatabase } from '../db/db.provider';

export class EarningsService {
  /**
   * Sum final_price from order_history for the last 7 days
   */
  getWeekEarnings(driverId: string): number {
    const db = getDatabase();
    const result = db.prepare(
      `SELECT COALESCE(SUM(final_price), 0) as total
       FROM order_history
       WHERE driver_id = ?
         AND status = 'completed'
         AND completed_at > strftime('%s', 'now', '-7 days')`
    ).get(driverId) as { total: number };
    return result.total || 0;
  }

  /**
   * Sum final_price from order_history for the last 30 days
   */
  getMonthEarnings(driverId: string): number {
    const db = getDatabase();
    const result = db.prepare(
      `SELECT COALESCE(SUM(final_price), 0) as total
       FROM order_history
       WHERE driver_id = ?
         AND status = 'completed'
         AND completed_at > strftime('%s', 'now', '-30 days')`
    ).get(driverId) as { total: number };
    return result.total || 0;
  }

  /**
   * Group by day for the last 7 days
   * Returns: [{ date: '2026-04-23', amount: 45000 }, ...]
   */
  getDailyBreakdown(driverId: string): { date: string; amount: number }[] {
    const db = getDatabase();
    const results = db.prepare(
      `SELECT
         DATE(datetime(completed_at, 'unixepoch')) as date,
         COALESCE(SUM(final_price), 0) as amount
       FROM order_history
       WHERE driver_id = ?
         AND status = 'completed'
         AND completed_at > strftime('%s', 'now', '-7 days')
       GROUP BY date
       ORDER BY date DESC`
    ).all(driverId) as { date: string; amount: number }[];
    return results;
  }
}

export const earningsService = new EarningsService();
