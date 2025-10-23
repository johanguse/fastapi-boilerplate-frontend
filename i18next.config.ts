import { defineConfig } from 'i18next-cli'

export default defineConfig({
  locales: [
    'en-US',
    'en-GB',
    'es-ES',
    'es-MX',
    'fr-FR',
    'fr-CA',
    'de-DE',
    'pt-BR',
    'pt-PT',
  ],

  // Key extraction settings
  extract: {
    input: [
      'src/**/*.{ts,tsx}',
      '!src/i18n/**/*', // Exclude the i18n directory itself
      '!src/**/*.test.{ts,tsx}',
      '!src/**/*.spec.{ts,tsx}',
      '!src/assets/**/*', // Exclude all assets (icons, images, etc.)
      '!src/components/ui/**/*', // Exclude UI components (they contain CSS classes)
      '!src/styles/**/*', // Exclude CSS/styling files
    ],
    output: 'src/i18n/locales/{{language}}/{{namespace}}.json',

    /** Glob pattern(s) for files to ignore during extraction */
    ignore: [
      'node_modules/**',
      'src/assets/**',
      'src/components/ui/**',
      'src/styles/**',
      '**/*.test.{ts,tsx}',
      '**/*.spec.{ts,tsx}',
    ],

    // Translation functions to detect
    functions: ['t', '*.t', 'i18next.t'],

    // React components to analyze
    transComponents: ['Trans', 'Translation'],

    // HTML tags to preserve in Trans component default values
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],

    // Hook-like functions that return a t function
    useTranslationNames: ['useTranslation', 'getT', 'useT'],

    // Add custom JSX attributes to ignore during linting
    ignoredAttributes: [
      'DropdownMenuShortcut',
      'htmlFor',
      'name',
      'data-slot',
      'data-testid',
      'buttonPosition',
      'position',
      'aria-live',
      'aria-atomic',
      'aria-hidden',
      'data-cy',
      'aria-label',
      'aria-describedby',
      'tabIndex',
      'onKeyDown',
      'form',
      'searchKey',
      'className',
      'variant',
      'size',
      'color',
      'type',
      'role',
      'id',
      'key',
      'href',
      'src',
      'alt',
      'title',
      'dir',
      'stroke',
      'side',
      'mode',
      'orientation',
      'defaultValue',
      'captionLayout',
      'data-key',
      'viewBox',
      'fill',
      'stroke-width',
      'stroke-linecap',
      'stroke-linejoin',
      'stroke-dasharray',
      'stroke-dashoffset',
      'stroke-miterlimit',
      'stroke-opacity',
      'strokeLinecap',
      'strokeLinejoin',
      'strokeDasharray',
      'strokeDashoffset',
      'strokeMiterlimit',
      'strokeOpacity',
      'containerClassName',
      'provider',
      'value',
      'entityName',
      'align',
      'width',
      'height',
      'dataKey',
      'd',
    ],

    // JSX tag names whose content should be ignored when linting
    ignoredTags: ['pre', 'code', 'script', 'style'],

    // Namespace and key configuration
    defaultNS: 'translation',
    nsSeparator: ':',
    keySeparator: '.',
    contextSeparator: '_',
    pluralSeparator: '_',

    // Preserve dynamic keys matching patterns
    preservePatterns: ['dynamic.feature.*', 'generated.*.key'],

    // Output formatting
    sort: true,
    indentation: 2,

    // Primary language settings
    primaryLanguage: 'en-US',
    secondaryLanguages: [
      'en-GB',
      'es-ES',
      'es-MX',
      'fr-FR',
      'fr-CA',
      'de-DE',
      'pt-BR',
      'pt-PT',
    ],

    // Default value for missing keys in secondary languages
    defaultValue: (key, namespace, language) => {
      if (language.startsWith('en')) {
        return key.split('.').pop() || key
      }
      return ''
    },

    /** If true, keys that are not found in the source code will be removed from translation files */
    removeUnusedKeys: true,

    // Control whether base plural forms are generated when context is present
    generateBasePluralForms: true,

    // Completely disable plural generation
    disablePlurals: false,
  },

  // TypeScript type generation
  types: {
    input: ['src/i18n/locales/**/*.json'],
    output: 'src/i18n/types.ts',
    resourcesFile: 'src/i18n/resources.d.ts',
    enableSelector: true, // Enable type-safe key selection
  },
})
