import { IDatabase, DbRow } from './db.interface';
import { getDb } from './db.provider';

export abstract class BaseRepository {
  protected get db(): IDatabase {
    return getDb();
  }
}
