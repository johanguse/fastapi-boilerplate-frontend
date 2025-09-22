import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: {
      'en-US': ['en-US', 'en'],
      'en-GB': ['en-GB', 'en'],
      'es-ES': ['es-ES', 'es'],
      'es-MX': ['es-MX', 'es'],
      'fr-FR': ['fr-FR', 'fr'],
      'fr-CA': ['fr-CA', 'fr'],
      'de-DE': ['de-DE', 'de'],
      'pt-BR': ['pt-BR', 'pt'],
      'pt-PT': ['pt-PT', 'pt'],
      default: ['en-US'],
    },
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      // Add cache busting to force reload of translation files
      queryStringParams: { v: Date.now() },
    },
  })

export default i18n
