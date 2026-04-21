// ─── Core domain types ───────────────────────────────────────────────────────

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export type CarClass = 'economy' | 'comfort' | 'premium';
export type PaymentMethod = 'cash' | 'card';
export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'arrived'
  | 'inProgress'
  | 'completed'
  | 'cancelled';
export type DriverStatus = 'available' | 'busy' | 'offline';
export type BonusType = 'earned' | 'spent';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type Language = 'ru' | 'uz';
export type Theme = 'light' | 'dark';

export interface Vehicle {
  make: string;
  model: string;
  color: string;
  plateNumber: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  bonusBalance: number;
  rating: number;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  rating: number;
  vehicle: Vehicle;
  location: Location;
  status: DriverStatus;
}

export interface Order {
  id: string;
  passengerId: string;
  driverId?: string;
  driver?: Driver;
  status: OrderStatus;
  from: Location;
  to: Location;
  carClass: CarClass;
  price: number;
  distance: number;
  duration: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
}

export interface BonusTransaction {
  id: string;
  userId: string;
  amount: number;
  type: BonusType;
  orderId?: string;
  description: string;
  createdAt: string;
}

// ─── Service data transfer types ─────────────────────────────────────────────

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface CreateOrderData {
  from: Location;
  to: Location;
  carClass: CarClass;
  paymentMethod: PaymentMethod;
}

export interface PriceEstimate {
  price: number;
  distance: number;
  duration: number;
}

// ─── Redux state slices ───────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface OrdersState {
  currentOrder: Order | null;
  orderHistory: Order[];
  total: number;
  page: number;
  isLoading: boolean;
  error: string | null;
}

export interface DriversState {
  availableDrivers: Driver[];
  selectedDriver: Driver | null;
  isLoading: boolean;
  error: string | null;
}

export interface BonusesState {
  balance: number;
  history: BonusTransaction[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

export interface PaymentsState {
  paymentMethod: PaymentMethod;
  history: Payment[];
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  isLoading: boolean;
  error: string | null;
  language: Language;
  theme: Theme;
}

export interface RideState {
  activeRideId: string | null;
  status: string | null;
  driverLocation: Location | null;
}

// ─── Navigation param lists ───────────────────────────────────────────────────

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  OrderHistory: undefined;
  Bonuses: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  Main: undefined;
  Details: undefined;
  MainTabs: undefined;
  OrderCreate: undefined;
  OrderTracking: { orderId: string };
  TripDetails: undefined;
  UserMenu: undefined;
  Payment: { orderId: string; amount: number };
  MyPlaces: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
};
