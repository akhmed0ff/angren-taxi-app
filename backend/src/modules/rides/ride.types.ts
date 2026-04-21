export const RIDE_STATUSES = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  ARRIVED: 'ARRIVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type RideStatus = (typeof RIDE_STATUSES)[keyof typeof RIDE_STATUSES];

export interface RideLocationPoint {
  lat: number;
  lng: number;
}

export type Ride = {
  id: string;
  userId: string;
  driverId: string | null;
  from: RideLocationPoint;
  to: RideLocationPoint;
  status: RideStatus;
  price: number;
  createdAt: Date;
  updatedAt: Date;
};

export type RideWithRelations = Ride;

export interface CreateRideData {
  userId: string;
  driverId?: string | null;
  from: RideLocationPoint;
  to: RideLocationPoint;
  status?: RideStatus;
  price: number;
}

export interface CreateRideDto {
  passengerId: string;
  pickupLatitude: number;
  pickupLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
}

export interface UpdateRideStatusDto {
  status: RideStatus;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}