import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import * as driversService from '../../services/drivers.service';
import type { DriversState, Driver, Location } from '../../types';

const initialState: DriversState = {
  availableDrivers: [],
  selectedDriver: null,
  isLoading: false,
  error: null,
};

export const fetchAvailableDriversThunk = createAsyncThunk(
  'drivers/fetchAvailable',
  async (
    payload: { location: Location; radius?: number },
    { rejectWithValue },
  ) => {
    try {
      return await driversService.getAvailableDrivers(payload.location, payload.radius);
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  },
);

const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    setSelectedDriver(state, action: { payload: Driver | null }) {
      state.selectedDriver = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAvailableDriversThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAvailableDriversThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.availableDrivers = action.payload;
    });
    builder.addCase(fetchAvailableDriversThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setSelectedDriver, clearError } = driversSlice.actions;
export default driversSlice.reducer;
