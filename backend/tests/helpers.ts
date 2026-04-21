import request from 'supertest';
import type { Express } from 'express';
import { getDatabase } from '../src/config/database';

let phoneCounter = 0;
let vehicleCounter = 0;
const driverTokenToVehicleId = new Map<string, string>();

/** Генерирует уникальный номер телефона для каждого вызова — избегаем конфликтов USER_EXISTS */
export function uniquePhone(): string {
  return `+9989000${String(++phoneCounter).padStart(5, '0')}`;
}

export interface RegisteredUser {
  token: string;
  userId: string;
  phone: string;
}

/** Регистрирует пользователя и возвращает токен + userId */
export async function registerUser(
  app: Express,
  overrides: Partial<{ phone: string; name: string; password: string; type: string }> = {}
): Promise<RegisteredUser> {
  const phone = overrides.phone ?? uniquePhone();
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      phone,
      name: overrides.name ?? 'Test User',
      password: overrides.password ?? 'password123',
      type: overrides.type ?? 'passenger',
      language: 'ru',
    });

  if (res.status !== 201) {
    throw new Error(`registerUser failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return {
    token: res.body.data.token as string,
    userId: res.body.data.user.id as string,
    phone,
  };
}

/** Регистрирует водителя и устанавливает ему статус 'online' */
export async function registerOnlineDriver(app: Express): Promise<RegisteredUser> {
  const driver = await registerUser(app, { type: 'driver' });
  const db = getDatabase();
  db.prepare("UPDATE drivers SET status = 'online' WHERE user_id = ?").run(driver.userId);

  const driverRow = db
    .prepare('SELECT id FROM drivers WHERE user_id = ?')
    .get(driver.userId) as { id: string } | undefined;

  if (!driverRow) {
    throw new Error('registerOnlineDriver failed: driver row not found');
  }

  const vehicleId = `test-vehicle-${++vehicleCounter}`;
  db.prepare(
    `INSERT INTO vehicles (id, driver_id, make, model, color, plate, year, category, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
  ).run(vehicleId, driverRow.id, 'Test', 'Sedan', 'White', `TEST-${vehicleCounter}`, 2020, 'economy');

  driverTokenToVehicleId.set(driver.token, vehicleId);
  return driver;
}

/** Создаёт заказ от имени пассажира, возвращает orderId */
export async function createOrder(app: Express, token: string): Promise<string> {
  const res = await request(app)
    .post('/api/orders/create')
    .set('Authorization', `Bearer ${token}`)
    .send({
      category: 'economy',
      from_address: 'ул. Навои, 1',
      from_latitude: 40.8897,
      from_longitude: 69.1936,
      to_address: 'ул. Темура, 5',
      to_latitude: 40.9100,
      to_longitude: 69.2200,
      payment_method: 'cash',
    });

  if (res.status !== 201) {
    throw new Error(`createOrder failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  return res.body.data.id as string;
}

/** Принимает заказ от имени водителя */
export async function acceptOrder(
  app: Express,
  driverToken: string,
  orderId: string
): Promise<request.Response> {
  const vehicleId = driverTokenToVehicleId.get(driverToken) ?? 'missing-test-vehicle';

  return request(app)
    .post('/api/orders/accept')
    .set('Authorization', `Bearer ${driverToken}`)
    .send({ orderId, vehicleId });
}
