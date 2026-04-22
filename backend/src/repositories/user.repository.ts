import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../db/base.repository';
import { DbRow } from '../db/db.interface';

export interface UserRow extends DbRow {
  id: string;
  phone: string;
  name: string;
  password_hash: string;
  type: 'passenger' | 'driver' | 'admin';
  language: string;
  created_at: number;
  updated_at: number;
}

export class UserRepository extends BaseRepository {
  findById(id: string): UserRow | undefined {
    return this.db.queryOne<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
  }

  findByPhone(phone: string): UserRow | undefined {
    return this.db.queryOne<UserRow>('SELECT * FROM users WHERE phone = ?', [phone]);
  }

  existsByPhone(phone: string): boolean {
    const row = this.db.queryOne<{ c: number }>(
      'SELECT COUNT(*) as c FROM users WHERE phone = ?', [phone]
    );
    return (row?.c ?? 0) > 0;
  }

  create(data: {
    phone: string;
    name: string;
    passwordHash: string;
    type: 'passenger' | 'driver' | 'admin';
    language?: string;
  }): UserRow {
    const id = uuidv4();
    this.db.execute(
      `INSERT INTO users (id, phone, name, password_hash, type, language)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.phone, data.name, data.passwordHash, data.type, data.language ?? 'ru']
    );
    return this.findById(id)!;
  }

  updateName(userId: string, name: string): void {
    this.db.execute(
      `UPDATE users SET name = ?, updated_at = strftime('%s','now') WHERE id = ?`,
      [name, userId]
    );
  }
}

export const userRepository = new UserRepository();
