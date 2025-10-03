# 🔒 Frontend Security Recommendations

## 📋 Current Security Status

### ✅ **What's Already Implemented:**

#### 1. Authentication ✅
- **JWT Token Storage** - Tokens stored securely in localStorage via Zustand persist
- **Protected Routes** - TanStack Router with authentication guards
- **Auto Redirect on Unauthorized** - 401 responses trigger redirect to login
- **Token Refresh Mechanism** - Automatic token refresh (if implemented)

**Files:**
- `src/stores/authStore.ts` - Authentication state management
- `src/routes/__root.tsx` - Root route with auth context
- `src/hooks/use-auth-init.ts` - Authentication initialization

#### 2. Form Validation ✅
- **React Hook Form** - Performant form management
- **Zod Schema Validation** - Type-safe validation
- **Client-Side Validation** - Immediate user feedback
- **Error Handling** - User-friendly error messages

**Files:**
- `src/features/auth/sign-in/components/user-auth-form.tsx`
- `src/features/auth/sign-up/components/sign-up-form.tsx`

#### 3. Secure Storage ✅
- **Zustand Persist** - Encrypted state persistence
- **No Sensitive Data in localStorage** - Only tokens stored
- **Proper Cleanup on Logout** - State cleared on logout

**Files:**
- `src/stores/authStore.ts` - Secure state management

---

## ⚠️ **CRITICAL SECURITY IMPROVEMENTS NEEDED**

### 1. 🔴 **XSS Protection** (HIGH PRIORITY)

**Current Issue:** No sanitization of user-generated content

**Fix Required:**
```bash
# Install DOMPurify
bun add dompurify
bun add -D @types/dompurify
```

**Implementation:**
```typescript
// File: src/lib/sanitize.ts (NEW)

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Sanitize plain text - removes all HTML
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

/**
 * Component for rendering sanitized HTML
 */
interface SanitizedHtmlProps {
  html: string
  className?: string
}

export function SanitizedHtml({ html, className }: SanitizedHtmlProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  )
}
```

**Usage Examples:**
```typescript
// In components that display user content
import { SanitizedHtml } from '@/lib/sanitize'

// Display user-generated HTML
<SanitizedHtml html={userContent} className="prose" />

// Sanitize before setting state
const handleInput = (value: string) => {
  setContent(sanitizeHtml(value))
}
```

**Where to Use:**
- Organization descriptions
- Project descriptions
- User bios
- Comments or notes
- Any user-generated content

**Time Estimate:** 2 hours  
**Priority:** 🔴 CRITICAL

---

### 2. 🔴 **Token Expiration Handling** (HIGH PRIORITY)

**Current Issue:** No client-side token expiration check

**Fix Required:**
```bash
# Install jwt-decode
bun add jwt-decode
```

**Implementation:**
```typescript
// File: src/lib/auth.ts (UPDATE or CREATE)

import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  exp: number
  sub: string
  email: string
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const currentTime = Date.now() / 1000
    return decoded.exp < currentTime
  } catch (error) {
    // If token can't be decoded, consider it expired
    return true
  }
}

/**
 * Get time until token expiration in seconds
 */
export function getTokenExpirationTime(token: string): number {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const currentTime = Date.now() / 1000
    return Math.max(0, decoded.exp - currentTime)
  } catch (error) {
    return 0
  }
}

/**
 * Check if token will expire soon (within 5 minutes)
 */
export function isTokenExpiringSoon(token: string): boolean {
  const expirationTime = getTokenExpirationTime(token)
  return expirationTime > 0 && expirationTime < 300 // 5 minutes
}
```

**Update Auth Store:**
```typescript
// File: src/stores/authStore.ts (UPDATE)

import { isTokenExpired, isTokenExpiringSoon } from '@/lib/auth'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ... existing state ...
      
      // Check token validity
      isAuthenticated: () => {
        const token = get().token
        if (!token) return false
        if (isTokenExpired(token)) {
          // Auto logout if token is expired
          get().logout()
          return false
        }
        return true
      },
      
      // Refresh token if expiring soon
      checkAndRefreshToken: async () => {
        const token = get().token
        if (!token) return
        
        if (isTokenExpiringSoon(token)) {
          try {
            // Call refresh endpoint
            const response = await api.post('/auth/refresh', { token })
            set({ token: response.data.access_token })
          } catch (error) {
            // If refresh fails, logout
            get().logout()
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
```

**Add Token Check Hook:**
```typescript
// File: src/hooks/use-token-check.ts (NEW)

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from '@tanstack/react-router'

/**
 * Hook to check token expiration periodically
 */
export function useTokenCheck() {
  const { isAuthenticated, checkAndRefreshToken, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Check immediately
    if (!isAuthenticated()) {
      logout()
      navigate({ to: '/sign-in' })
      return
    }

    // Check every minute
    const interval = setInterval(() => {
      if (!isAuthenticated()) {
        logout()
        navigate({ to: '/sign-in' })
      } else {
        checkAndRefreshToken()
      }
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated, checkAndRefreshToken, logout, navigate])
}
```

**Use in Root Layout:**
```typescript
// File: src/routes/__root.tsx (UPDATE)

import { useTokenCheck } from '@/hooks/use-token-check'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  useTokenCheck() // Add this
  
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  )
}
```

**Time Estimate:** 3 hours  
**Priority:** 🔴 CRITICAL

---

### 3. 🔴 **Request/Response Interceptors** (HIGH PRIORITY)

**Current Issue:** No centralized error handling, no request timeout

**Fix Required:**
```typescript
// File: src/lib/api.ts (UPDATE)

import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'

// Create axios instance with timeout
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add language header
    const language = localStorage.getItem('i18nextLng') || 'en-US'
    config.headers['Accept-Language'] = language
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { response } = error
    
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.')
      return Promise.reject(error)
    }
    
    // Handle network errors
    if (!response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      const { logout } = useAuthStore.getState()
      logout()
      
      // Only show toast if not already on auth pages
      if (!window.location.pathname.includes('/sign-in')) {
        toast.error('Session expired. Please sign in again.')
        window.location.href = '/sign-in'
      }
      
      return Promise.reject(error)
    }
    
    // Handle 403 Forbidden
    if (response.status === 403) {
      toast.error('You do not have permission to perform this action.')
      return Promise.reject(error)
    }
    
    // Handle 429 Too Many Requests
    if (response.status === 429) {
      toast.error('Too many requests. Please try again later.')
      return Promise.reject(error)
    }
    
    // Handle 500 Server Error
    if (response.status >= 500) {
      toast.error('Server error. Please try again later.')
      return Promise.reject(error)
    }
    
    // Handle other errors
    const errorMessage = (response.data as any)?.detail || 'An error occurred'
    toast.error(errorMessage)
    
    return Promise.reject(error)
  }
)
```

**Time Estimate:** 2 hours  
**Priority:** 🔴 CRITICAL

---

### 4. 🔴 **Error Boundary Components** (HIGH PRIORITY)

**Current Issue:** No error boundaries - crashes show white screen

**Fix Required:**
```typescript
// File: src/components/error-boundary.tsx (NEW)

import { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring service (e.g., Sentry)
    console.error('Uncaught error:', error, errorInfo)
    
    // In production, send to error tracking service
    if (import.meta.env.PROD) {
      // Sentry.captureException(error, { extra: errorInfo })
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-muted-foreground">
              We're sorry, but something unexpected happened. Please try again.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 max-w-full overflow-auto rounded bg-muted p-4 text-left text-sm">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReset} className="mt-6">
              Return to Home
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

**Wrap App with Error Boundary:**
```typescript
// File: src/main.tsx (UPDATE)

import { ErrorBoundary } from '@/components/error-boundary'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>
)
```

**Add Route-Level Error Boundaries:**
```typescript
// File: src/routes/_authenticated.tsx (UPDATE)

import { ErrorBoundary } from '@/components/error-boundary'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4">
          <h2>Error in authenticated route</h2>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      }
    >
      <Layout>
        <Outlet />
      </Layout>
    </ErrorBoundary>
  )
}
```

**Time Estimate:** 2 hours  
**Priority:** 🔴 CRITICAL

---

### 5. 🟡 **Content Security Policy (CSP)** (MEDIUM PRIORITY)

**Current Issue:** No CSP headers - vulnerable to XSS

**Fix Required:**
```html
<!-- File: index.html (UPDATE) -->

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Content Security Policy -->
    <meta 
      http-equiv="Content-Security-Policy" 
      content="
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: https: blob:;
        font-src 'self' data:;
        connect-src 'self' https://api.stripe.com https://yourapi.com;
        frame-src 'self' https://js.stripe.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
      "
    />
    
    <!-- Other security headers -->
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <meta http-equiv="X-Frame-Options" content="DENY" />
    <meta http-equiv="X-XSS-Protection" content="1; mode=block" />
    <meta name="referrer" content="strict-origin-when-cross-origin" />
    
    <title>SaaS Boilerplate</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**For Production (Netlify):**
```toml
# File: netlify.toml (UPDATE)

[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://yourapi.com; frame-src 'self' https://js.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=(), payment=(self)"
```

**Time Estimate:** 1 hour  
**Priority:** 🟡 MEDIUM

---

### 6. 🟡 **Dependency Security Audits** (ONGOING)

**Current Issue:** No automated security scanning

**Fix Required:**
```json
// File: package.json (ADD SCRIPTS)

{
  "scripts": {
    "audit": "bun audit",
    "audit:fix": "bun audit --fix",
    "security:check": "bun run audit && bun run type-check",
  }
}
```

**Set up GitHub Actions:**
```yaml
# File: .github/workflows/security.yml (NEW)

name: Security Audit

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Install dependencies
        run: bun install
        
      - name: Run security audit
        run: bun audit
        
      - name: Check for vulnerabilities
        run: |
          if bun audit --json | jq '.vulnerabilities.high, .vulnerabilities.critical' | grep -v '^0$'; then
            echo "High or critical vulnerabilities found!"
            exit 1
          fi
```

**Regular Maintenance:**
```bash
# Run weekly
bun audit
bun update

# Check for outdated packages
bun outdated

# Update specific package
bun update <package-name>
```

**Time Estimate:** 2 hours setup + ongoing maintenance  
**Priority:** 🟡 MEDIUM

---

### 7. 🟡 **Secure Error Handling** (MEDIUM PRIORITY)

**Current Issue:** May expose stack traces in production

**Fix Required:**
```typescript
// File: src/lib/error-handler.ts (NEW)

/**
 * Get user-friendly error message
 */
export function getUserFriendlyError(error: unknown): string {
  // In development, show detailed errors
  if (import.meta.env.DEV) {
    if (error instanceof Error) {
      return error.message
    }
    return String(error)
  }
  
  // In production, show generic messages
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.'
      case 401:
        return 'Authentication required. Please sign in.'
      case 403:
        return 'You do not have permission for this action.'
      case 404:
        return 'The requested resource was not found.'
      case 429:
        return 'Too many requests. Please try again later.'
      case 500:
        return 'Server error. Please try again later.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }
  
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Log error for monitoring (without exposing to user)
 */
export function logError(error: unknown, context?: Record<string, any>) {
  if (import.meta.env.DEV) {
    console.error('Error:', error, context)
  } else {
    // In production, send to error tracking service
    // Sentry.captureException(error, { extra: context })
  }
}
```

**Usage:**
```typescript
// In components
import { getUserFriendlyError, logError } from '@/lib/error-handler'

try {
  await api.post('/some-endpoint', data)
} catch (error) {
  logError(error, { endpoint: '/some-endpoint', data })
  toast.error(getUserFriendlyError(error))
}
```

**Time Estimate:** 1 hour  
**Priority:** 🟡 MEDIUM

---

### 8. 🟢 **Secure Form Handling** (LOW PRIORITY)

**Current Issue:** Forms could benefit from additional security

**Enhancements:**
```typescript
// File: src/lib/form-security.ts (NEW)

/**
 * Clear sensitive form data after submission
 */
export function clearSensitiveFields(form: HTMLFormElement) {
  const sensitiveFields = form.querySelectorAll(
    'input[type="password"], input[data-sensitive="true"]'
  )
  
  sensitiveFields.forEach((field) => {
    if (field instanceof HTMLInputElement) {
      field.value = ''
    }
  })
}

/**
 * Prevent form autocomplete for sensitive fields
 */
export function disableAutocomplete(fieldId: string) {
  const field = document.getElementById(fieldId) as HTMLInputElement
  if (field) {
    field.setAttribute('autocomplete', 'off')
    field.setAttribute('autoComplete', 'off')
  }
}

/**
 * Add honeypot field for bot detection
 */
export function createHoneypot(): HTMLInputElement {
  const honeypot = document.createElement('input')
  honeypot.type = 'text'
  honeypot.name = 'website'  // Common honeypot name
  honeypot.style.display = 'none'
  honeypot.setAttribute('tabindex', '-1')
  honeypot.setAttribute('autocomplete', 'off')
  return honeypot
}
```

**Usage in Forms:**
```typescript
// In sign-up form
<form onSubmit={handleSubmit(onSubmit)}>
  {/* Honeypot field (hidden from users, bots will fill it) */}
  <input 
    type="text" 
    name="website" 
    style={{ display: 'none' }} 
    tabIndex={-1}
    autoComplete="off"
    {...register('honeypot')}
  />
  
  {/* Regular fields */}
  <Input 
    type="password"
    autoComplete="new-password"
    {...register('password')}
  />
</form>

// In submit handler
const onSubmit = async (data: FormData) => {
  // Check honeypot
  if (data.honeypot) {
    // Likely a bot, silently reject
    return
  }
  
  try {
    await register(data)
    // Clear sensitive fields
    clearSensitiveFields(form)
  } catch (error) {
    // Handle error
  }
}
```

**Time Estimate:** 2 hours  
**Priority:** 🟢 LOW

---

## 📋 **SECURITY IMPLEMENTATION CHECKLIST**

### 🔴 Critical (Week 1):
- [ ] Add DOMPurify for XSS protection
- [ ] Implement token expiration checks
- [ ] Add request/response interceptors
- [ ] Create error boundary components
- [ ] Test all security features

### 🟡 High Priority (Week 2):
- [ ] Implement CSP headers
- [ ] Set up dependency security audits
- [ ] Secure error handling
- [ ] Security code review

### 🟢 Medium Priority (Week 3):
- [ ] Enhance form security
- [ ] Add clipboard security
- [ ] Implement secure data handling
- [ ] Performance optimization

### 📊 Ongoing:
- [ ] Weekly dependency updates
- [ ] Regular security audits
- [ ] Monitor error tracking
- [ ] User security training

---

## 🛡️ **FRONTEND SECURITY BEST PRACTICES**

### Authentication
- ✅ Use JWT tokens with short expiration
- ⚠️ Implement token expiration checks
- ⚠️ Auto-logout on token expiration
- ✅ Secure token storage (localStorage)
- ⏳ Consider refresh token rotation (future)

### Data Protection
- ⚠️ Sanitize user-generated content (XSS)
- ✅ Validate all inputs client-side
- ⚠️ Never log sensitive data
- ✅ Clear sensitive fields after use
- ⏳ Consider encrypting sensitive localStorage data

### API Security
- ⚠️ Implement request timeouts
- ⚠️ Add retry logic with backoff
- ⚠️ Handle errors gracefully
- ⚠️ Add CORS validation
- ✅ Use HTTPS in production

### Code Security
- ⚠️ Regular dependency updates
- ⚠️ Security vulnerability scanning
- ⚠️ Error boundaries for crashes
- ⚠️ Secure error messages
- ⏳ Code obfuscation for production

---

## ⏱️ **ESTIMATED TIME TO COMPLETE ALL SECURITY FIXES**

| Priority | Time Estimate |
|----------|--------------|
| 🔴 Critical | 9-11 hours |
| 🟡 High Priority | 5-6 hours |
| 🟢 Medium Priority | 3-4 hours |
| **Total** | **17-21 hours (2-3 days)** |

---

## 🎯 **NEXT IMMEDIATE STEPS**

### Today (Day 1):
1. ✅ Review this security document
2. 🔴 Add DOMPurify for XSS protection
3. 🔴 Implement token expiration check
4. 🔴 Test changes

### Tomorrow (Day 2):
1. 🔴 Add request/response interceptors
2. 🔴 Create error boundaries
3. 🟡 Add CSP headers
4. 🟡 Security testing

### Day 3:
1. 🟡 Set up security audits
2. 🟡 Secure error handling
3. 📊 Security code review
4. 📊 Update documentation

---

**Your frontend needs critical security fixes (2-3 days) before production deployment!** 🔒🚀
