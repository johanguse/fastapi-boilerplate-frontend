import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

// Import all translation files
import enUS from '../i18n/locales/en-US/translation.json'
import enGB from '../i18n/locales/en-GB/translation.json'
import esES from '../i18n/locales/es-ES/translation.json'
import esMX from '../i18n/locales/es-MX/translation.json'
import frFR from '../i18n/locales/fr-FR/translation.json'
import frCA from '../i18n/locales/fr-CA/translation.json'
import deDE from '../i18n/locales/de-DE/translation.json'
import ptBR from '../i18n/locales/pt-BR/translation.json'
import ptPT from '../i18n/locales/pt-PT/translation.json'

i18n
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
    returnEmptyString: false,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    resources: {
      'en-US': {
        translation: enUS,
      },
      'en-GB': {
        translation: enGB,
      },
      'es-ES': {
        translation: esES,
      },
      'es-MX': {
        translation: esMX,
      },
      'fr-FR': {
        translation: frFR,
      },
      'fr-CA': {
        translation: frCA,
      },
      'de-DE': {
        translation: deDE,
      },
      'pt-BR': {
        translation: ptBR,
      },
      'pt-PT': {
        translation: ptPT,
      },
    },
  })

export default i18n
