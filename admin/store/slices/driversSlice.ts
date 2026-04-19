import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DriversState } from '@/types';
import { driversService, type DriversQuery } from '@/services/drivers.service';

const initialState: DriversState = {
  list: [],
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  error: null,
  selectedDriver: null,
};

export const fetchDrivers = createAsyncThunk(
  'drivers/fetchAll',
  async (query: DriversQuery, { rejectWithValue }) => {
    try {
      return await driversService.getDrivers(query);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка загрузки');
    }
  },
);

export const fetchDriverById = createAsyncThunk(
  'drivers/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await driversService.getDriverById(id);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка загрузки');
    }
  },
);

export const blockDriverThunk = createAsyncThunk(
  'drivers/block',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      await driversService.blockDriver(id, reason);
      return id;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка');
    }
  },
);

export const approveDriverThunk = createAsyncThunk(
  'drivers/approve',
  async (id: string, { rejectWithValue }) => {
    try {
      await driversService.approveDriver(id);
      return id;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка');
    }
  },
);

const driversSlice = createSlice({
  name: 'drivers',
  initialState,
  reducers: {
    clearSelectedDriver(state) {
      state.selectedDriver = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDrivers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDrivers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchDrivers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDriverById.fulfilled, (state, action) => {
        state.selectedDriver = action.payload;
      })
      .addCase(blockDriverThunk.fulfilled, (state, action) => {
        const driver = state.list.find((d) => d.id === action.payload);
        if (driver) driver.status = 'blocked';
      })
      .addCase(approveDriverThunk.fulfilled, (state, action) => {
        const driver = state.list.find((d) => d.id === action.payload);
        if (driver) driver.status = 'active';
      });
  },
});

export const { clearSelectedDriver } = driversSlice.actions;
export default driversSlice.reducer;
