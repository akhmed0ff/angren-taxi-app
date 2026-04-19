import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/auth.slice';
import ordersReducer from './slices/orders.slice';
import driversReducer from './slices/drivers.slice';
import bonusesReducer from './slices/bonuses.slice';
import paymentsReducer from './slices/payments.slice';
import uiReducer from './slices/ui.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    orders: ordersReducer,
    drivers: driversReducer,
    bonuses: bonusesReducer,
    payments: paymentsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
