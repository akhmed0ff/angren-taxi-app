export interface DbRow extends Record<string, unknown> {}

export interface IDatabase {
  query<T extends DbRow>(sql: string, params?: unknown[]): T[];
  queryOne<T extends DbRow>(sql: string, params?: unknown[]): T | undefined;
  execute(sql: string, params?: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  transaction<T>(fn: () => T): T;
}
