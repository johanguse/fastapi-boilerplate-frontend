import 'i18next'
import type enUS from './i18n/locales/en-US/translation.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof enUS
    }
  }
}
