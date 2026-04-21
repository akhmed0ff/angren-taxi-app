import { create } from 'zustand';

type Language = 'ru' | 'uz';

interface UiStore {
  isLoading: boolean;
  error: string | null;
  language: Language;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  setLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
  setLanguage: (value: Language) => void;
  setNotificationsEnabled: (value: boolean) => void;
  setSoundEnabled: (value: boolean) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  isLoading: false,
  error: null,
  language: 'ru',
  notificationsEnabled: true,
  soundEnabled: true,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setLanguage: (language) => set({ language }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
}));
