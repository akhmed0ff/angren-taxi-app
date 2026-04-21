export interface DriverLocation {
  lat: number;
  lng: number;
}

export interface Driver {
  id: string;
  isOnline: boolean;
  location: DriverLocation;
  currentRideId: string | null;
}

export interface CreateDriverData {
  isOnline?: boolean;
  location: DriverLocation;
  currentRideId?: string | null;
}

export interface UpdateDriverData {
  isOnline?: boolean;
  location?: DriverLocation;
  currentRideId?: string | null;
}
