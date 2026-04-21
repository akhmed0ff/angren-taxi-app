import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../db/base.repository';
import { User } from '../models/user.model';

export class UserRepository extends BaseRepository {
  findById(id: string): User | undefined {
    return this.db.queryOne<User>('SELECT * FROM users WHERE id = ?', [id]);
  }

  findByPhone(phone: string): User | undefined {
    return this.db.queryOne<User>('SELECT * FROM users WHERE phone = ?', [phone]);
  }

  create(data: {
    phone: string;
    name: string;
    passwordHash: string;
    type: 'passenger' | 'driver';
    language?: string;
  }): User {
    const id = uuidv4();
    this.db.execute(
      `INSERT INTO users (id, phone, name, password_hash, type, language)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.phone, data.name, data.passwordHash, data.type, data.language ?? 'ru']
    );
    return this.findById(id)!;
  }

  createDriverProfile(userId: string): void {
    this.db.execute('INSERT INTO drivers (id, user_id) VALUES (?, ?)', [uuidv4(), userId]);
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn);
  }

  existsByPhone(phone: string): boolean {
    const row = this.db.queryOne<{ c: number }>(
      'SELECT COUNT(*) as c FROM users WHERE phone = ?', [phone]
    );
    return (row?.c ?? 0) > 0;
  }
}

export const userRepository = new UserRepository();
