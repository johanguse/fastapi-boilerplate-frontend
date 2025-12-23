# Hey API - End-to-End Type Safety

This project uses [Hey API](https://heyapi.dev/) to generate a type-safe TypeScript SDK from the backend's OpenAPI specification.

**Supported Backends:**
- **FastAPI** (Python) - Port 8000
- **Bun + Hono** (TypeScript) - Port 3000

## Overview

Hey API automatically generates TypeScript types and SDK methods from your backend's OpenAPI spec. This provides:

- **End-to-end type safety**: Changes to backend models immediately flag TypeScript errors
- **Full autocompletion**: Method names, parameters, and response objects are all typed
- **Eliminates API drift**: The SDK always matches the actual API implementation
- **Clean SDK methods**: Custom operation IDs generate intuitive method names
- **Multi-backend support**: Same frontend works with either FastAPI or Bun+Hono

## Quick Start

### Generate the SDK

Make sure the backend is running, then:

```bash
# Generate from FastAPI backend (port 8000 - default)
bun run gen:api

# Generate from Bun + Hono backend (port 3000)
bun run gen:api:bun

# Or with watch mode during development
bun run gen:api:watch
```

This will generate files in `src/client/`:

- `types.gen.ts` - All TypeScript types from Pydantic models
- `sdk.gen.ts` - SDK methods for all API endpoints
- `client.gen.ts` - Axios client configuration

### Using the Generated SDK

```typescript
import { authSignInEmail, usersGetById, organizationsList } from '@/client/sdk.gen';
import { client } from '@/client/client.gen';
import { setupClientInterceptors } from '@/hey-api';

// Setup interceptors for auth error handling (do this once at app startup)
setupClientInterceptors(client);

// Sign in
const { data, error } = await authSignInEmail({
  body: {
    email: 'user@example.com',
    password: 'password123',
  },
});

// Get user by ID (fully typed!)
const user = await usersGetById({
  path: {
    userId: 123,
  },
});

// List organizations
const orgs = await organizationsList();
```

### Type Safety Example

If you change a field in your Pydantic model:

```python
# Before
class User(BaseModel):
    username: str

# After
class User(BaseModel):
    email: str  # Renamed field
```

After regenerating the SDK (`bun run gen:api`), TypeScript will immediately show errors wherever `username` was used, ensuring you update all references.

## Configuration

### Backend Support

This frontend supports two backends:

| Backend | Language | Port | OpenAPI Endpoint |
|---------|----------|------|------------------|
| FastAPI | Python | 8000 | `http://localhost:8000/openapi.json` |
| Bun + Hono | TypeScript | 3000 | `http://localhost:3000/openapi.json` |

### Switching Backends

Set `VITE_BACKEND_TYPE` in your `.env` file:

```bash
# Use FastAPI backend (default)
VITE_BACKEND_TYPE=fastapi

# Use Bun + Hono backend
VITE_BACKEND_TYPE=bun
```

Pre-configured `.env` files are available:
- `.env.fastapi` - FastAPI configuration
- `.env.bun` - Bun + Hono configuration

Copy the appropriate file to `.env`:

```bash
# For FastAPI
cp .env.fastapi .env

# For Bun + Hono
cp .env.bun .env
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BACKEND_TYPE` | Backend type: `fastapi` or `bun` | `fastapi` |
| `VITE_API_URL_FASTAPI` | FastAPI API URL | `http://localhost:8000/api/v1` |
| `VITE_API_URL_BUN` | Bun + Hono API URL | `http://localhost:3000/api/v1` |
| `VITE_API_URL` | Override URL (takes precedence) | - |
| `OPENAPI_FILE` | OpenAPI spec URL for SDK generation | Based on backend |

### Frontend Configuration

Configuration is in [openapi-ts.config.ts](openapi-ts.config.ts):

```typescript
import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  // Use OPENAPI_FILE env var or default to FastAPI
  input: process.env.OPENAPI_FILE || "http://localhost:8000/openapi.json",
  output: {
    path: "src/client",
    format: "biome",
    lint: "biome",
  },
  plugins: [
    "@hey-api/typescript",
    "@hey-api/sdk",
    {
      name: "@hey-api/client-axios",
      runtimeConfigPath: "../hey-api",
    },
  ],
});
```

### Runtime Configuration

The client is configured in [src/hey-api.ts](src/hey-api.ts) with:

- Dynamic backend URL selection based on `VITE_BACKEND_TYPE`
- Auth token injection
- Error handling interceptors
- Development logging to show active backend

## Generated Method Names

The backend generates clean operation IDs that result in intuitive SDK method names:

| HTTP Method | Path | Generated Method |
|-------------|------|------------------|
| POST | `/auth/sign-in/email` | `authSignInEmail()` |
| POST | `/auth/sign-up/email` | `authSignUpEmail()` |
| GET | `/users` | `usersList()` |
| GET | `/users/{userId}` | `usersGetById()` |
| PUT | `/users/{userId}` | `usersUpdateById()` |
| DELETE | `/users/{userId}` | `usersDeleteById()` |
| GET | `/organizations` | `organizationsList()` |
| POST | `/organizations` | `organizationsCreate()` |

## Development Workflow

1. **Make backend changes**: Update Pydantic models or FastAPI routes
2. **Regenerate SDK**: Run `bun run gen:api`
3. **Fix TypeScript errors**: The compiler will flag any breaking changes
4. **Test**: Your IDE provides full autocompletion for the updated API

## CI/CD Integration

Consider adding SDK generation to your CI pipeline:

```yaml
# Example GitHub Actions step
- name: Generate API Client
  run: |
    cd frontend
    bun run gen:api
    # Fail if there are changes (SDK should be committed)
    git diff --exit-code src/client/
```

## Resources

- [Hey API Documentation](https://heyapi.dev/)
- [Hey API Axios Client](https://heyapi.dev/openapi-ts/clients/axios)
- [FastAPI OpenAPI](https://fastapi.tiangolo.com/features/#automatic-docs)
