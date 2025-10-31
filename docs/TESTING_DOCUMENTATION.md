# Testing Documentation

## Overview

This document describes the testing strategy and test coverage for the image upload feature and related functionality in the application.

## Test Files

### 1. Onboarding Profile Tests

**File**: `src/features/onboarding/components/onboarding-profile.test.tsx`

**Coverage**:

- ✅ Form rendering with all fields (name, profile image)
- ✅ Image upload component integration
- ✅ Form submission button
- ✅ Pre-population with existing user data
- ✅ Name field validation (required, minimum length)
- ✅ Profile image upload handling
- ✅ Full form submission with image upload to API
- ✅ API error handling

**API Endpoints Tested**:

- `POST /api/v1/users/me/upload-image` - Upload profile image
- `PATCH /api/v1/users/me` - Update user profile

### 2. Onboarding Organization Tests

**File**: `src/features/onboarding/components/onboarding-organization.test.tsx`

**Coverage**:

- ✅ Form rendering with organization fields
- ✅ Logo upload component integration
- ✅ Auto-slug generation from organization name
- ✅ Organization name validation (required)
- ✅ Logo file handling
- ✅ Full form submission with logo upload
- ✅ 409 conflict error handling (duplicate organization)
- ✅ Network error handling

**API Endpoints Tested**:

- `POST /api/v1/organizations/` - Create new organization
- `POST /api/v1/organizations/{id}/upload-logo` - Upload organization logo

### 3. Image Upload Component Tests

**File**: `src/components/ui/image-upload.test.tsx`

**Coverage**:

- ✅ Avatar type rendering with initials fallback
- ✅ Avatar image display when provided
- ✅ Logo type rendering with icon fallback
- ✅ Logo image display when provided
- ✅ File selection handling for both types
- ✅ File type validation (jpg, png, webp)
- ✅ File size validation (5MB limit)
- ✅ Different size variants (sm, lg, xl)
- ✅ File removal/clearing

**Component Props Tested**:

- `type`: 'avatar' | 'logo'
- `value`: string (image URL)
- `onChange`: (file: File | null) => void
- `name`: string (for alt text)
- `size`: 'sm' | 'lg' | 'xl'

### 4. Settings Profile Form Tests

**File**: `src/features/settings/profile-form.test.tsx`

**Coverage** (In Progress):

- ⏳ Form rendering with all profile fields
- ⏳ Pre-population with user data from auth store
- ⏳ Current profile image display
- ⏳ Email field disabled state
- ⏳ Name field validation
- ⏳ Image file selection
- ⏳ Form submission with updated data
- ⏳ Form submission with image upload
- ⏳ API error handling
- ⏳ Website URL validation

**Note**: Some tests are experiencing issues with form label matching and will be refined.

## Test Patterns and Best Practices

### Mocking Strategy

#### 1. API Calls

```typescript
// Mock global fetch
global.fetch = vi.fn()

// Mock API calls with expected responses
;(global.fetch as any).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: ... }),
})
```

#### 2. Component Mocks

```typescript
// Mock ImageUpload component
vi.mock('@/components/ui/image-upload', () => ({
  ImageUpload: ({ value, onChange, name }: any) => (
    <div data-testid="image-upload">
      {value && <img src={value} alt={name} />}
      <input
        type="file"
        data-testid="file-input"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  ),
}))
```

#### 3. Toast Notifications

```typescript
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))
```

#### 4. Internationalization

```typescript
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue: string) => defaultValue || key,
    i18n: { language: 'en-US' },
  }),
}))
```

### Test Structure

Each test file follows this structure:

1. **Imports**: Testing libraries, component under test, type definitions
2. **Mocks**: Component mocks, API mocks, utility mocks
3. **Test Data**: Mock users, organizations, files
4. **Setup/Teardown**: `beforeEach` to reset mocks
5. **Test Suites**: Grouped by functionality
6. **Assertions**: Using Testing Library queries and matchers

### File Upload Testing

```typescript
it('handles file upload', async () => {
  const user = userEvent.setup()
  render(<Component />)

  // Create mock file
  const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' })
  
  // Upload file
  const fileInput = screen.getByTestId('file-input')
  await user.upload(fileInput, file)

  // Assert file handling
  expect(fileInput.files[0]).toStrictEqual(file)
  expect(fileInput.files).toHaveLength(1)
})
```

### API Integration Testing

```typescript
it('submits data to API', async () => {
  // Mock API response
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ({ id: '1', ...data }),
  })

  // Perform action
  await user.click(submitButton)

  // Assert API call
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/endpoint'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    )
  })
})
```

## Running Tests

### Run All Tests

```bash
bun run test
```

### Run Specific Test File

```bash
bun run test onboarding-profile.test.tsx
```

### Watch Mode

```bash
bun run test:watch
```

### UI Mode

```bash
bun run test:ui
```

## Test Environment

- **Test Runner**: Vitest
- **Environment**: jsdom (browser simulation)
- **Testing Library**: @testing-library/react
- **User Interactions**: @testing-library/user-event
- **Setup File**: `src/test/setup.ts`

## Configuration

### Vitest Config (`vite.config.ts`)

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
  exclude: ['node_modules/**', 'dist/**'],
  css: true,
}
```

## Coverage

Current test coverage focuses on:

- User onboarding flow (profile and organization creation)
- Image upload functionality (avatars and logos)
- Form validation and submission
- API integration and error handling
- File handling (upload, validation, removal)

## Known Issues

1. **Profile Form Tests**: Some tests in `profile-form.test.tsx` are failing due to:
   - Form label matching issues
   - Mock store configuration
   - Async form population timing

   These will be addressed in future updates.

## Future Improvements

1. Add E2E tests with Playwright or Cypress
2. Increase test coverage to 80%+
3. Add performance testing for image optimization
4. Add accessibility testing (axe-core)
5. Add visual regression testing
6. Complete profile-form.test.tsx fixes
7. Add integration tests for auth flows
8. Add tests for organization management features

## Documentation Updates Needed

- [ ] Update main README with testing section
- [ ] Add API endpoint documentation
- [ ] Add component usage examples
- [ ] Create testing guide for contributors
- [ ] Document CI/CD test integration
