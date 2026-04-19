# Angren Taxi App - Backend

TypeScript + Express + Prisma + SQLite API

## 🚀 Структура проекта

```
src/
├── modules/
│   ├── driver/
│   │   ├── driver.controller.ts    # API endpoints
│   │   ├── driver.service.ts       # Business logic
│   │   └── driver.repository.ts    # Database queries
│   └── order/
│       ├── order.controller.ts
│       ├── order.service.ts
│       └── order.repository.ts
├── core/
│   └── db/
│       └── prisma.ts               # Database connection
├── common/
│   └── validators/
│       └── index.ts                # Input validation
├── app.ts                          # Express app
└── server.ts                       # Entry point
```

## 📦 Установка

```bash
npm install
npx prisma init
npx prisma migrate dev
npm run dev
```

## 🔗 API Endpoints

### Drivers

- `POST /api/drivers` - Создать водителя
- `GET /api/drivers` - Все водители
- `GET /api/drivers/available` - Свободные водители
- `GET /api/drivers/:id` - Водитель по ID
- `PATCH /api/drivers/:id/location` - Обновить локацию
- `PATCH /api/drivers/:id/availability` - Обновить доступность
- `DELETE /api/drivers/:id` - Удалить водителя

### Orders

- `POST /api/orders` - Создать заказ
- `GET /api/orders` - Все заказы
- `GET /api/orders/:id` - Заказ по ID
- `GET /api/orders/status/:status` - По статусу
- `GET /api/orders/driver/:driverId` - Заказы водителя
- `PATCH /api/orders/:id/assign` - Назначить водителя
- `PATCH /api/orders/:id/status` - Обновить статус
- `DELETE /api/orders/:id` - Удалить заказ

## 🏗️ Архитектура

- **Controller** - HTTP endpoints и валидация
- **Service** - Business logic и координация
- **Repository** - Database queries (Prisma)

Полная типизация на TypeScript! ✨
