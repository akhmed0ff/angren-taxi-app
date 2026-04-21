import Database from 'better-sqlite3';
import { IDatabase, DbRow } from './db.interface';

export class SQLiteAdapter implements IDatabase {
  constructor(private db: Database.Database) {}

  query<T extends DbRow>(sql: string, params: unknown[] = []): T[] {
    return this.db.prepare(sql).all(...params) as T[];
  }

  queryOne<T extends DbRow>(sql: string, params: unknown[] = []): T | undefined {
    return this.db.prepare(sql).get(...params) as T | undefined;
  }

  execute(sql: string, params: unknown[] = []): { changes: number; lastInsertRowid: number | bigint } {
    return this.db.prepare(sql).run(...params);
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }
}
