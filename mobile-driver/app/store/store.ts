import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import driverReducer from './slices/driver.slice';
import ordersReducer from './slices/orders.slice';
import earningsReducer from './slices/earnings.slice';
import ratingsReducer from './slices/ratings.slice';
import uiReducer from './slices/ui.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    driver: driverReducer,
    orders: ordersReducer,
    earnings: earningsReducer,
    ratings: ratingsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['driver/setCurrentLocation'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
