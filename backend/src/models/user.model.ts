export interface User {
  id: string;
  phone: string;
  name: string;
  password_hash: string;
  type: 'passenger' | 'driver';
  language: string;
  created_at: number;
  updated_at: number;
}

export interface UserPublic {
  id: string;
  phone: string;
  name: string;
  type: 'passenger' | 'driver';
  language: string;
  created_at: number;
}
