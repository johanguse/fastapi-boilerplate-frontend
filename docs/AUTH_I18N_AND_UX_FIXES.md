# Auth Page - i18n and UX Fixes

## Issues Fixed

### 1. ✅ Login Form Validation Messages Not Translated

**Problem:** When entering wrong credentials on the login page, error messages appeared in English even when the app language was set to pt-BR.

**Root Cause:** Zod validation schemas in `lib/auth.ts` had hardcoded English error messages.

**Solution:**
- Created dynamic schema generators `getLoginSchema()` and `getRegisterSchema()` that use i18n.t() for error messages
- Updated `user-auth-form.tsx` to use the new dynamic schema generator
- Added missing translation keys with interpolation support:
  - `passwordTooShort`: "A senha deve ter pelo menos {{count}} caracteres"
  - `nameTooShort`: "O nome deve ter pelo menos {{count}} caracteres"
  - `passwordsDontMatch`: "As senhas não coincidem"
  - `welcome`: "Bem-vindo!" / "Welcome!"
  - `socialLogin.success`: Success message for social login

**Files Changed:**
- `src/lib/auth.ts` - Added `getLoginSchema()` and `getRegisterSchema()` functions
- `src/features/auth/sign-in/components/user-auth-form.tsx` - Using dynamic schema
- `public/locales/pt-BR/translation.json` - Added new translation keys
- `public/locales/en-US/translation.json` - Added new translation keys

### 2. ✅ Social Login Buttons Dark Mode Styling

**Problem:** The "Or continue with" section and social login buttons had poor visibility/styling in dark mode.

**Root Cause:** Button styles in `social-login.tsx` only had light mode colors defined.

**Solution:**
Added dark mode variants to all social provider buttons:

**Before:**
```tsx
const providerColors = {
  google: 'hover:bg-blue-50 border-blue-200 text-blue-700',
  github: 'hover:bg-gray-50 border-gray-200 text-gray-700',
  microsoft: 'hover:bg-blue-50 border-blue-200 text-blue-700',
  apple: 'hover:bg-gray-50 border-gray-900 text-gray-900',
}
```

**After:**
```tsx
const providerColors = {
  google: 'hover:bg-blue-50 dark:hover:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
  github: 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300',
  microsoft: 'hover:bg-blue-50 dark:hover:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
  apple: 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100',
}
```

**Files Changed:**
- `src/components/auth/social-login.tsx` - Updated provider color classes

### 3. ✅ Theme Switcher Added to Auth Pages

**Problem:** Users couldn't change the theme on auth pages (login/signup).

**Solution:**
Added `ThemeSwitch` component next to the `LanguageSwitcher` in the auth layout.

**Before:**
```tsx
<div className='mt-6 flex justify-center'>
  <LanguageSwitcher />
</div>
```

**After:**
```tsx
<div className='mt-6 flex items-center justify-center gap-2'>
  <ThemeSwitch />
  <LanguageSwitcher />
</div>
```

**Files Changed:**
- `src/features/auth/auth-layout.tsx` - Added ThemeSwitch component

## Translation Keys Added

### Portuguese (pt-BR)
```json
{
  "auth": {
    "passwordTooShort": "A senha deve ter pelo menos {{count}} caracteres",
    "nameTooShort": "O nome deve ter pelo menos {{count}} caracteres",
    "passwordsDontMatch": "As senhas não coincidem",
    "welcome": "Bem-vindo!",
    "socialLogin": {
      "success": "Login com {{provider}} realizado com sucesso"
    }
  }
}
```

### English (en-US)
```json
{
  "auth": {
    "passwordTooShort": "Password must be at least {{count}} characters",
    "nameTooShort": "Name must be at least {{count}} characters",
    "passwordsDontMatch": "Passwords don't match",
    "welcome": "Welcome!",
    "socialLogin": {
      "success": "Successfully logged in with {{provider}}"
    }
  }
}
```

## Testing Checklist

- [ ] Test login with wrong credentials in pt-BR - error messages should be in Portuguese
- [ ] Test login with wrong credentials in en-US - error messages should be in English
- [ ] Test form validation (empty email, invalid email, short password) in both languages
- [ ] Check social login buttons visibility in light mode
- [ ] Check social login buttons visibility in dark mode
- [ ] Verify theme switcher appears on login page
- [ ] Verify theme switcher appears on signup page
- [ ] Test switching theme on login page
- [ ] Test switching language on login page
- [ ] Verify both switchers are properly aligned and spaced

## Implementation Notes

### Why Dynamic Schema Generators?

The original approach had static schemas with hardcoded messages:
```typescript
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
```

This doesn't support i18n because:
1. Messages are evaluated at module load time
2. Can't access i18n.t() which depends on current language
3. Changing language won't update validation messages

The new approach creates schemas dynamically:
```typescript
export const getLoginSchema = () => z.object({
  email: z.string().min(1, i18n.t('auth.emailRequired')).email(i18n.t('auth.emailInvalid')),
  password: z.string().min(6, i18n.t('auth.passwordTooShort', { count: 6 })),
})
```

Benefits:
- Messages use current language when schema is created
- Can use interpolation for dynamic values (e.g., character counts)
- Easy to add new languages without code changes

### Dark Mode Color Strategy

For buttons with colored branding:
- Light mode: Use brand colors with subtle backgrounds
- Dark mode: Use muted/desaturated versions + darker backgrounds
- Maintain sufficient contrast for accessibility

Example breakdown:
```
Google (Blue):
- Light: bg-blue-50 (very light blue bg)
- Dark: bg-blue-950/30 (very dark blue, 30% opacity)
```

## Future Improvements

1. Consider moving validation schemas to a separate service that always uses latest i18n context
2. Add more granular error messages (e.g., "Email already exists", "Account locked")
3. Consider adding loading states for theme switcher
4. Add keyboard shortcuts for theme toggle (e.g., Ctrl+Shift+T)

---

**Date:** 2024-10-03
**Status:** ✅ Completed
**Impact:** High - Fixes critical UX issues on authentication pages
