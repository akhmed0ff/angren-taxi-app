import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vehicle, DriverLocation, DriverStats, DocumentsStatus } from '../../types';

interface DriverState {
  isOnline: boolean;
  currentLocation: DriverLocation | null;
  vehicle: Vehicle | null;
  stats: DriverStats | null;
  documentsStatus: DocumentsStatus;
  isVerified: boolean;
  isUpdatingStatus: boolean;
  error: string | null;
}

const initialState: DriverState = {
  isOnline: false,
  currentLocation: null,
  vehicle: null,
  stats: null,
  documentsStatus: 'missing',
  isVerified: false,
  isUpdatingStatus: false,
  error: null,
};

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    setOnlineStatus(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    setUpdatingStatus(state, action: PayloadAction<boolean>) {
      state.isUpdatingStatus = action.payload;
    },
    setCurrentLocation(state, action: PayloadAction<DriverLocation>) {
      state.currentLocation = action.payload;
    },
    setVehicle(state, action: PayloadAction<Vehicle>) {
      state.vehicle = action.payload;
    },
    setStats(state, action: PayloadAction<DriverStats>) {
      state.stats = action.payload;
    },
    updateStats(state, action: PayloadAction<Partial<DriverStats>>) {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },
    setDocumentsStatus(state, action: PayloadAction<DocumentsStatus>) {
      state.documentsStatus = action.payload;
    },
    setVerified(state, action: PayloadAction<boolean>) {
      state.isVerified = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetDriver(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setOnlineStatus,
  setUpdatingStatus,
  setCurrentLocation,
  setVehicle,
  setStats,
  updateStats,
  setDocumentsStatus,
  setVerified,
  setError,
  resetDriver,
} = driverSlice.actions;

export default driverSlice.reducer;
