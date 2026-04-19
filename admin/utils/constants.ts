// ─── App constants ───────────────────────────────────────────────────────────

export const APP_NAME = 'АНГРЕН ТАКСИ';
export const APP_NAME_EN = 'Angren Taxi';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3000';

export const TOKEN_KEY = 'angren_admin_token';
export const USER_KEY = 'angren_admin_user';

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// ─── Order statuses ──────────────────────────────────────────────────────────

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Ожидание',
  searching: 'Поиск водителя',
  accepted: 'Принят',
  arrived: 'Водитель прибыл',
  in_progress: 'В пути',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'default',
  searching: 'processing',
  accepted: 'blue',
  arrived: 'cyan',
  in_progress: 'orange',
  completed: 'success',
  cancelled: 'error',
};

// ─── User statuses ───────────────────────────────────────────────────────────

export const USER_STATUS_LABELS: Record<string, string> = {
  active: 'Активен',
  blocked: 'Заблокирован',
  pending: 'На проверке',
};

export const USER_STATUS_COLORS: Record<string, string> = {
  active: 'success',
  blocked: 'error',
  pending: 'warning',
};

// ─── Driver statuses ─────────────────────────────────────────────────────────

export const DRIVER_STATUS_LABELS: Record<string, string> = {
  active: 'Активен',
  offline: 'Оффлайн',
  blocked: 'Заблокирован',
  pending: 'На проверке',
  on_trip: 'В поездке',
};

export const DRIVER_STATUS_COLORS: Record<string, string> = {
  active: 'success',
  offline: 'default',
  blocked: 'error',
  pending: 'warning',
  on_trip: 'processing',
};

// ─── Vehicle categories ───────────────────────────────────────────────────────

export const VEHICLE_CATEGORY_LABELS: Record<string, string> = {
  economy: 'Эконом',
  comfort: 'Комфорт',
  business: 'Бизнес',
  minivan: 'Минивэн',
};

// ─── Payment methods ─────────────────────────────────────────────────────────

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Наличные',
  card: 'Карта',
  wallet: 'Кошелёк',
};

// ─── Transaction types ───────────────────────────────────────────────────────

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  commission: 'Комиссия',
  payout: 'Выплата',
  refund: 'Возврат',
  top_up: 'Пополнение',
  penalty: 'Штраф',
};

export const TRANSACTION_TYPE_COLORS: Record<string, string> = {
  commission: 'green',
  payout: 'blue',
  refund: 'orange',
  top_up: 'cyan',
  penalty: 'red',
};

// ─── Ticket statuses ─────────────────────────────────────────────────────────

export const TICKET_STATUS_LABELS: Record<string, string> = {
  open: 'Открыт',
  in_progress: 'В работе',
  resolved: 'Решён',
  closed: 'Закрыт',
};

export const TICKET_STATUS_COLORS: Record<string, string> = {
  open: 'error',
  in_progress: 'processing',
  resolved: 'success',
  closed: 'default',
};

export const TICKET_PRIORITY_LABELS: Record<string, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  urgent: 'Срочный',
};

export const TICKET_PRIORITY_COLORS: Record<string, string> = {
  low: 'default',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

// ─── Navigation items ─────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { key: '/dashboard', label: 'Дашборд', icon: 'DashboardOutlined' },
  { key: '/orders', label: 'Заказы', icon: 'CarOutlined' },
  { key: '/drivers', label: 'Водители', icon: 'TeamOutlined' },
  { key: '/users', label: 'Пассажиры', icon: 'UserOutlined' },
  { key: '/analytics', label: 'Аналитика', icon: 'BarChartOutlined' },
  { key: '/finances', label: 'Финансы', icon: 'DollarOutlined' },
  { key: '/support', label: 'Поддержка', icon: 'CustomerServiceOutlined' },
  { key: '/settings', label: 'Настройки', icon: 'SettingOutlined' },
  { key: '/security', label: 'Безопасность', icon: 'SafetyOutlined' },
];
