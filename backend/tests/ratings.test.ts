import request from 'supertest';
import { afterAll, describe, expect, it } from '@jest/globals';
import { createApp } from '../src/createApp';
import { closeDatabase } from '../src/config/database';
import { registerUser, registerOnlineDriver, createOrder, acceptOrder } from './helpers';

const app = createApp();

afterAll(() => closeDatabase());

describe('POST /api/ratings/driver — passenger rating system', () => {
  it('пассажир может оценить водителя после завершенного заказа — 200', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    const orderId = await createOrder(app, passenger.token);
    await acceptOrder(app, driver.token, orderId);

    // Start the order
    await request(app)
      .post(`/api/orders/${orderId}/start`)
      .set('Authorization', `Bearer ${driver.token}`);

    // Complete the order
    await request(app)
      .post(`/api/orders/${orderId}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    // Rate the driver
    const res = await request(app)
      .post('/api/ratings/driver')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({
        orderId,
        score: 5,
        comment: 'Excellent driver!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('пассажир не может оценить то же событие дважды — 400', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    const orderId = await createOrder(app, passenger.token);
    await acceptOrder(app, driver.token, orderId);
    await request(app)
      .post(`/api/orders/${orderId}/start`)
      .set('Authorization', `Bearer ${driver.token}`);
    await request(app)
      .post(`/api/orders/${orderId}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    // First rating
    await request(app)
      .post('/api/ratings/driver')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({
        orderId,
        score: 5,
        comment: 'Great',
      });

    // Second rating attempt
    const res = await request(app)
      .post('/api/ratings/driver')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({
        orderId,
        score: 4,
        comment: 'Actually not that good',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('пассажир не может оценить незавершенный заказ — 400', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    const orderId = await createOrder(app, passenger.token);
    await acceptOrder(app, driver.token, orderId);

    // Order is still in 'accepted' status, not completed

    const res = await request(app)
      .post('/api/ratings/driver')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({
        orderId,
        score: 3,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('пассажир не может оценить чужой заказ — 403', async () => {
    const passenger1 = await registerUser(app);
    const passenger2 = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    const orderId = await createOrder(app, passenger1.token);
    await acceptOrder(app, driver.token, orderId);
    await request(app)
      .post(`/api/orders/${orderId}/start`)
      .set('Authorization', `Bearer ${driver.token}`);
    await request(app)
      .post(`/api/orders/${orderId}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    // passenger2 tries to rate
    const res = await request(app)
      .post('/api/ratings/driver')
      .set('Authorization', `Bearer ${passenger2.token}`)
      .send({
        orderId,
        score: 1,
        comment: 'Not my order',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('невалидная оценка возвращает 400', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    const orderId = await createOrder(app, passenger.token);
    await acceptOrder(app, driver.token, orderId);
    await request(app)
      .post(`/api/orders/${orderId}/start`)
      .set('Authorization', `Bearer ${driver.token}`);
    await request(app)
      .post(`/api/orders/${orderId}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    const res = await request(app)
      .post('/api/ratings/driver')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({
        orderId,
        score: 10, // Invalid: max is 5
      });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/ratings/driver — driver rating endpoints', () => {
  it('водитель может получить свое среднее рейтинговое распределение — 200', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    const orderId = await createOrder(app, passenger.token);
    await acceptOrder(app, driver.token, orderId);
    await request(app)
      .post(`/api/orders/${orderId}/start`)
      .set('Authorization', `Bearer ${driver.token}`);
    await request(app)
      .post(`/api/orders/${orderId}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    await request(app)
      .post('/api/ratings/driver')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({
        orderId,
        score: 5,
      });

    const res = await request(app)
      .get('/api/ratings/driver')
      .set('Authorization', `Bearer ${driver.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overallRating).toBe(5);
    expect(res.body.data.totalReviews).toBe(1);
    expect(res.body.data.ratingDistribution[5]).toBe(1);
  });

  it('водитель может получить список своих отзывов — 200', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    const orderId = await createOrder(app, passenger.token);
    await acceptOrder(app, driver.token, orderId);
    await request(app)
      .post(`/api/orders/${orderId}/start`)
      .set('Authorization', `Bearer ${driver.token}`);
    await request(app)
      .post(`/api/orders/${orderId}/complete`)
      .set('Authorization', `Bearer ${driver.token}`);

    await request(app)
      .post('/api/ratings/driver')
      .set('Authorization', `Bearer ${passenger.token}`)
      .send({
        orderId,
        score: 4,
        comment: 'Good driver',
      });

    const res = await request(app)
      .get('/api/ratings/driver/reviews')
      .set('Authorization', `Bearer ${driver.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].score).toBe(4);
    expect(res.body.data[0].comment).toBe('Good driver');
  });
});
