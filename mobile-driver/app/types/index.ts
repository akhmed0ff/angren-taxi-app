// ─── User & Auth ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  name: string;
  firstName?: string;
  lastName?: string;
  type: 'passenger' | 'driver' | 'admin';
  language?: string;
  created_at?: number;
  email?: string;
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  login: string; // email or phone
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  vehicleCategory: VehicleCategory;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePlate: string;
  vehicleColor: string;
}

// ─── Driver ──────────────────────────────────────────────────────────────────

export type VehicleCategory = 'economy' | 'comfort' | 'premium';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  color: string;
  category: VehicleCategory;
}

export interface DriverLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface DriverStats {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  rating: number;
  totalEarnings: number;
  todayEarnings: number;
  todayOrders: number;
  acceptanceRate: number;
}

export interface Driver {
  id: string;
  user: User;
  vehicle: Vehicle;
  stats: DriverStats;
  isOnline: boolean;
  isVerified: boolean;
  documentsStatus: DocumentsStatus;
}

export type DocumentsStatus = 'pending' | 'verified' | 'rejected' | 'missing';

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  title: string;
  subtitle?: string;
  coordinates: Coordinates;
}

export interface Passenger {
  id: string;
  firstName: string;
  lastName: string;
  rating: number;
  phone: string;
  avatarUrl?: string;
  totalTrips: number;
}

export interface Order {
  id: string;
  passenger: Passenger;
  pickupAddress: Address;
  destinationAddress: Address;
  status: OrderStatus;
  price: number;
  distance: number; // km
  duration: number; // minutes
  vehicleCategory: VehicleCategory;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  driverNote?: string;
  paymentMethod: PaymentMethod;
}

export type PaymentMethod = 'cash' | 'card' | 'wallet';

// ─── Earnings ────────────────────────────────────────────────────────────────

export interface DailyEarning {
  date: string;
  earnings: number;
  orders: number;
  hours: number;
}

export interface Payout {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt?: string;
  bankAccount?: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  pendingPayout: number;
  dailyBreakdown: DailyEarning[];
  payouts: Payout[];
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  passenger: Pick<Passenger, 'id' | 'firstName' | 'lastName' | 'avatarUrl'>;
  rating: number;
  comment?: string;
  orderId: string;
  createdAt: string;
  tags?: ReviewTag[];
}

export type ReviewTag =
  | 'friendly'
  | 'punctual'
  | 'clean_car'
  | 'safe_driving'
  | 'knows_route'
  | 'polite';

export interface RatingsSummary {
  overallRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
  reviews: Review[];
  tagCounts: Partial<Record<ReviewTag, number>>;
}

// ─── Documents ───────────────────────────────────────────────────────────────

export type DocumentType =
  | 'drivers_license'
  | 'vehicle_registration'
  | 'insurance';

export interface Document {
  type: DocumentType;
  url?: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  uploadedAt?: string;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Documents: undefined;
  BankDetails: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Orders: undefined;
  Earnings: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  AvailableOrders: undefined;
  ActiveOrder: { orderId: string };
  OrderHistory: undefined;
  Settings: undefined;
  Ratings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
}

// ─── WebSocket ───────────────────────────────────────────────────────────────

export type SocketEvent =
  | 'ride:created'
  | 'ride:accepted'
  | 'ride:started'
  | 'ride:completed'
  | 'driver:location'
  | 'order_cancelled'
  | 'ping'
  | 'pong';

export interface SocketMessage {
  event: SocketEvent;
  data: unknown;
}
