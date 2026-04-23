import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { env } from './env';

let db: Database.Database | undefined;

export function getDatabase(): Database.Database {
  if (!db) {
    // ':memory:' — специальное имя SQLite для базы в памяти (используется в тестах)
    if (env.databasePath === ':memory:') {
      db = new Database(':memory:');
    } else {
      const dbDir = path.dirname(path.resolve(env.databasePath));
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      db = new Database(path.resolve(env.databasePath));
      db.pragma('journal_mode = WAL');
    }
    db.pragma('foreign_keys = ON');
    initializeSchema(db);
  }
  return db;
}

/** Закрывает соединение и сбрасывает синглтон. Используется в afterAll тестов. */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = undefined;
  }
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('passenger', 'driver', 'admin')),
      language TEXT NOT NULL DEFAULT 'ru',
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'offline' CHECK(status IN ('online', 'offline', 'busy')),
      latitude REAL,
      longitude REAL,
      rating REAL NOT NULL DEFAULT 5.0,
      total_rides INTEGER NOT NULL DEFAULT 0,
      balance REAL NOT NULL DEFAULT 0.0,
      prepaid_balance REAL NOT NULL DEFAULT 0.0,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      driver_id TEXT NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      color TEXT NOT NULL,
      plate TEXT NOT NULL UNIQUE,
      year INTEGER NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('economy', 'comfort', 'premium')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE
    );

    -- MIGRATION NOTE: If database already exists and was created before 'arrived' status support,
    -- existing databases need manual migration. 'arrived' status is used by arrivedAtPickup method
    -- in order.repository.ts and order.service.ts. SQLite does not support ALTER CHECK constraints,
    -- so existing databases must be recreated or migrated with a SQL script that rebuilds the table.
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      passenger_id TEXT NOT NULL,
      driver_id TEXT,
      vehicle_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending','accepted','arrived','in_progress','completed','cancelled')),
      category TEXT NOT NULL CHECK(category IN ('economy', 'comfort', 'premium')),
      from_address TEXT NOT NULL,
      from_latitude REAL NOT NULL,
      from_longitude REAL NOT NULL,
      to_address TEXT NOT NULL,
      to_latitude REAL NOT NULL,
      to_longitude REAL NOT NULL,
      estimated_price REAL NOT NULL,
      final_price REAL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('cash', 'card')),
      note TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (passenger_id) REFERENCES users(id),
      FOREIGN KEY (driver_id) REFERENCES drivers(id),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL UNIQUE,
      passenger_id TEXT NOT NULL,
      driver_id TEXT,
      amount REAL NOT NULL,
      method TEXT NOT NULL CHECK(method IN ('cash', 'card')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (passenger_id) REFERENCES users(id),
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    );

    CREATE TABLE IF NOT EXISTS bonuses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL DEFAULT 'cashback',
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    CREATE TABLE IF NOT EXISTS order_history (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      passenger_id TEXT NOT NULL,
      driver_id TEXT,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      category TEXT NOT NULL,
      final_price REAL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL,
      completed_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (passenger_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
    CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
    CREATE INDEX IF NOT EXISTS idx_orders_passenger_id ON orders(passenger_id);
    CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_bonuses_user_id ON bonuses(user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_bonuses_order_type ON bonuses(order_id, type);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
  `);
}
