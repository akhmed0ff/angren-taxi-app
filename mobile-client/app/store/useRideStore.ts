import { create } from 'zustand';
import type { Location } from '../types';

interface RideState {
  activeRideId: string | null;
  status: RideStatus | null;
  driverLocation: Location | null;
  ride: unknown;

  setActiveRide: (id: string | null) => void;
  setStatus: (status: RideStatus | null) => void;
  setDriverLocation: (loc: Location | null) => void;
  setRide: (ride: unknown) => void;
  reset: () => void;
}

type RideStatus = string;

export const useRideStore = create<RideState>((set) => ({
  activeRideId: null,
  status: null,
  driverLocation: null,
  ride: null,

  setActiveRide: (id) => set({ activeRideId: id }),
  setStatus: (status) => set({ status }),
  setDriverLocation: (loc) => set({ driverLocation: loc }),
  setRide: (ride) => set({ ride }),
  reset: () => set({ activeRideId: null, status: null, driverLocation: null, ride: null }),
}));
