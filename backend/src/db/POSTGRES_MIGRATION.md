# Переход на PostgreSQL (1 день работы)

## Что делать:
1. npm install pg @types/pg
2. Создать backend/src/db/postgres.adapter.ts реализующий IDatabase через pg.Pool
3. В db.provider.ts заменить SQLiteAdapter на PostgresAdapter
4. Адаптировать SQL:
   - strftime('%s','now') → EXTRACT(EPOCH FROM NOW())::INTEGER
   - TEXT PRIMARY KEY → UUID PRIMARY KEY DEFAULT gen_random_uuid()
   - INTEGER timestamps → TIMESTAMPTZ DEFAULT NOW()
5. Запустить миграции

## Что НЕ менять:
- Сервисы — без изменений
- Контроллеры — без изменений
- Репозитории — только SQL-синтаксис

Репозитории изолируют всю БД-специфику.
