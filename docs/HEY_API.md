# Hey API - End-to-End Type Safety

This project uses [Hey API](https://heyapi.dev/) to generate a type-safe TypeScript SDK from the FastAPI backend's OpenAPI specification.

## Overview

Hey API automatically generates TypeScript types and SDK methods from your Pydantic models and FastAPI routes. This provides:

- **End-to-end type safety**: Changes to backend models immediately flag TypeScript errors
- **Full autocompletion**: Method names, parameters, and response objects are all typed
- **Eliminates API drift**: The SDK always matches the actual API implementation
- **Clean SDK methods**: Custom operation IDs generate intuitive method names

## Quick Start

### Generate the SDK

Make sure the backend is running, then:

```bash
# Generate the TypeScript SDK
bun run gen:api

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

### Backend (FastAPI)

The backend generates clean operation IDs for better SDK method names. See [src/common/openapi.py](../backend/src/common/openapi.py) for the custom OpenAPI schema generation.

### Frontend Configuration

Configuration is in [openapi-ts.config.ts](../frontend/openapi-ts.config.ts):

```typescript
import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:8000/openapi.json",
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
      runtimeConfigPath: "./src/hey-api.ts",
    },
  ],
});
```

### Runtime Configuration

The client is configured in [src/hey-api.ts](../frontend/src/hey-api.ts) with:

- Base URL configuration
- Auth token injection
- Error handling interceptors

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
