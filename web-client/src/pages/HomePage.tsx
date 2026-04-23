import { useEffect, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { createOrder, getOrderById } from '../api/orders';
import { useAuthStore } from '../store/auth';
import { useOrderStore } from '../store/orders';
import type { OrderCategory, PaymentMethod } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000';

export function HomePage() {
  const auth = useAuthStore();
  const { activeOrder, setActiveOrder, updateStatus, clearActiveOrder } = useOrderStore();

  const [fromAddress, setFromAddress] = useState('Ангрен, Центральная улица');
  const [toAddress, setToAddress] = useState('Ангрен, Вокзал');
  const [category, setCategory] = useState<OrderCategory>('economy');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [driverLocation, setDriverLocation] = useState<string>('нет данных');

  useEffect(() => {
    const savedOrderId = localStorage.getItem('angren_active_order_id');
    if (!savedOrderId || activeOrder) return;

    getOrderById(savedOrderId)
      .then((order) => setActiveOrder(order))
      .catch(() => localStorage.removeItem('angren_active_order_id'));
  }, [activeOrder, setActiveOrder]);

  useEffect(() => {
    if (!auth.token || !activeOrder?.id) return;

    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token: auth.token },
    });

    socket.on('connect', () => {
      socket.emit('ride:subscribe', activeOrder.id);
    });

    socket.on('ride:accepted', ({ rideId }: { rideId: string }) => {
      if (rideId === activeOrder.id) updateStatus('accepted');
    });

    socket.on('ride:started', ({ rideId }: { rideId: string }) => {
      if (rideId === activeOrder.id) updateStatus('in_progress');
    });

    socket.on('ride:completed', ({ rideId }: { rideId: string }) => {
      if (rideId === activeOrder.id) updateStatus('completed');
    });

    socket.on('ride:status:updated', ({ rideId, status }: { rideId: string; status: any }) => {
      if (rideId === activeOrder.id) updateStatus(status);
    });

    socket.on('driver:location', (payload: { rideId?: string; latitude: number; longitude: number }) => {
      if (!payload.rideId || payload.rideId === activeOrder.id) {
        setDriverLocation(`${payload.latitude.toFixed(5)}, ${payload.longitude.toFixed(5)}`);
      }
    });

    return () => {
      socket.emit('ride:unsubscribe', activeOrder.id);
      socket.disconnect();
    };
  }, [auth.token, activeOrder?.id, updateStatus]);

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.isAuthenticated) {
      setError('Сначала войдите в аккаунт.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const order = await createOrder({
        category,
        from_address: fromAddress,
        from_latitude: 41.0167,
        from_longitude: 70.1333,
        to_address: toAddress,
        to_latitude: 41.025,
        to_longitude: 70.11,
        payment_method: paymentMethod,
      });
      setActiveOrder(order);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Не удалось создать заказ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>Заказ такси (веб)</h2>
      <p className="muted">Этот экран нужен, чтобы быстро проверять взаимодействие с админкой: новые заказы, статусы, realtime.</p>

      {!activeOrder ? (
        <form onSubmit={handleCreateOrder} className="grid">
          <label>
            Откуда
            <input value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} />
          </label>
          <label>
            Куда
            <input value={toAddress} onChange={(e) => setToAddress(e.target.value)} />
          </label>
          <label>
            Категория
            <select value={category} onChange={(e) => setCategory(e.target.value as OrderCategory)}>
              <option value="economy">Эконом</option>
              <option value="comfort">Комфорт</option>
              <option value="premium">Премиум</option>
            </select>
          </label>
          <label>
            Оплата
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
              <option value="cash">Наличные</option>
              <option value="card">Карта</option>
            </select>
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button disabled={loading}>{loading ? 'Создание...' : 'Создать заказ'}</button>
        </form>
      ) : (
        <div className="grid">
          <div><strong>ID:</strong> {activeOrder.id}</div>
          <div><strong>Статус:</strong> {activeOrder.status}</div>
          <div><strong>Маршрут:</strong> {activeOrder.from_address} {'->'} {activeOrder.to_address}</div>
          <div><strong>Водитель (гео):</strong> {driverLocation}</div>
          <button onClick={() => clearActiveOrder()}>Очистить активный заказ</button>
        </div>
      )}
    </section>
  );
}
