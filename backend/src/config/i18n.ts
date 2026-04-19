import i18next from 'i18next';
import ru from '../i18n/ru.json';
import uz from '../i18n/uz.json';

i18next.init({
  lng: 'ru',
  fallbackLng: 'ru',
  resources: {
    ru: { translation: ru },
    uz: { translation: uz },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18next;
