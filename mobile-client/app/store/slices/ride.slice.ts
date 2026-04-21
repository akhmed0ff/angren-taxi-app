import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Location } from '../../types';

export interface RideRealtimeState {
  activeRideId: string | null;
  status: string | null;
  driverLocation: Location | null;
}

const initialState: RideRealtimeState = {
  activeRideId: null,
  status: null,
  driverLocation: null,
};

const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    setActiveRideId(state, action: PayloadAction<string | null>) {
      state.activeRideId = action.payload;
    },
    setRideStatus(state, action: PayloadAction<string | null>) {
      state.status = action.payload;
    },
    setDriverLocation(state, action: PayloadAction<Location | null>) {
      state.driverLocation = action.payload;
    },
    clearRideRealtimeState(state) {
      state.activeRideId = null;
      state.status = null;
      state.driverLocation = null;
    },
  },
});

export const {
  setActiveRideId,
  setRideStatus,
  setDriverLocation,
  clearRideRealtimeState,
} = rideSlice.actions;

export default rideSlice.reducer;
