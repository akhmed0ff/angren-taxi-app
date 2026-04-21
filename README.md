# АНГРЕН ТАКСИ

Монорепозиторий агрегатора такси для города Ангрен.

| Пакет | Технологии | Версии |
|---|---|---|
| `backend/` | Node.js · Express · TypeScript · SQLite (better-sqlite3) · Socket.IO | Express 4, TS 5 |
| `admin/` | Next.js · Ant Design · Redux Toolkit · Recharts | Next.js 15, React 18 |
| `mobile-client/` | React Native CLI · React Navigation · Zustand | RN 0.76, React 18 |
| `mobile-driver/` | React Native CLI · React Navigation · Zustand | RN 0.76, React 18 |

## Структура проекта

```text
angren-taxi-app/
├── backend/         # REST API + WebSocket сервер (порт 3000)
├── admin/           # Веб-панель администратора (Next.js, порт 3001)
├── mobile-client/   # Мобильное приложение пассажира (React Native)
├── mobile-driver/   # Мобильное приложение водителя (React Native)
├── docker-compose.yml
└── README.md
```

## Быстрый старт

### 1) Backend

Скопируйте `.env.example` в `.env` и при необходимости измените переменные:

```bash
cd backend
cp .env.example .env
npm install
npm run dev        # разработка (ts-node, hot-reload)
```

Продакшен-сборка:

```bash
npm run build      # tsc → dist/
npm start          # node dist/app.js
```

Переменные окружения (`.env`):

```
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_in_production
DATABASE_PATH=./data/angren_taxi.db
ALLOWED_ORIGINS=http://localhost:3001
DEFAULT_LANGUAGE=ru
```

### 2) Admin (Next.js)

```bash
cd admin
npm install
npm run dev        # http://localhost:3001
```

### 3) Mobile (React Native Android)

Предварительные требования для Android:

- JDK 17 (команда `java -version` должна работать)
- Android SDK Platform-Tools (команда `adb version` должна работать)
- Android SDK в `local.properties`, например:

```properties
sdk.dir=C:\\Users\\<user>\\AppData\\Local\\Android\\Sdk
```

Важно:

- В Android Studio открывайте проект из папки `mobile-client/android` или `mobile-driver/android`
- Не открывайте служебную папку `android/gradle` как отдельный проект

### 3.1) Mobile client (пассажир)

```bash
cd mobile-client
npm install
npm start
# в отдельном терминале
npm run android
```

### 3.2) Mobile driver (водитель)

```bash
cd mobile-driver
npm install
npm start
# в отдельном терминале
npm run android
```

### Docker (backend)

```bash
JWT_SECRET=your_secret docker-compose up -d
```

## API маршруты (backend)

### Аутентификация — `/api/auth`

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/auth/register` | Регистрация (passenger / driver) |
| POST | `/api/auth/login` | Вход |
| POST | `/api/auth/refresh` | Обновление JWT токена |
| GET | `/api/auth/me` | Текущий пользователь `🔒` |

### Заказы — `/api/orders`

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/orders/create` | Создать заказ `🔒 пассажир` |
| GET | `/api/orders/:id` | Получить заказ `🔒` |
| GET | `/api/orders/available` | Доступные заказы `🔒 водитель` |
| POST | `/api/orders/accept` | Принять заказ `🔒 водитель` |

### Поездки — `/api/rides`

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/rides` | Создать поездку |
| POST | `/api/rides/:id/accept` | Принять поездку |
| POST | `/api/rides/:id/start` | Начать поездку |
| POST | `/api/rides/:id/complete` | Завершить поездку |
| POST | `/api/rides/:id/cancel` | Отменить поездку |
| GET | `/api/rides` | Список всех поездок |
| GET | `/api/rides/status/:status` | Поездки по статусу |
| GET | `/api/rides/:id` | Поездка по ID |

### Водители — `/api/drivers`

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/drivers/online` | Перейти онлайн `🔒 водитель` |
| POST | `/api/drivers/offline` | Перейти офлайн `🔒 водитель` |
| GET | `/api/drivers/profile` | Профиль водителя `🔒 водитель` |
| GET | `/api/drivers/balance` | Баланс водителя `🔒 водитель` |

### Платежи и бонусы

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/payments/process` | Обработать платёж `🔒 пассажир` |
| GET | `/api/payments/:orderId` | Статус платежа `🔒` |
| GET | `/api/bonuses/my-balance` | Баланс бонусов `🔒` |

> `🔒` — требует JWT токен в заголовке `Authorization: Bearer <token>`

## Локализация

Поддерживаются языки: `ru` (русский), `uz` (узбекский).  
Язык по умолчанию задаётся в `.env`: `DEFAULT_LANGUAGE=ru`.

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
