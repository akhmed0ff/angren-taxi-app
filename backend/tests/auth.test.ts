import request from 'supertest';
import { afterAll, describe, expect, it } from '@jest/globals';
import { createApp } from '../src/createApp';
import { closeDatabase } from '../src/config/database';
import { uniquePhone } from './helpers';

const app = createApp();

afterAll(() => closeDatabase());

describe('POST /api/auth/register', () => {
  it('регистрирует пассажира и возвращает токен', async () => {
    const res = await request(app).post('/api/auth/register').send({
      phone: uniquePhone(),
      name: 'Алишер Навоий',
      password: 'password123',
      type: 'passenger',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.type).toBe('passenger');
  });

  it('регистрирует водителя и создаёт запись в drivers', async () => {
    const res = await request(app).post('/api/auth/register').send({
      phone: uniquePhone(),
      name: 'Бахром Рашидов',
      password: 'securepass',
      type: 'driver',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.type).toBe('driver');
  });

  it('возвращает 409 при повторной регистрации с тем же номером', async () => {
    const phone = uniquePhone();
    await request(app).post('/api/auth/register').send({
      phone, name: 'Первый', password: 'password123', type: 'passenger',
    });

    const res = await request(app).post('/api/auth/register').send({
      phone, name: 'Второй', password: 'password123', type: 'passenger',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('возвращает 400 при слабом пароле (< 8 символов)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      phone: uniquePhone(),
      name: 'Тест',
      password: 'short',
      type: 'passenger',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('возвращает 400 при пустом имени (только пробелы)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      phone: uniquePhone(),
      name: '   ',
      password: 'password123',
      type: 'passenger',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('возвращает 400 при отсутствии обязательных полей', async () => {
    const res = await request(app).post('/api/auth/register').send({
      phone: uniquePhone(),
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
