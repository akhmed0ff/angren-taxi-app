import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd.MM.yyyy', { locale: ru });
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'dd.MM.yyyy HH:mm', { locale: ru });
}

export function formatRelative(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: ru });
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number, currency = 'UZS'): string {
  if (currency === 'UZS') {
    return new Intl.NumberFormat('ru-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' сум';
  }
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} млрд сум`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} млн сум`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)} тыс сум`;
  }
  return formatCurrency(amount);
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('ru-RU').format(n);
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`;
  return `${km.toFixed(1)} км`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} мин`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// ─── Phone ───────────────────────────────────────────────────────────────────

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('998') && cleaned.length === 12) {
    return `+998 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10)}`;
  }
  return phone;
}

// ─── Growth indicator ────────────────────────────────────────────────────────

export function formatGrowth(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
