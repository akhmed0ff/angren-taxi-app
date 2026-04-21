interface DriverLocation {
  latitude: number;
  longitude: number;
  updatedAt: number;
}

class LocationCacheService {
  private cache = new Map<string, DriverLocation>();
  private flushInterval: NodeJS.Timeout;

  constructor() {
    // Сбрасываем в БД каждые 30 секунд
    this.flushInterval = setInterval(() => this.flush(), 30_000);
  }

  update(userId: string, latitude: number, longitude: number): void {
    this.cache.set(userId, { latitude, longitude, updatedAt: Date.now() });
  }

  get(userId: string): DriverLocation | undefined {
    return this.cache.get(userId);
  }

  getAll(): Map<string, DriverLocation> {
    return this.cache;
  }

  private flush(): void {
    if (this.cache.size === 0) return;
    try {
      const { getDatabase } = require('../config/database');
      const db = getDatabase();
      const stmt = db.prepare(
        `UPDATE drivers SET latitude = ?, longitude = ?,
         updated_at = strftime('%s', 'now') WHERE user_id = ?`
      );
      const flushMany = db.transaction((entries: [string, DriverLocation][]) => {
        for (const [userId, loc] of entries) {
          stmt.run(loc.latitude, loc.longitude, userId);
        }
      });
      flushMany([...this.cache.entries()]);
    } catch (err) {
      console.error('[LocationCache] Flush failed:', err);
    }
  }

  destroy(): void {
    clearInterval(this.flushInterval);
    this.flush();
  }
}

export const locationCache = new LocationCacheService();