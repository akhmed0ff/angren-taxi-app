// ─── Shared primitives ──────────────────────────────────────────────────────

export type ID = string;

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: ID;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'analyst';
  avatar?: string;
  createdAt: string;
  lastLogin: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ─── Users (passengers) ──────────────────────────────────────────────────────

export type UserStatus = 'active' | 'blocked' | 'pending';

export interface User {
  id: ID;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  status: UserStatus;
  totalOrders: number;
  totalSpent: number;
  rating: number;
  registeredAt: string;
  lastActivity: string;
  city: string;
}

export interface UsersState {
  list: User[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  selectedUser: User | null;
}

// ─── Drivers ─────────────────────────────────────────────────────────────────

export type DriverStatus = 'active' | 'offline' | 'blocked' | 'pending' | 'on_trip';

export interface Vehicle {
  id: ID;
  brand: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  category: 'economy' | 'comfort' | 'business' | 'minivan';
}

export interface Driver {
  id: ID;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  status: DriverStatus;
  vehicle: Vehicle;
  rating: number;
  totalTrips: number;
  totalEarnings: number;
  balance: number;
  licenseNumber: string;
  licenseExpiry: string;
  registeredAt: string;
  lastActivity: string;
  city: string;
  isOnline: boolean;
  location?: { lat: number; lng: number };
}

export interface DriversState {
  list: Driver[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  selectedDriver: Driver | null;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'searching'
  | 'accepted'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'wallet';

export interface OrderLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface Order {
  id: ID;
  userId: ID;
  userName: string;
  userPhone: string;
  driverId?: ID;
  driverName?: string;
  driverPhone?: string;
  status: OrderStatus;
  from: OrderLocation;
  to: OrderLocation;
  distance: number;
  duration: number;
  price: number;
  paymentMethod: PaymentMethod;
  category: Vehicle['category'];
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  cancelReason?: string;
  rating?: number;
  comment?: string;
}

export interface OrdersState {
  list: Order[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  selectedOrder: Order | null;
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalOrders: number;
  ordersGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  activeDrivers: number;
  driversGrowth: number;
  activeUsers: number;
  usersGrowth: number;
  avgOrderValue: number;
  completionRate: number;
  avgRating: number;
  cancelRate: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  commission: number;
}

export interface OrdersStatPoint {
  date: string;
  completed: number;
  cancelled: number;
  total: number;
}

export interface CategoryStat {
  category: string;
  value: number;
  percentage: number;
}

export interface AnalyticsState {
  metrics: DashboardMetrics | null;
  revenueData: RevenueDataPoint[];
  ordersStats: OrdersStatPoint[];
  categoryStats: CategoryStat[];
  isLoading: boolean;
  error: string | null;
  period: 'today' | 'week' | 'month' | 'year';
}

// ─── Finances ────────────────────────────────────────────────────────────────

export type TransactionType = 'commission' | 'payout' | 'refund' | 'top_up' | 'penalty';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: ID;
  type: TransactionType;
  amount: number;
  currency: 'UZS';
  status: TransactionStatus;
  description: string;
  relatedId?: ID;
  relatedName?: string;
  createdAt: string;
}

// ─── Support ─────────────────────────────────────────────────────────────────

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'payment' | 'driver' | 'app' | 'order' | 'other';

export interface SupportTicket {
  id: ID;
  userId: ID;
  userName: string;
  userPhone: string;
  userType: 'passenger' | 'driver';
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  replies: TicketReply[];
}

export interface TicketReply {
  id: ID;
  ticketId: ID;
  authorName: string;
  authorRole: 'admin' | 'user';
  message: string;
  createdAt: string;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface TariffSettings {
  economy: TariffConfig;
  comfort: TariffConfig;
  business: TariffConfig;
  minivan: TariffConfig;
}

export interface TariffConfig {
  baseFare: number;
  perKm: number;
  perMinute: number;
  minFare: number;
  surgePricing: boolean;
  surgeMultiplier: number;
}

export interface AppSettings {
  commissionRate: number;
  maxCancelRate: number;
  minDriverRating: number;
  searchRadius: number;
  autoDispatch: boolean;
  maintenanceMode: boolean;
  registrationOpen: boolean;
  supportPhone: string;
  supportEmail: string;
}

// ─── UI State ────────────────────────────────────────────────────────────────

export interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  notification: {
    show: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null;
}
