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
  | 'in_progress'
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
  phone: string;
  name: string;
  type: 'passenger' | 'driver';
  language?: string;
  created_at?: number;
  email?: string;
  avatar?: string;
  bonusBalance?: number;
  rating?: number;
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
  category?: CarClass;
  price: number;
  distance: number;
  duration: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  // Backend flat fields
  from_address?: string;
  from_latitude?: number;
  from_longitude?: number;
  to_address?: string;
  to_latitude?: number;
  to_longitude?: number;
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
  Auth: undefined;
  Main: undefined;
};
