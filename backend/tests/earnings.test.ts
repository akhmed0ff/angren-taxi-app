import request from 'supertest';
import { afterAll, describe, expect, it } from '@jest/globals';
import { createApp } from '../src/createApp';
import { closeDatabase } from '../src/config/database';
import { registerUser, registerOnlineDriver, createOrder, acceptOrder } from './helpers';

const app = createApp();

afterAll(() => closeDatabase());

describe('GET /api/earnings — driver earnings summary', () => {
  it('водитель может получить свои заработки за неделю и месяц — 200', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    const orderId = await createOrder(app, passenger.token);
    await acceptOrder(app, driver.token, orderId);
    await request(app)
      .post(`/api/orders/${orderId}/start`)
      .set('Authorization', `Bearer ${driver.token}`);
    const completeRes = await request(app)
      .post(`/api/orders/${orderId}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    // Complete order should have returned with updated prices
    expect(completeRes.status).toBe(200);

    const res = await request(app)
      .get('/api/earnings')
      .set('Authorization', `Bearer ${driver.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalEarnings).toBeDefined();
    expect(res.body.data.weekEarnings).toBeDefined();
    expect(res.body.data.monthEarnings).toBeDefined();
    expect(res.body.data.dailyBreakdown).toBeDefined();
    expect(Array.isArray(res.body.data.dailyBreakdown)).toBe(true);
  });

  it('новый водитель имеет 0 заработков — 200', async () => {
    const driver = await registerOnlineDriver(app);

    const res = await request(app)
      .get('/api/earnings')
      .set('Authorization', `Bearer ${driver.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.weekEarnings).toBe(0);
    expect(res.body.data.monthEarnings).toBe(0);
  });

  it('неавторизованный запрос возвращает 401', async () => {
    const res = await request(app).get('/api/earnings');

    expect(res.status).toBe(401);
  });
});

describe('POST /api/earnings/payout — request withdrawal', () => {
  it('водитель может запросить вывод средств — 200', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    // Complete an order to get earnings
    const orderId = await createOrder(app, passenger.token);
    await acceptOrder(app, driver.token, orderId);
    await request(app)
      .post(`/api/orders/${orderId}/start`)
      .set('Authorization', `Bearer ${driver.token}`);
    await request(app)
      .post(`/api/orders/${orderId}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    // Request payout
    const res = await request(app)
      .post('/api/earnings/payout')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ amount: 5000 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('водитель не может вывести больше чем есть на балансе — 400', async () => {
    const driver = await registerOnlineDriver(app);

    const res = await request(app)
      .post('/api/earnings/payout')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ amount: 1000000 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('невалидная сумма возвращает 400', async () => {
    const driver = await registerOnlineDriver(app);

    const res = await request(app)
      .post('/api/earnings/payout')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ amount: -100 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/earnings/payouts — payout history', () => {
  it('водитель может получить историю выводов — 200', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    // Complete orders to get earnings
    for (let i = 0; i < 2; i++) {
      const orderId = await createOrder(app, passenger.token);
      await acceptOrder(app, driver.token, orderId);
      await request(app)
        .post(`/api/orders/${orderId}/start`)
        .set('Authorization', `Bearer ${driver.token}`);
      await request(app)
        .post(`/api/orders/${orderId}/complete`)
        .set('Authorization', `Bearer ${driver.token}`);
    }

    // Request payouts
    await request(app)
      .post('/api/earnings/payout')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ amount: 5000 });

    const res = await request(app)
      .get('/api/earnings/payouts')
      .set('Authorization', `Bearer ${driver.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('новый водитель имеет пустую историю выводов — 200', async () => {
    const driver = await registerOnlineDriver(app);

    const res = await request(app)
      .get('/api/earnings/payouts')
      .set('Authorization', `Bearer ${driver.token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});
