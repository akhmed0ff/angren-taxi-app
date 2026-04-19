export interface Vehicle {
  id: string;
  driver_id: string;
  make: string;
  model: string;
  color: string;
  plate: string;
  year: number;
  category: 'economy' | 'comfort' | 'premium';
  is_active: number;
  created_at: number;
}
