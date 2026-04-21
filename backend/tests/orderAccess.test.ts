import request from 'supertest';
import { afterAll, describe, expect, it } from '@jest/globals';
import { createApp } from '../src/createApp';
import { closeDatabase } from '../src/config/database';
import { registerUser, registerOnlineDriver, createOrder, acceptOrder } from './helpers';

const app = createApp();

afterAll(() => closeDatabase());

describe('GET /api/orders/:id — ownership / access control', () => {
  it('пассажир видит свой заказ — 200', async () => {
    const passenger = await registerUser(app);
    const orderId = await createOrder(app, passenger.token);

    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${passenger.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(orderId);
  });

  it('другой пассажир не видит чужой заказ — 403', async () => {
    const owner = await registerUser(app);
    const other = await registerUser(app);
    const orderId = await createOrder(app, owner.token);

    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${other.token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('водитель видит назначенный ему заказ — 200', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);
    const orderId = await createOrder(app, passenger.token);
    await acceptOrder(app, driver.token, orderId);

    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${driver.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(orderId);
  });

  it('водитель не видит заказ, назначенный другому водителю — 403', async () => {
    const passenger = await registerUser(app);
    const driver1 = await registerOnlineDriver(app);
    const driver2 = await registerOnlineDriver(app);
    const orderId = await createOrder(app, passenger.token);

    // driver1 принимает заказ
    await acceptOrder(app, driver1.token, orderId);

    // driver2 пытается получить этот заказ
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${driver2.token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('неавторизованный запрос возвращает 401', async () => {
    const passenger = await registerUser(app);
    const orderId = await createOrder(app, passenger.token);

    const res = await request(app).get(`/api/orders/${orderId}`);

    expect(res.status).toBe(401);
  });

  it('несуществующий заказ возвращает 404', async () => {
    const passenger = await registerUser(app);

    const res = await request(app)
      .get('/api/orders/non-existent-order-id')
      .set('Authorization', `Bearer ${passenger.token}`);

    expect(res.status).toBe(404);
  });
});
