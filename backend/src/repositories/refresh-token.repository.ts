import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../db/base.repository';
import { DbRow } from '../db/db.interface';

interface RefreshTokenRow extends DbRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: number;
}

export class RefreshTokenRepository extends BaseRepository {
  create(userId: string, token: string, expiresAt: number): void {
    this.db.execute(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
      [uuidv4(), userId, token, expiresAt]
    );
  }

  findValid(token: string): RefreshTokenRow | undefined {
    const now = Math.floor(Date.now() / 1000);
    return this.db.queryOne<RefreshTokenRow>(
      'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > ?',
      [token, now]
    );
  }

  deleteById(id: string): void {
    this.db.execute('DELETE FROM refresh_tokens WHERE id = ?', [id]);
  }

  deleteByUserId(userId: string): void {
    this.db.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
  }

  deleteByToken(token: string): void {
    this.db.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
