/**
 * Hey API client runtime configuration
 *
 * This file configures the generated API client with auth and base URL.
 * The generated client imports this to get proper configuration.
 *
 * Supports two backends:
 * - FastAPI (Python): port 8000 (default)
 * - Bun + Hono (TypeScript): port 3000
 *
 * Set VITE_BACKEND_TYPE to "bun" or "fastapi" to switch backends
 *
 * NOTE: The `CreateClientConfig` type will be available after running `bun run gen:api`
 */
import { deleteCookie as deleteCookieUtil } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import type { CreateClientConfig } from './client/client.gen'

// Backend type: "fastapi" | "bun"
const BACKEND_TYPE = import.meta.env.VITE_BACKEND_TYPE || 'fastapi'

// Default URLs for each backend
const API_URLS = {
  fastapi:
    import.meta.env.VITE_API_URL_FASTAPI || 'http://localhost:8000/api/v1',
  bun: import.meta.env.VITE_API_URL_BUN || 'http://localhost:3000/api/v1',
}

// Use explicit VITE_API_URL if set, otherwise select based on backend type
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  API_URLS[BACKEND_TYPE as keyof typeof API_URLS] ||
  API_URLS.fastapi

// biome-ignore lint/suspicious/noExplicitAny: Config type is generated
export const createClientConfig: CreateClientConfig = (config: any) => ({
  ...config,
  baseURL: API_BASE_URL,
  // Auth function to get the current token
  auth: () => {
    const session = useAuthStore.getState().session
    return session?.session?.token || ''
  },
})

/**
 * Setup interceptors for the Hey API client
 * Call this after importing the client to add response interceptors
 */
export function setupClientInterceptors(client: {
  instance: {
    interceptors: {
      response: {
        use: (
          onFulfilled: (response: unknown) => unknown,
          onRejected: (error: unknown) => Promise<never>
        ) => void
      }
    }
  }
}) {
  client.instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      // biome-ignore lint/suspicious/noExplicitAny: Error handling
      const axiosError = error as any
      if (axiosError?.response?.status === 401) {
        // Clear auth tokens
        deleteCookieUtil('ba_session')
        deleteCookieUtil('ba_active_org')
        useAuthStore.getState().reset()
        // Emit logout event for Better Auth compatibility
        window.dispatchEvent(new CustomEvent('auth:logout'))
      }
      return Promise.reject(new Error(axiosError?.message || 'Request failed'))
    }
  )
}
