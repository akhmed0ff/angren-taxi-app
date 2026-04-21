import { create } from 'zustand';
import type { Language } from '../types';

interface UiStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  language: 'ru',
  setLanguage: (language) => set({ language }),
}));
