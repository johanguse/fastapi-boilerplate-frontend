import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'
import '@testing-library/jest-dom'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Setup global mocks before all tests
beforeAll(() => {
  // Mock window.URL.createObjectURL and revokeObjectURL
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()

  // Mock FileReader
  class MockFileReader {
    result: string | ArrayBuffer | null = null
    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null =
      null
    onerror:
      | ((this: FileReader, ev: ProgressEvent<FileReader>) => void)
      | null = null
    readyState = 0

    readAsDataURL(_blob: Blob) {
      this.readyState = 2
      this.result = 'data:image/png;base64,mock-base64-data'
      if (this.onload) {
        const event = {
          target: { result: this.result },
        } as ProgressEvent<FileReader>
        this.onload.call(this, event)
      }
    }

    readAsText() {
      this.readyState = 2
      this.result = 'mock text data'
      if (this.onload) {
        const event = {
          target: { result: this.result },
        } as ProgressEvent<FileReader>
        this.onload.call(this, event)
      }
    }

    abort() {
      this.readyState = 0
    }

    // biome-ignore lint: Mock method needs empty implementation
    addEventListener() {}
    // biome-ignore lint: Mock method needs empty implementation
    removeEventListener() {}
    dispatchEvent() {
      return true
    }
  }

  global.FileReader = MockFileReader as unknown as typeof FileReader
})

// Mock i18n globally
vi.mock('@/lib/i18n', () => ({
  default: {
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
    use: vi.fn(),
    init: vi.fn(),
  },
}))

// Mock react-i18next globally
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}))

// Mock TanStack Router globally to prevent navigation errors
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router'
  )
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useRouter: () => ({
      navigate: vi.fn(),
    }),
    useRouterState: () => ({
      location: {
        pathname: '/',
        search: '',
        hash: '',
      },
    }),
  }
})

// Extend Vitest's expect with jest-dom matchers
declare module 'vitest' {
  interface Assertion<T = unknown> extends jest.Matchers<void, T> {}
}
