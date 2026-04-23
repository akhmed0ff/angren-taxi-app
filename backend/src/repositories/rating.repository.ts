import { BaseRepository } from '../db/base.repository';
import { v4 as uuidv4 } from 'uuid';
import { DbRow } from '../db/db.interface';

export interface RatingRow extends DbRow {
  id: string;
  order_id: string;
  from_user_id: string;
  to_user_id: string;
  to_type: 'driver' | 'passenger';
  score: number;
  comment: string | null;
  created_at: number;
}

export class RatingRepository extends BaseRepository {
  create(
    orderId: string,
    fromUserId: string,
    toUserId: string,
    toType: 'driver' | 'passenger',
    score: number,
    comment?: string
  ): void {
    this.db.execute(
      `INSERT INTO ratings (id, order_id, from_user_id, to_user_id, to_type, score, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), orderId, fromUserId, toUserId, toType, score, comment || null]
    );
  }

  findByToUser(toUserId: string, limit: number, offset: number): RatingRow[] {
    return this.db.query<RatingRow>(
      `SELECT * FROM ratings WHERE to_user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [toUserId, limit, offset]
    );
  }

  findByOrder(orderId: string): RatingRow | undefined {
    return this.db.queryOne<RatingRow>(
      `SELECT * FROM ratings WHERE order_id = ?`,
      [orderId]
    );
  }

  getAverageScore(toUserId: string): number {
    const result = this.db.queryOne<{ avg_score: number }>(
      `SELECT AVG(score) as avg_score FROM ratings WHERE to_user_id = ?`,
      [toUserId]
    );
    return result?.avg_score ? Math.round(result.avg_score * 10) / 10 : 0;
  }

  countByToUser(toUserId: string): number {
    const result = this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM ratings WHERE to_user_id = ?`,
      [toUserId]
    );
    return result?.count ?? 0;
  }

  getDistribution(toUserId: string): Record<1 | 2 | 3 | 4 | 5, number> {
    const results = this.db.query<{ score: number; count: number }>(
      `SELECT score, COUNT(*) as count FROM ratings WHERE to_user_id = ?
       GROUP BY score ORDER BY score`,
      [toUserId]
    );

    const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    results.forEach((row) => {
      distribution[row.score as 1 | 2 | 3 | 4 | 5] = row.count;
    });

    return distribution;
  }
}

export const ratingRepository = new RatingRepository();
