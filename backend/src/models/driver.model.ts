export interface Driver {
  id: string;
  user_id: string;
  status: 'online' | 'offline' | 'busy';
  latitude: number | null;
  longitude: number | null;
  rating: number;
  total_rides: number;
  balance: number;
  prepaid_balance: number;
  created_at: number;
  updated_at: number;
}

export interface DriverWithUser extends Driver {
  phone: string;
  name: string;
}
