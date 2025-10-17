import { defineConfig } from 'i18next-cli'

export default defineConfig({
  locales: ['en-US', 'en-GB', 'es-ES', 'es-MX', 'fr-FR', 'fr-CA', 'de-DE', 'pt-BR', 'pt-PT'],
  extract: {
    input: [
      'src/**/*.{ts,tsx}',
      '!src/i18n/**/*', // Exclude the i18n directory itself
      '!src/**/*.test.{ts,tsx}',
      '!src/**/*.spec.{ts,tsx}',
    ],
    output: 'src/i18n/locales/{{language}}/{{namespace}}.json',
    defaultNS: 'translation',
    defaultValue: (locale, key) => {
      if (locale.startsWith('en')) {
        return key.split('.').pop() || key
      }
      return ''
    },
  },
  types: {
    input: 'src/i18n/locales/**/*.json',
    output: 'src/i18n/types.ts',
  },
})
