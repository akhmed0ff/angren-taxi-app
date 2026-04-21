import { create } from 'zustand';
import type { Ride, RideLocation, RideStatus } from '../api/client';
import * as ridesApi from '../api/client';

// ---------------------------------------------------------------------------
// State & action types
// ---------------------------------------------------------------------------

type RequestStatus = 'idle' | 'loading' | 'error';

export interface DriverCoords {
  latitude: number;
  longitude: number;
}

interface RideState {
  /** Current active ride returned from the backend. */
  ride: Ride | null;

  /** Lifecycle status of the ride (mirrors backend RideStatus). */
  status: RideStatus | null;

  /** Real-time driver position received from socket 'driver:location'. */
  driverLocation: DriverCoords | null;

  /** Async request state — 'loading' while any action awaits the API. */
  requestStatus: RequestStatus;

  /** Last error message, if any. */
  error: string | null;

  // Actions
  createRide: (userId: string, from: RideLocation, to: RideLocation) => Promise<void>;
  acceptRide: (rideId: string, driverId: string) => Promise<void>;
  startRide: (rideId: string) => Promise<void>;
  completeRide: (rideId: string) => Promise<void>;
  cancelRide: (rideId: string) => Promise<void>;
  setDriverLocation: (coords: DriverCoords) => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useRideStore = create<RideState>((set) => ({
  ride: null,
  status: null,
  driverLocation: null,
  requestStatus: 'idle',
  error: null,

  async createRide(userId, from, to) {
    set({ requestStatus: 'loading', error: null });
    try {
      const ride = await ridesApi.createRide({ userId, from, to });
      set({ ride, status: ride.status, requestStatus: 'idle' });
    } catch (err) {
      set({ requestStatus: 'error', error: extractMessage(err) });
    }
  },

  async acceptRide(rideId, driverId) {
    set({ requestStatus: 'loading', error: null });
    try {
      const ride = await ridesApi.acceptRide(rideId, { driverId });
      set({ ride, status: ride.status, requestStatus: 'idle' });
    } catch (err) {
      set({ requestStatus: 'error', error: extractMessage(err) });
    }
  },

  async startRide(rideId) {
    set({ requestStatus: 'loading', error: null });
    try {
      const ride = await ridesApi.startRide(rideId);
      set({ ride, status: ride.status, requestStatus: 'idle' });
    } catch (err) {
      set({ requestStatus: 'error', error: extractMessage(err) });
    }
  },

  async completeRide(rideId) {
    set({ requestStatus: 'loading', error: null });
    try {
      const ride = await ridesApi.completeRide(rideId);
      set({ ride, status: ride.status, requestStatus: 'idle' });
    } catch (err) {
      set({ requestStatus: 'error', error: extractMessage(err) });
    }
  },

  async cancelRide(rideId) {
    set({ requestStatus: 'loading', error: null });
    try {
      const ride = await ridesApi.cancelRide(rideId);
      set({ ride, status: ride.status, requestStatus: 'idle' });
    } catch (err) {
      set({ requestStatus: 'error', error: extractMessage(err) });
    }
  },

  setDriverLocation(coords) {
    set({ driverLocation: coords });
  },

  reset() {
    set({ ride: null, status: null, driverLocation: null, requestStatus: 'idle', error: null });
  },
}));
