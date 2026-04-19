export interface Payment {
  id: string;
  order_id: string;
  passenger_id: string;
  driver_id: string | null;
  amount: number;
  method: 'cash' | 'card';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: number;
  updated_at: number;
}
