import request from 'supertest';
import { afterAll, describe, expect, it } from '@jest/globals';
import { createApp } from '../src/createApp';
import { closeDatabase, getDatabase } from '../src/config/database';
import { registerUser, registerOnlineDriver, createOrder, acceptOrder } from './helpers';

const app = createApp();

afterAll(() => closeDatabase());

describe('POST /api/orders/accept — race condition и статус водителя', () => {
  it('водитель со статусом online принимает заказ — 200', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);
    const orderId = await createOrder(app, passenger.token);

    const res = await acceptOrder(app, driver.token, orderId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.driver_id).toBeDefined();
    expect(res.body.data.status).toBe('accepted');
  });

  it('водитель со статусом offline не может принять заказ — 409', async () => {
    const passenger = await registerUser(app);
    const driver = await registerUser(app, { type: 'driver' });
    // Статус по умолчанию: 'offline'
    const orderId = await createOrder(app, passenger.token);

    const res = await acceptOrder(app, driver.token, orderId);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('водитель со статусом busy не может принять заказ — 409', async () => {
    const passenger = await registerUser(app);
    const driver = await registerUser(app, { type: 'driver' });
    getDatabase()
      .prepare("UPDATE drivers SET status = 'busy' WHERE user_id = ?")
      .run(driver.userId);

    const orderId = await createOrder(app, passenger.token);

    const res = await acceptOrder(app, driver.token, orderId);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('второй водитель не может принять уже принятый заказ — 409', async () => {
    const passenger = await registerUser(app);
    const driver1 = await registerOnlineDriver(app);
    const driver2 = await registerOnlineDriver(app);
    const orderId = await createOrder(app, passenger.token);

    // driver1 принимает первым
    const first = await acceptOrder(app, driver1.token, orderId);
    expect(first.status).toBe(200);

    // driver2 пытается принять тот же заказ
    const second = await acceptOrder(app, driver2.token, orderId);
    expect(second.status).toBe(409);
    expect(second.body.success).toBe(false);
  });

  it('после принятия заказа статус водителя становится busy', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);
    const orderId = await createOrder(app, passenger.token);

    await acceptOrder(app, driver.token, orderId);

    const driverRow = getDatabase()
      .prepare('SELECT status FROM drivers WHERE user_id = ?')
      .get(driver.userId) as { status: string };

    expect(driverRow.status).toBe('busy');
  });
});
