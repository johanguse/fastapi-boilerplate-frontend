import type enUS from './public/locales/en-US/translation.json';

// Recursively get all keys as dot notation
export type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;
export type DotNestedKeys<T> = (
  T extends object
    ? {
        [K in Extract<keyof T, string>]:
          T[K] extends object
            ? K | `${K}${DotPrefix<DotNestedKeys<T[K]>>}`
            : K
      }[Extract<keyof T, string>]
    : never
);

export type TranslationKey = DotNestedKeys<typeof enUS>;

// Usage example:
// import { t } from 'i18next';
// const key: TranslationKey = 'navigation.dashboard';
// t(key);
