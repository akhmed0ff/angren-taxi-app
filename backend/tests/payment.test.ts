import request from 'supertest';
import { afterAll, describe, expect, it } from '@jest/globals';
import { createApp } from '../src/createApp';
import { closeDatabase } from '../src/config/database';
import { registerUser, registerOnlineDriver, createOrder, acceptOrder } from './helpers';

const app = createApp();

afterAll(() => closeDatabase());

describe('POST /api/payments/process — ownership и роли', () => {
  it('водитель не может инициировать оплату (passengerOnly) — 403', async () => {
    const driver = await registerOnlineDriver(app);

    const res = await request(app)
      .post('/api/payments/process')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ orderId: 'any-order', method: 'cash' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('пассажир не может оплатить чужой заказ — 403', async () => {
    const owner = await registerUser(app);
    const stranger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    const orderId = await createOrder(app, owner.token);
    await acceptOrder(app, driver.token, orderId);

    const res = await request(app)
      .post('/api/payments/process')
      .set('Authorization', `Bearer ${stranger.token}`)
      .send({ orderId, method: 'cash' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('владелец заказа успешно оплачивает — 200', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    const orderId = await createOrder(app, passenger.token);
    await acceptOrder(app, driver.token, orderId);

    const res = await request(app)
      .post('/api/payments/process')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ orderId, method: 'cash' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('completed');
  });

  it('повторная оплата того же заказа возвращает 409', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    const orderId = await createOrder(app, passenger.token);
    await acceptOrder(app, driver.token, orderId);

    // первая оплата
    await request(app)
      .post('/api/payments/process')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ orderId, method: 'cash' });

    // вторая попытка
    const res = await request(app)
      .post('/api/payments/process')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ orderId, method: 'cash' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('оплата несуществующего заказа возвращает 404', async () => {
    const passenger = await registerUser(app);

    const res = await request(app)
      .post('/api/payments/process')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({ orderId: 'ghost-order-id', method: 'cash' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
