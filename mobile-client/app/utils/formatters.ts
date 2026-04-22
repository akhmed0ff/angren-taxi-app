import type { OrderStatus } from '../types';

/** Formats a numeric sum amount as a human-readable Uzbek sum string, e.g. "15 000 сум". */
export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('ru-RU')} сум`;
}

/** Formats an ISO date string or Date object to a short localised string. */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Formats a duration in minutes to a human-readable string, e.g. "1 ч 30 мин". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
}

/** Formats a distance in metres to a human-readable string, e.g. "12.5 км" or "850 м". */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} м`;
  return `${(meters / 1000).toFixed(1)} км`;
}

/** Formats an Uzbek phone number to +998 XX XXX-XX-XX display form. */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Normalise to 12-digit string starting with 998
  const normalised = digits.startsWith('998')
    ? digits
    : digits.startsWith('0')
    ? `998${digits.slice(1)}`
    : digits;
  if (normalised.length !== 12) return phone;
  return `+${normalised.slice(0, 3)} ${normalised.slice(3, 5)} ${normalised.slice(
    5,
    8,
  )}-${normalised.slice(8, 10)}-${normalised.slice(10)}`;
}

/** Returns a localised human-readable label for an order status. */
export function formatOrderStatus(status: OrderStatus, t: (key: string) => string): string {
  const map: Record<OrderStatus, string> = {
    pending: t('order.status.pending'),
    accepted: t('order.status.accepted'),
    arrived: t('order.status.arrived'),
    in_progress: t('order.status.inProgress'),
    completed: t('order.status.completed'),
    cancelled: t('order.status.cancelled'),
  };
  return map[status] ?? status;
}
