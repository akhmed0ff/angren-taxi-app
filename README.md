# АНГРЕН ТАКСИ

Монорепозиторий агрегатора такси для города Ангрен.

Включает:

- backend API на Node.js + Express + TypeScript + SQLite
- web-админку на Next.js
- мобильное приложение пассажира на Expo + React Native
- мобильное приложение водителя на Expo + React Native

## Структура проекта

```text
angren-taxi-app/
├── backend/         # Backend API
├── admin/           # Web admin panel (Next.js)
├── mobile-client/   # Passenger mobile app (Expo)
├── mobile-driver/   # Driver mobile app (Expo)
├── docker-compose.yml
└── README.md
```

## Быстрый старт

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run build
npm start
```

Для разработки:

```bash
cd backend
npm install
npm run dev
```

### 2) Admin (Next.js)

```bash
cd admin
npm install
npm run dev
```

### 3) Mobile client (пассажир)

```bash
cd mobile-client
npm install
npm run start
```

### 4) Mobile driver (водитель)

```bash
cd mobile-driver
npm install
npm run start
```

### Docker (backend)

```bash
JWT_SECRET=your_secret docker-compose up -d
```

## Ключевые API маршруты (backend)

- POST `/api/auth/register` — регистрация (passenger/driver)
- POST `/api/auth/login` — вход
- GET `/api/auth/me` — текущий пользователь

- POST `/api/orders/create` — создать заказ (пассажир)
- GET `/api/orders/:id` — получить заказ
- GET `/api/orders/available` — доступные заказы (водитель)
- POST `/api/orders/accept` — принять заказ (водитель)

- POST `/api/drivers/online` — водитель онлайн
- POST `/api/drivers/offline` — водитель офлайн
- GET `/api/drivers/profile` — профиль водителя
- GET `/api/drivers/balance` — баланс водителя

- POST `/api/payments/process` — обработать платеж
- GET `/api/payments/:orderId` — статус платежа
- GET `/api/bonuses/my-balance` — баланс бонусов

## Локализация

Поддерживаются:

- `ru` — русский
- `uz` — узбекский

Для backend можно переключать язык через заголовок `Accept-Language`.

## Доменные параметры

Категории такси:

- `economy`
- `comfort`
- `premium`

Методы оплаты:

- `cash`
- `card`

Бонусы:

- пассажир получает 1% кешбека от стоимости поездки

## Примечание

Файл `backend/README.md` удален, актуальная документация поддерживается в этом корневом README.
