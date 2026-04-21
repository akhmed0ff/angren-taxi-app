import { Router } from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.middleware';
import { getDatabase } from '../config/database';

const router = Router();

// Все admin-маршруты требуют auth + adminOnly
router.use(authMiddleware, adminOnly);

router.get('/stats', (_req, res) => {
  const db = getDatabase();
  const stats = {
    users: (db.prepare("SELECT COUNT(*) as c FROM users WHERE type='passenger'").get() as any).c,
    drivers: (db.prepare("SELECT COUNT(*) as c FROM drivers").get() as any).c,
    driversOnline: (db.prepare("SELECT COUNT(*) as c FROM drivers WHERE status='online'").get() as any).c,
    ordersTotal: (db.prepare("SELECT COUNT(*) as c FROM orders").get() as any).c,
    ordersToday: (db.prepare("SELECT COUNT(*) as c FROM orders WHERE created_at > strftime('%s', 'now', '-1 day')").get() as any).c,
    revenue: (db.prepare("SELECT COALESCE(SUM(final_price),0) as r FROM orders WHERE status='completed'").get() as any).r,
  };
  res.json({ success: true, data: stats });
});

router.get('/drivers', (_req, res) => {
  const db = getDatabase();
  const drivers = db.prepare(
    `SELECT d.*, u.name, u.phone FROM drivers d JOIN users u ON d.user_id = u.id ORDER BY d.created_at DESC`
  ).all();
  res.json({ success: true, data: drivers });
});

router.get('/orders', (_req, res) => {
  const db = getDatabase();
  const orders = db.prepare(
    `SELECT o.*, u.name as passenger_name FROM orders o
     JOIN users u ON o.passenger_id = u.id
     ORDER BY o.created_at DESC LIMIT 100`
  ).all();
  res.json({ success: true, data: orders });
});

export default router;
