import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ru from './ru.json';
import uz from './uz.json';

const LANGUAGE_KEY = 'app_language';

const resources = {
  ru: { translation: ru },
  uz: { translation: uz },
};

async function getStoredLanguage(): Promise<string> {
  try {
    const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
    return lang ?? 'ru';
  } catch {
    return 'ru';
  }
}

export async function changeLanguage(lang: string): Promise<void> {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // ignore storage errors
  }
}

export async function initI18n(): Promise<void> {
  const storedLang = await getStoredLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: storedLang,
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v3',
  });
}

export default i18n;
