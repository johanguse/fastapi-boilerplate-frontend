# Email Verification Flow

## Overview

The authentication flow has been redesigned to be more resilient and user-friendly. Users can now:

- Register and login with **password** or **email code (OTP)**
- Complete onboarding **without being blocked by email verification**
- Still be encouraged to verify email for full feature access

## Authentication Options

### 1. **Password-Based Login**

Traditional email + password authentication with option to switch to code-based login.

### 2. **Code-Based Login (OTP)**

Passwordless authentication using 6-digit codes sent to email. Users can toggle between password and code on the login page with the "Get a code instead" button.

## New Authentication Flow

```
┌─────────────┐
│   Sign Up   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ Auto-Login Created      │
│ (Session established)   │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Onboarding              │
│ (Profile + Organization)│
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Dashboard               │
│ + Email Verification    │
│   Banner (if not        │
│   verified)             │
└─────────────────────────┘
```

## Key Changes

### 1. **Immediate Auto-Login After Sign-Up**

- ✅ Users are automatically logged in after creating an account
- ✅ Session is created immediately, no need to verify email first
- ✅ Users proceed directly to onboarding

**Files Changed:**

- `frontend/src/features/auth/sign-up/components/sign-up-form.tsx` - Redirects to `/onboarding` instead of `/check-email`
- `backend/src/auth/better_auth_compat.py` - Already creates session on sign-up

### 2. **Email Verification Banner**

A persistent banner is shown on all authenticated pages when the user hasn't verified their email.

**Features:**

- Yellow/amber color scheme (less alarming than error red)
- Resend email button with 60-second rate limiting
- Dismissible (per session)
- Clear messaging about what features are locked

**Files:**

- `frontend/src/components/email-verification-banner.tsx` - Banner component
- `frontend/src/components/layout/authenticated-layout.tsx` - Banner integration

### 3. **Simplified Email Verification Page**

The `/verify-email` route now:

- ✅ Verifies the token
- ✅ Updates user session
- ✅ Shows success message
- ✅ Redirects to dashboard automatically

**No longer:**

- ❌ Handles complex redirect logic based on onboarding status
- ❌ Redirects to sign-in (users already logged in)

**Files:**

- `frontend/src/routes/(auth)/verify-email.tsx` - Simplified verification logic

### 4. **Feature Gating System**

New utilities for locking features behind email verification:

#### Hook: `useFeatureGate()`

```tsx
import { useFeatureGate } from '@/hooks/use-feature-gate'

function MyComponent() {
  const { isAvailable, reason } = useFeatureGate(true) // true = requires verified email

  return (
    <Button disabled={!isAvailable}>
      {reason || 'Create Project'}
    </Button>
  )
}
```

#### Component: `<FeatureGate>`

```tsx
import { FeatureGate } from '@/components/feature-gate'
import { Button } from '@/components/ui/button'

function MyComponent() {
  return (
    <FeatureGate requireVerifiedEmail>
      <Button>Create Project</Button>
    </FeatureGate>
  )
}
```

Features:

- Automatically disables and shows tooltip when locked
- Customizable lock messages
- Works with any React component

**Files:**

- `frontend/src/hooks/use-feature-gate.ts` - Feature availability hook
- `frontend/src/components/feature-gate.tsx` - Feature gating component

### 5. **Check Email Page (Optional)**

The `/check-email` page is now optional and can be:

- Accessed from password reset flow
- Accessed if users manually navigate to it
- Shows a note that users can continue to dashboard without waiting

**Files:**

- `frontend/src/routes/(auth)/check-email.tsx` - Updated messaging

## Benefits

### User Experience

- ✅ **No blocking**: Email service downtime doesn't prevent registration
- ✅ **Immediate access**: Users can explore the app right away
- ✅ **Clear guidance**: Banner explains what's locked and why
- ✅ **Flexible verification**: Can verify anytime via banner or email link

### Developer Experience

- ✅ **Simpler logic**: No complex redirect chains
- ✅ **Easier testing**: Can test app without email service
- ✅ **Feature control**: Easy to gate features with `useFeatureGate()`
- ✅ **Type-safe**: Full TypeScript support

### Reliability

- ✅ **Email service resilience**: App works even if email fails
- ✅ **Better debugging**: Clearer separation of concerns
- ✅ **Graceful degradation**: Features still accessible, just with limitations

## Migration Notes

### Removed

- ❌ `frontend/src/stores/onboarding-store.ts` (unused, replaced by context)

### What Features Should Require Verification?

Consider requiring email verification for:

- 🔒 Inviting team members
- 🔒 Creating organizations (after the first one)
- 🔒 Payment/billing features
- 🔒 API key generation
- 🔒 Export/import functionality

Do NOT require verification for:

- ✅ Viewing dashboard
- ✅ Completing onboarding
- ✅ Basic CRUD operations
- ✅ Profile editing
- ✅ Reading documentation

## Example Usage

### Gating a Feature

```tsx
import { FeatureGate } from '@/components/feature-gate'
import { Button } from '@/components/ui/button'

export function InviteTeamButton() {
  return (
    <FeatureGate 
      requireVerifiedEmail 
      lockedMessage="Verify your email to invite team members"
    >
      <Button>
        <UserPlus className="mr-2 h-4 w-4" />
        Invite Team Member
      </Button>
    </FeatureGate>
  )
}
```

### Conditional Rendering

```tsx
import { useFeatureGate } from '@/hooks/use-feature-gate'

export function AdvancedSettings() {
  const { isAvailable, reason } = useFeatureGate(true)

  if (!isAvailable) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{reason}</AlertDescription>
      </Alert>
    )
  }

  return <AdvancedSettingsForm />
}
```

## Backend Endpoints

All existing endpoints remain unchanged:

- `POST /api/v1/auth/sign-up/email` - Creates user + session
- `POST /api/v1/auth/verify-email` - Verifies email token
- `POST /api/v1/auth/resend-verification` - Resends verification email

## Testing

### Without Email Service

1. Sign up normally
2. Skip email verification
3. Complete onboarding
4. See verification banner in dashboard
5. Use app features (except gated ones)

### With Email Service

1. Sign up
2. Check email for verification link
3. Click link
4. Banner disappears
5. All features unlocked

## Future Enhancements

Potential improvements:

- [ ] Add verification status to user profile settings
- [ ] Track verification reminders (don't spam)
- [ ] Add "Verify Later" button that dismisses for longer
- [ ] Analytics on verification rates
- [ ] A/B test different messaging for verification banner
