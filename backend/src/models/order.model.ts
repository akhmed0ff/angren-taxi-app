export interface Order {
  id: string;
  passenger_id: string;
  driver_id: string | null;
  vehicle_id: string | null;
  status: 'pending' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  category: 'economy' | 'comfort' | 'premium';
  from_address: string;
  from_latitude: number;
  from_longitude: number;
  to_address: string;
  to_latitude: number;
  to_longitude: number;
  estimated_price: number;
  final_price: number | null;
  payment_method: 'cash' | 'card';
  note: string | null;
  created_at: number;
  updated_at: number;
}

export interface CreateOrderInput {
  category: 'economy' | 'comfort' | 'premium';
  from_address: string;
  from_latitude: number;
  from_longitude: number;
  to_address: string;
  to_latitude: number;
  to_longitude: number;
  payment_method: 'cash' | 'card';
  note?: string;
}
