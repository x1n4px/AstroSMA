import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: 'es',
    fallbackLng: 'es',
    ns: ['text'],         // Cambiar aquí
    defaultNS: 'text',    // Cambiar aquí
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',  // seguirá buscando text.json
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
