export type UserType = 'passenger' | 'driver' | 'admin';

export interface User {
  id: string;
  phone: string;
  name: string;
  type: UserType;
  language?: string;
  created_at: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
export type OrderCategory = 'economy' | 'comfort' | 'premium';
export type PaymentMethod = 'cash' | 'card';

export interface Order {
  id: string;
  passenger_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  status: OrderStatus;
  category: OrderCategory;
  from_address: string;
  from_latitude: number;
  from_longitude: number;
  to_address: string;
  to_latitude: number;
  to_longitude: number;
  estimated_price: number;
  final_price: number | null;
  payment_method: PaymentMethod;
  note: string | null;
  created_at: number;
  updated_at: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: { total?: number; page?: number; limit?: number };
}
