import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { UsersState } from '@/types';
import { usersService, type UsersQuery } from '@/services/users.service';

const initialState: UsersState = {
  list: [],
  total: 0,
  page: 1,
  limit: 20,
  isLoading: false,
  error: null,
  selectedUser: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (query: UsersQuery, { rejectWithValue }) => {
    try {
      return await usersService.getUsers(query);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка загрузки');
    }
  },
);

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await usersService.getUserById(id);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка загрузки');
    }
  },
);

export const blockUserThunk = createAsyncThunk(
  'users/block',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      await usersService.blockUser(id, reason);
      return id;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка блокировки');
    }
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(blockUserThunk.fulfilled, (state, action) => {
        const user = state.list.find((u) => u.id === action.payload);
        if (user) user.status = 'blocked';
      });
  },
});

export const { clearSelectedUser } = usersSlice.actions;
export default usersSlice.reducer;
