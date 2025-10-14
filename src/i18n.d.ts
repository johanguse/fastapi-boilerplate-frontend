import 'i18next';
import type enUS from '../public/locales/en-US/translation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof enUS;
    };
  }
}
