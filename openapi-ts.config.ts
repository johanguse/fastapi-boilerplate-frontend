import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  // Use local file if available, otherwise fetch from running backend
  // To generate: 1) Start backend, 2) Run: curl http://localhost:8000/openapi.json > openapi.json
  // Or just run: bun run gen:api (with backend running)
  input: process.env.OPENAPI_FILE || 'http://localhost:8000/openapi.json',
  output: {
    path: 'src/client',
    format: 'biome',
    lint: 'biome',
  },
  plugins: [
    '@hey-api/typescript',
    '@hey-api/sdk',
    {
      name: '@hey-api/client-axios',
      // Path relative to output directory (src/client)
      runtimeConfigPath: '../hey-api',
    },
  ],
})
