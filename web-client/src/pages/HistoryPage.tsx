import { useEffect, useState } from 'react';
import { getHistory, getOrderById } from '../api/orders';
import { useAuthStore } from '../store/auth';
import type { Order } from '../types';

export function HistoryPage() {
  const auth = useAuthStore();
  const [items, setItems] = useState<Order[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    getHistory()
      .then(setItems)
      .catch(async () => {
        // Backend history can be driver-only in current build; fallback to local active order.
        const activeId = localStorage.getItem('angren_active_order_id');
        if (!activeId) {
          setError('История сейчас недоступна для пассажира в API.');
          return;
        }
        try {
          const order = await getOrderById(activeId);
          setItems([order]);
          setError('Показан локальный заказ (fallback).');
        } catch {
          setError('История недоступна.');
        }
      });
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) {
    return <section className="card"><p>Войдите, чтобы увидеть историю.</p></section>;
  }

  return (
    <section className="card">
      <h2>История заказов</h2>
      {error ? <p className="muted">{error}</p> : null}
      {!items.length ? <p>Пока нет заказов.</p> : null}
      <ul className="list">
        {items.map((o) => (
          <li key={o.id}>
            <strong>{o.status}</strong> · {o.from_address} {'->'} {o.to_address}
          </li>
        ))}
      </ul>
    </section>
  );
}
