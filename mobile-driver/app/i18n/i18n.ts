import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ru from './ru.json';
import uz from './uz.json';

const LANGUAGE_KEY = '@angren_driver:language';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: (callback: (lng: string) => void) => {
    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((lng) => callback(lng ?? 'ru'))
      .catch(() => callback('ru'));
  },
  init: () => {},
  cacheUserLanguage: (lng: string) => {
    AsyncStorage.setItem(LANGUAGE_KEY, lng).catch(() => {});
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      uz: { translation: uz },
    },
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
  });

export default i18n;
