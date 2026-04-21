# Переход с SQLite на PostgreSQL

## Что нужно сделать (1 рабочий день):

1. Установить: npm install pg @types/pg
2. Создать backend/src/db/postgres.adapter.ts реализующий IDatabase
   используя pg.Pool вместо better-sqlite3
3. В db.provider.ts заменить:
   instance = new SQLiteAdapter(getDatabase())
   на:
   instance = new PostgresAdapter(new Pool({ connectionString: env.databaseUrl }))
4. Адаптировать SQL-синтаксис в репозиториях:
   - strftime('%s', 'now') → EXTRACT(EPOCH FROM NOW())::INTEGER
   - INTEGER timestamps → TIMESTAMPTZ
   - TEXT PRIMARY KEY → UUID DEFAULT gen_random_uuid()
5. Запустить миграции через Flyway или node-pg-migrate

## Что менять НЕ нужно:
- Сервисы (auth.service, order.service, driver.service) — без изменений
- Контроллеры — без изменений
- API контракты — без изменений

Репозитории изолируют всю БД-специфику.
