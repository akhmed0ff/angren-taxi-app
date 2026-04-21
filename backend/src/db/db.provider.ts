import { IDatabase } from './db.interface';
import { SQLiteAdapter } from './sqlite.adapter';
import { getDatabase } from '../config/database';

let instance: IDatabase | null = null;

export function getDb(): IDatabase {
  if (!instance) {
    instance = new SQLiteAdapter(getDatabase());
  }
  return instance;
}

// Для тестов — подменить реализацию
export function setDb(db: IDatabase): void {
  instance = db;
}

export function resetDb(): void {
  instance = null;
}
