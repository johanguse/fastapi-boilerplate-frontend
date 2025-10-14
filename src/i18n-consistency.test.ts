// @ts-expect-error: Bun provides 'bun:test' at runtime
import { expect, test } from 'bun:test'
import deDE from '../public/locales/de-DE/translation.json'
import enGB from '../public/locales/en-GB/translation.json'
import enUS from '../public/locales/en-US/translation.json'
import esES from '../public/locales/es-ES/translation.json'
import esMX from '../public/locales/es-MX/translation.json'
import frCA from '../public/locales/fr-CA/translation.json'
import frFR from '../public/locales/fr-FR/translation.json'
import ptBR from '../public/locales/pt-BR/translation.json'
import ptPT from '../public/locales/pt-PT/translation.json'

function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? getKeys(v as Record<string, unknown>, `${prefix}${k}.`)
      : `${prefix}${k}`
  )
}

const baseKeys = getKeys(enUS)
const locales = [
  { name: 'en-GB', data: enGB },
  { name: 'de-DE', data: deDE },
  { name: 'es-ES', data: esES },
  { name: 'es-MX', data: esMX },
  { name: 'fr-CA', data: frCA },
  { name: 'fr-FR', data: frFR },
  { name: 'pt-BR', data: ptBR },
  { name: 'pt-PT', data: ptPT },
]

for (const locale of locales) {
  test(`${locale.name} has all keys from en-US`, () => {
    const localeKeys = getKeys(locale.data as Record<string, unknown>)
    for (const key of baseKeys) {
      expect(localeKeys).toContain(key)
    }
  })
}
