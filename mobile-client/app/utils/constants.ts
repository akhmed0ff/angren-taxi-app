export const API_BASE_URL =
  (process.env['API_BASE_URL'] as string | undefined) ?? 'http://localhost:3000/api';

export const SOCKET_URL =
  (process.env['SOCKET_URL'] as string | undefined) ?? 'ws://localhost:3000';

export const CAR_CLASSES = {
  economy: { label: 'Эконом', multiplier: 1, icon: '🚗' },
  comfort: { label: 'Комфорт', multiplier: 1.5, icon: '🚙' },
  premium: { label: 'Премиум', multiplier: 2.5, icon: '🏎️' },
} as const;

export const BONUS_CASHBACK_PERCENT = 1;
export const BASE_PRICE_PER_KM = 500; // in sum (UZS)

export const COLORS = {
  primary: '#FFC500',
  secondary: '#34a853',
  danger: '#ea4335',
  warning: '#fbbc05',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#202124',
  textSecondary: '#5f6368',
  border: '#e0e0e0',
  disabled: '#bdbdbd',
} as const;

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: '#fbbc05',
  accepted: '#1a73e8',
  arrived: '#9c27b0',
  inProgress: '#34a853',
  completed: '#34a853',
  cancelled: '#ea4335',
};

export const SECURE_STORE_KEYS = {
  token: 'auth_token',
  refreshToken: 'auth_refresh_token',
} as const;
