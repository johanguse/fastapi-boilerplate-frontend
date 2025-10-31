import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock i18n globally
vi.mock('@/lib/i18n', () => ({
  default: {
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
    use: vi.fn(),
    init: vi.fn(),
  },
}))

// Extend Vitest's expect with jest-dom matchers
declare module 'vitest' {
  interface Assertion<T = unknown> extends jest.Matchers<void, T> {}
}
