import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────────────────────

export type TariffType = 'standard' | 'comfort' | 'delivery';
export type OrderStatusType =
  | 'idle'
  | 'searching'
  | 'driver_found'
  | 'on_the_way'
  | 'in_progress'
  | 'completed';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface TaxiAppState {
  // User location
  userLocation: Location | null;

  // Route info
  from: string;
  to: string;

  // Order preferences
  tariff: TariffType;
  baggage: boolean;
  airConditioner: boolean;
  bonusBalance: number;

  // Order state
  orderStatus: OrderStatusType;

  // Actions
  setLocation: (location: Location) => void;
  setRoute: (from: string, to: string) => void;
  setTariff: (tariff: TariffType) => void;
  setBaggage: (enabled: boolean) => void;
  setAirConditioner: (enabled: boolean) => void;
  setBonusBalance: (amount: number) => void;
  setOrderStatus: (status: OrderStatusType) => void;

  // Helper actions
  resetOrder: () => void;
  clearRoute: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

const initialState = {
  userLocation: null,
  from: '',
  to: '',
  tariff: 'standard' as TariffType,
  baggage: false,
  airConditioner: false,
  bonusBalance: 0,
  orderStatus: 'idle' as OrderStatusType,
};

export const useTaxiStore = create<TaxiAppState>((set) => ({
  ...initialState,

  setLocation: (location: Location) =>
    set({ userLocation: location }),

  setRoute: (from: string, to: string) =>
    set({ from, to }),

  setTariff: (tariff: TariffType) =>
    set({ tariff }),

  setBaggage: (enabled: boolean) =>
    set({ baggage: enabled }),

  setAirConditioner: (enabled: boolean) =>
    set({ airConditioner: enabled }),

  setBonusBalance: (amount: number) =>
    set({ bonusBalance: amount }),

  setOrderStatus: (status: OrderStatusType) =>
    set({ orderStatus: status }),

  resetOrder: () =>
    set(initialState),

  clearRoute: () =>
    set({ from: '', to: '' }),
}));
