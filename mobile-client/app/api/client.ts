/**
 * Rides API client.
 *
 * Thin abstraction over the shared apiClient (axios instance).
 * Each function maps 1-to-1 to a backend ride endpoint and returns
 * the strongly-typed response body.
 */

import { apiClient } from '../services/api';

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface RideLocation {
  lat: number;
  lng: number;
}

export type RideStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Ride {
  id: string;
  userId: string;
  driverId: string | null;
  from: RideLocation;
  to: RideLocation;
  status: RideStatus;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Request / response shapes
// ---------------------------------------------------------------------------

export interface CreateRideParams {
  userId: string;
  from: RideLocation;
  to: RideLocation;
}

export interface AcceptRideParams {
  driverId: string;
}

// ---------------------------------------------------------------------------
// API methods
// ---------------------------------------------------------------------------

/**
 * Creates a new ride (called by the passenger).
 * POST /api/rides
 */
export async function createRide(params: CreateRideParams): Promise<Ride> {
  const { data } = await apiClient.post<Ride>('/rides', params);
  return data;
}

/**
 * Driver accepts a pending ride.
 * POST /api/rides/:id/accept
 */
export async function acceptRide(rideId: string, params: AcceptRideParams): Promise<Ride> {
  const { data } = await apiClient.post<Ride>(`/rides/${rideId}/accept`, params);
  return data;
}

/**
 * Driver starts the ride (passenger on board).
 * POST /api/rides/:id/start
 */
export async function startRide(rideId: string): Promise<Ride> {
  const { data } = await apiClient.post<Ride>(`/rides/${rideId}/start`);
  return data;
}

/**
 * Driver marks the ride as completed.
 * POST /api/rides/:id/complete
 */
export async function completeRide(rideId: string): Promise<Ride> {
  const { data } = await apiClient.post<Ride>(`/rides/${rideId}/complete`);
  return data;
}

/**
 * Cancel a ride (any party).
 * POST /api/rides/:id/cancel
 */
export async function cancelRide(rideId: string): Promise<Ride> {
  const { data } = await apiClient.post<Ride>(`/rides/${rideId}/cancel`);
  return data;
}

/**
 * Fetch a single ride by id.
 * GET /api/rides/:id
 */
export async function getRide(rideId: string): Promise<Ride> {
  const { data } = await apiClient.get<Ride>(`/rides/${rideId}`);
  return data;
}
