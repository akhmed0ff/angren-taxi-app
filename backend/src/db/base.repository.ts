import { DbRow, IDatabase } from './db.interface';
import { getDb } from './db.provider';

export abstract class BaseRepository {
  protected get db(): IDatabase {
    return getDb();
  }

  protected findById<T extends DbRow>(table: string, id: string): T | undefined {
    return this.db.queryOne<T>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  }

  protected findAll<T extends DbRow>(table: string, where?: string, params: unknown[] = []): T[] {
    const sql = where
      ? `SELECT * FROM ${table} WHERE ${where}`
      : `SELECT * FROM ${table}`;
    return this.db.query<T>(sql, params);
  }

  protected deleteById(table: string, id: string): boolean {
    const result = this.db.execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return result.changes > 0;
  }
}
