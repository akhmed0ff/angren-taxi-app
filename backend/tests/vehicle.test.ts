import request from 'supertest';
import { afterAll, describe, expect, it } from '@jest/globals';
import { createApp } from '../src/createApp';
import { closeDatabase } from '../src/config/database';
import { registerUser, registerOnlineDriver, createOrder } from './helpers';

const app = createApp();

afterAll(() => closeDatabase());

describe('PUT /api/drivers/vehicle — update vehicle information', () => {
  it('водитель может добавить информацию об автомобиле — 200', async () => {
    const driver = await registerOnlineDriver(app);

    const res = await request(app)
      .put('/api/drivers/vehicle')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({
        make: 'Toyota',
        model: 'Camry',
        color: 'white',
        plate: 'A001AA',
        year: 2022,
        category: 'comfort',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.make).toBe('Toyota');
    expect(res.body.data.plate).toBe('A001AA');
  });

  it('водитель может обновить существующий автомобиль — 200', async () => {
    const driver = await registerOnlineDriver(app);

    // Add vehicle first
    await request(app)
      .put('/api/drivers/vehicle')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({
        make: 'Toyota',
        model: 'Camry',
        color: 'white',
        plate: 'A001AA',
        year: 2022,
        category: 'comfort',
      });

    // Update vehicle
    const res = await request(app)
      .put('/api/drivers/vehicle')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({
        make: 'Honda',
        model: 'Accord',
        color: 'black',
        plate: 'B001BB',
        year: 2023,
        category: 'premium',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.make).toBe('Honda');
    expect(res.body.data.plate).toBe('B001BB');
    expect(res.body.data.category).toBe('premium');
  });

  it('возвращает 400 если не указаны обязательные поля — 400', async () => {
    const driver = await registerOnlineDriver(app);

    const res = await request(app)
      .put('/api/drivers/vehicle')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({
        make: 'Toyota',
        model: 'Camry',
        // missing other fields
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('возвращает 400 если год некорректный — 400', async () => {
    const driver = await registerOnlineDriver(app);

    const res = await request(app)
      .put('/api/drivers/vehicle')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({
        make: 'Toyota',
        model: 'Camry',
        color: 'white',
        plate: 'A001AA',
        year: 1800, // Too old
        category: 'comfort',
      });

    expect(res.status).toBe(400);
  });

  it('возвращает 400 если категория некорректная — 400', async () => {
    const driver = await registerOnlineDriver(app);

    const res = await request(app)
      .put('/api/drivers/vehicle')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({
        make: 'Toyota',
        model: 'Camry',
        color: 'white',
        plate: 'A001AA',
        year: 2022,
        category: 'invalid_category',
      });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/drivers/vehicle — get active vehicle', () => {
  it('водитель может получить свой активный автомобиль — 200', async () => {
    const driver = await registerOnlineDriver(app);

    // Add vehicle first
    await request(app)
      .put('/api/drivers/vehicle')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({
        make: 'Toyota',
        model: 'Camry',
        color: 'white',
        plate: 'A001AA',
        year: 2022,
        category: 'comfort',
      });

    const res = await request(app)
      .get('/api/drivers/vehicle')
      .set('Authorization', `Bearer ${driver.token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.make).toBe('Toyota');
    expect(res.body.data.is_active).toBe(1);
  });

  it('возвращает 404 если у водителя нет автомобиля — 404', async () => {
    const driver = await registerOnlineDriver(app);

    const res = await request(app)
      .get('/api/drivers/vehicle')
      .set('Authorization', `Bearer ${driver.token}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/drivers/documents — document upload', () => {
  it('возвращает 501 Not Implemented для загрузки документов', async () => {
    const driver = await registerOnlineDriver(app);

    const res = await request(app)
      .post('/api/drivers/documents')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({
        documentType: 'license',
        documentNumber: '123456789',
      });

    expect(res.status).toBe(501);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('будет доступна');
  });

  it('возвращает 400 если не указаны документы — 400', async () => {
    const driver = await registerOnlineDriver(app);

    const res = await request(app)
      .post('/api/drivers/documents')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('POST /api/orders/accept — validate vehicle before accepting order', () => {
  it('водитель может принять заказ только если есть активный автомобиль — 200', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    // Add vehicle
    await request(app)
      .put('/api/drivers/vehicle')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({
        make: 'Toyota',
        model: 'Camry',
        color: 'white',
        plate: 'A001AA',
        year: 2022,
        category: 'economy',
      });

    const orderId = await createOrder(app, passenger.token);

    const res = await request(app)
      .post('/api/orders/accept')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ orderId, vehicleId: driver.id });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('водитель не может принять заказ без активного автомобиля — 400', async () => {
    const passenger = await registerUser(app);
    const driver = await registerOnlineDriver(app);

    const orderId = await createOrder(app, passenger.token);

    const res = await request(app)
      .post('/api/orders/accept')
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ orderId, vehicleId: driver.id });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('автомобиля');
  });
});
