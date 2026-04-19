# АНГРЕН ТАКСИ

Агрегатор такси для города Ангрен. Backend на Node.js + Express + TypeScript с SQLite.

## Структура проекта

```
angren-taxi-app/
├── backend/              # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── controllers/  # Auth, Order, Driver, Payment, Bonus
│   │   ├── services/     # Бизнес-логика
│   │   ├── models/       # TypeScript интерфейсы
│   │   ├── routes/       # API маршруты
│   │   ├── middleware/   # Auth, i18n, Error
│   │   ├── config/       # БД, env, i18n
│   │   ├── i18n/         # Переводы (ru, uz)
│   │   ├── utils/        # JWT, hash, validators
│   │   └── app.ts        # Точка входа
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Быстрый старт

### Локально

```bash
cd backend
cp .env.example .env
# Отредактируйте .env при необходимости
npm install
npm run build
npm start
```

### Docker

```bash
JWT_SECRET=your_secret docker-compose up -d
```

## API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/auth/register` | Регистрация (passenger/driver) |
| POST | `/api/auth/login` | Вход |
| GET  | `/api/auth/me` | Текущий пользователь |
| POST | `/api/orders/create` | Создать заказ (пассажир) |
| GET  | `/api/orders/:id` | Получить заказ |
| GET  | `/api/orders/available` | Доступные заказы (водитель) |
| POST | `/api/orders/accept` | Принять заказ (водитель) |
| POST | `/api/drivers/online` | Водитель онлайн |
| POST | `/api/drivers/offline` | Водитель офлайн |
| GET  | `/api/drivers/profile` | Профиль водителя |
| GET  | `/api/drivers/balance` | Баланс водителя |
| POST | `/api/payments/process` | Обработать платёж |
| GET  | `/api/payments/:orderId` | Статус платежа |
| GET  | `/api/bonuses/my-balance` | Баланс бонусов |

## Языки

Поддерживаются русский (`ru`) и узбекский (`uz`) языки.
Используйте заголовок `Accept-Language: uz` для переключения языка.

## Категории такси

- `economy` — Эконом
- `comfort` — Комфорт  
- `premium` — Премиум

## Методы оплаты

- `cash` — Наличные
- `card` — Карта

## Бонусная система

Пассажиры получают **1% кешбека** от стоимости каждой поездки.