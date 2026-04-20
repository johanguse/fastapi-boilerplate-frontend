import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { loadEnv } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'

/**
 * API origin only (scheme + host[:port], no /api/v1).
 * Same rules as `src/hey-api.ts`, but this value is what `lib/api`, Better Auth,
 * and the auth store use via `import.meta.env.VITE_API_URL`.
 */
function resolveViteApiOrigin(env: Record<string, string>): string {
  const explicit = env.VITE_API_URL?.trim()
  if (explicit) {
    return explicit.replace(/\/$/, '')
  }

  const backend = env.VITE_BACKEND_TYPE ?? 'fastapi'
  const fullBase =
    backend === 'bun'
      ? env.VITE_API_URL_BUN?.trim()
      : env.VITE_API_URL_FASTAPI?.trim()

  if (!fullBase) {
    return ''
  }

  return fullBase.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '')
}

// https://vite.dev/config/
export default defineVitestConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiOrigin = resolveViteApiOrigin(env)

  if (!apiOrigin && mode !== 'test') {
    throw new Error(
      'Missing API origin. Set VITE_API_URL (e.g. https://api.example.com), ' +
        'or set VITE_BACKEND_TYPE with VITE_API_URL_FASTAPI / VITE_API_URL_BUN. ' +
        'See .env.example.'
    )
  }

  const defineEnv: Record<string, string> =
    apiOrigin && !env.VITE_API_URL?.trim()
      ? { 'import.meta.env.VITE_API_URL': JSON.stringify(apiOrigin) }
      : {}

  if (
    mode === 'test' &&
    !env.VITE_API_URL?.trim() &&
    !defineEnv['import.meta.env.VITE_API_URL']
  ) {
    defineEnv['import.meta.env.VITE_API_URL'] = JSON.stringify(
      'http://localhost:8000'
    )
  }

  return {
    define: defineEnv,
    plugins: [
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
      exclude: ['node_modules/**', 'dist/**'],
      css: true,
    },
  }
})
