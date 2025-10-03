# Organization Store Synchronization Fix

## Issue Description

The team switcher was showing **"Default Organization - No organizations yet"** while the `/organizations` page displayed **2 organizations**. This created confusion about which information was correct.

## Root Cause

The application had **two separate data sources** for organizations that were not synchronized:

1. **React Query** (used in `/organizations` page)
   - Fetches organizations independently via `useQuery`
   - Stores data in React Query cache
   - Used by `organizations-list.tsx`

2. **Zustand Store** (used in team switcher)
   - Separate state management
   - Only populated on `checkSession` in auth store
   - Used by `team-switcher.tsx`

### The Problem

When navigating directly to `/organizations`:
- React Query fetched and displayed organizations ✅
- Zustand store remained empty (not yet initialized) ❌
- Team switcher showed "No organizations" because it reads from Zustand store

## The Fix

### 1. Enhanced Organization Store (`organization-store.ts`)

Updated `setOrganizations` to handle edge cases:

```typescript
setOrganizations: (organizations) => {
  set({ organizations })
  const { activeOrganization } = get()
  
  if (!activeOrganization && organizations.length > 0) {
    // Set first org as active if none selected
    set({ activeOrganization: organizations[0] })
  } else if (activeOrganization && organizations.length > 0) {
    // Verify active org still exists in new list
    const stillExists = organizations.find(org => org.id === activeOrganization.id)
    if (!stillExists) {
      set({ activeOrganization: organizations[0] })
    }
  }
},
```

### 2. Synchronized Organizations List (`organizations-list.tsx`)

Added synchronization between React Query and Zustand store:

**Added imports:**
```typescript
import { useEffect } from 'react'
import { useOrganizationStore } from '@/stores/organization-store'
```

**Added sync effect:**
```typescript
// Sync React Query data with Zustand store whenever organizations change
useEffect(() => {
  if (organizations.length >= 0) {
    const orgStore = useOrganizationStore.getState()
    orgStore.setOrganizations(organizations)
  }
}, [organizations])
```

**Updated switch handler:**
```typescript
const handleSwitch = async (organization: Organization) => {
  try {
    // Use organization store's setActive (updates both API and local state)
    await organizationStore.setActive(organization.id)
    queryClient.invalidateQueries({ queryKey: ['organizations'] })
    toast.success(`Switched to ${organization.name}`)
  } catch (error) {
    // error handling...
  }
}
```

## Benefits

### Before Fix
- ❌ Two sources of truth (React Query + Zustand)
- ❌ Data could be out of sync
- ❌ Team switcher showed wrong information
- ❌ Confusing user experience

### After Fix
- ✅ Single source of truth (Zustand store)
- ✅ React Query keeps data fresh
- ✅ Automatic synchronization via `useEffect`
- ✅ Team switcher always shows correct data
- ✅ Consistent state across all components

## How It Works Now

1. **Initial Load**
   - `checkSession()` in auth store fetches organizations
   - Populates Zustand store
   - Team switcher displays correctly

2. **Visit /organizations Page**
   - React Query fetches fresh data
   - `useEffect` syncs data to Zustand store
   - Team switcher updates automatically

3. **Create Organization**
   - New org added to React Query cache
   - `useEffect` syncs to Zustand store
   - Team switcher shows new organization

4. **Switch Organization**
   - Uses `organizationStore.setActive()`
   - Updates both backend and local state
   - Consistent across all components

5. **Delete Organization**
   - React Query refetches
   - `useEffect` syncs updated list
   - Zustand store removes deleted org
   - If active org was deleted, first available org becomes active

## Testing Checklist

- [x] Team switcher shows correct organization count
- [x] Organizations page displays all organizations
- [x] Both sources show same data
- [x] Switching organizations updates team switcher immediately
- [x] Creating organization appears in team switcher
- [x] Deleting organization removes from team switcher
- [x] Active organization persists across page refreshes
- [x] No console errors

## Files Modified

1. ✅ `src/stores/organization-store.ts`
   - Enhanced `setOrganizations` logic
   - Better handling of active organization

2. ✅ `src/features/organizations/components/organizations-list.tsx`
   - Added `useEffect` for synchronization
   - Integrated with Zustand store
   - Updated switch handler

## Answer to Original Question

> "Which info is correct?"

**Both were technically correct**, but showing different states:

- **Organizations page** (React Query): Shows fresh data from API ✅
- **Team switcher** (Zustand): Was showing empty/cached state ❌

Now both are **always in sync** and show the correct, up-to-date information.

## Summary

✅ **Identified the issue**: Two separate, unsynchronized data sources  
✅ **Implemented sync**: React Query → Zustand store  
✅ **Fixed team switcher**: Now displays correct organization data  
✅ **Improved UX**: Consistent information across all components  
✅ **No breaking changes**: Maintains existing functionality

The organizations feature now works seamlessly with proper state synchronization across the entire application!
