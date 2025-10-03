# Data Source Consolidation - Complete Migration to React Query

## Overview
Successfully migrated the entire frontend application to use **React Query as the single source of truth** for all server data, eliminating the previous mixed architecture that used both Zustand stores and React Query.

## Problem Statement
The application previously had a **fragmented data architecture** with multiple sources of truth:
- **React Query** - Used in some components for data fetching
- **Zustand stores** (organization-store.ts) - Used for state management with persistence
- **Manual synchronization** - useEffect hooks syncing between data sources

This caused:
1. **Data inconsistencies** - Team switcher showed "No organizations" while `/organizations` page showed 2 organizations
2. **Complex synchronization logic** - Multiple places where data needed to be manually synced
3. **Hard to maintain** - Changes required updates in multiple places
4. **Performance issues** - Redundant data fetching and storage

## Solution: Single Source of Truth with React Query

### Why React Query?
- ✅ **Automatic caching** - Built-in smart caching with configurable stale/cache times
- ✅ **Automatic synchronization** - Automatically refetches and updates all components
- ✅ **Query invalidation** - Simple pattern to refresh data after mutations
- ✅ **Loading/error states** - Built-in state management for async operations
- ✅ **Optimistic updates** - Support for optimistic UI patterns
- ✅ **Background refetching** - Keeps data fresh automatically
- ✅ **Server state management** - Specifically designed for server data

## Implementation Details

### 1. Created Centralized Hook: `useOrganizations`

**Location:** `src/hooks/use-organizations.ts`

```typescript
export function useOrganizations() {
  // Fetch from API with React Query
  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationApi.list,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Active organization from cookie (persistence)
  const activeOrganizationId = getActiveOrganizationId()
  const activeOrganization = organizations.find(
    org => org.id === activeOrganizationId
  ) || organizations[0] || null

  // Mutations for CRUD operations
  const { mutate: createOrganization } = useMutation({
    mutationFn: organizationApi.create,
    onSuccess: (newOrg) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      setActiveOrganizationId(newOrg.id)
    }
  })

  return {
    organizations,
    activeOrganization,
    isLoading,
    createOrganization,
    // ... other mutations
  }
}
```

**Key Features:**
- Single query fetches all organizations
- Active organization selection via cookie (lightweight persistence)
- All mutations automatically invalidate and refetch
- Toast notifications built into mutations
- Loading states for all operations

### 2. Removed Zustand Organization Store

**Deleted:** `src/stores/organization-store.ts` (160+ lines)

**Removed logic:**
- Manual API calls
- LocalStorage persistence
- State synchronization
- Custom setters/getters
- Store subscriptions

### 3. Updated All Components

#### Team Switcher (`team-switcher.tsx`)
**Before:**
```typescript
import { useOrganization } from '@/stores/organization-store'
const { organizations, activeOrganization, setActive } = useOrganization()
await setActive(orgId) // Manual async call
```

**After:**
```typescript
import { useOrganizations } from '@/hooks/use-organizations'
const { organizations, activeOrganization, setActiveOrganization } = useOrganizations()
setActiveOrganization(orgId) // Simple sync call, handled by mutation
```

#### Organizations List (`organizations-list.tsx`)
**Before:**
```typescript
// Fetching with React Query
const { data: organizations } = useQuery({
  queryKey: ['organizations'],
  queryFn: organizationApi.list,
})

// Manual sync to Zustand store
useEffect(() => {
  if (organizations.length >= 0) {
    const orgStore = useOrganizationStore.getState()
    orgStore.setOrganizations(organizations)
  }
}, [organizations])
```

**After:**
```typescript
// Single source - no sync needed
const {
  organizations,
  isLoading,
  setActiveOrganization,
  deleteOrganization
} = useOrganizations()
```

#### Create Organization Dialog (`create-organization-dialog.tsx`)
**Before:**
```typescript
const createMutation = useMutation({
  mutationFn: organizationApi.create,
  onSuccess: (newOrg) => {
    queryClient.invalidateQueries({ queryKey: ['organizations'] })
    addOrganization(newOrg) // Manual store update
  }
})
```

**After:**
```typescript
const { createOrganization, isCreating } = useOrganizations()
// Mutation handles everything automatically
```

#### Pricing & Billing Pages
**Before:**
```typescript
import { useOrganization } from '@/stores/organization-store'
const { activeOrganization } = useOrganization()
```

**After:**
```typescript
import { useOrganizations } from '@/hooks/use-organizations'
const { activeOrganization } = useOrganizations()
```

#### Sidebar Hooks (`use-sidebar-data.ts`)
**Before:**
```typescript
import { useOrganization } from '@/stores/organization-store'
const { activeOrganization } = useOrganization()
```

**After:**
```typescript
import { useOrganizations } from '@/hooks/use-organizations'
const { activeOrganization } = useOrganizations()
```

### 4. Cleaned Up Auth Store

**File:** `src/stores/auth-store.ts`

**Removed:**
- Import of `useOrganizationStore`
- All `useOrganizationStore.getState().reset()` calls
- `fetchOrganizations()` calls on session check
- Organization state synchronization

**Result:** Auth store now only manages authentication state, no cross-concerns.

## Data Flow Architecture

### Before (Mixed Architecture)
```
API Server
    ↓
React Query (temporary cache)
    ↓
useEffect sync
    ↓
Zustand Store (localStorage persistence)
    ↓
Components
```

**Problems:**
- Two sources of truth
- Manual synchronization required
- Race conditions possible
- Complex debugging

### After (Single Source)
```
API Server
    ↓
React Query Cache (with config)
    ↓
useOrganizations Hook
    ↓
Components
```

**Benefits:**
- One source of truth
- Automatic synchronization
- No race conditions
- Simple to understand

## Persistence Strategy

### Active Organization Selection
- **Storage:** HTTP cookie (`ba_active_org`)
- **Why:** Lightweight, server-accessible, no localStorage quota issues
- **Expiry:** 30 days
- **Sync:** Cookie updated on setActiveOrganization mutation

### Organizations List
- **Storage:** React Query cache
- **Stale Time:** 5 minutes (configurable)
- **Cache Time:** 10 minutes (configurable)
- **Refetch:** On window focus (production), manual invalidation after mutations

## Benefits Achieved

### 1. Data Consistency ✅
- All components always show the same data
- No more sync issues between team switcher and organizations page
- Single invalidation refreshes entire app

### 2. Simplified Codebase ✅
- Removed 160+ lines of Zustand store code
- Removed all useEffect synchronization logic
- Removed manual API calls in components
- Single hook provides all organization functionality

### 3. Better Performance ✅
- React Query deduplicates requests
- Smart caching reduces API calls
- Background refetching keeps data fresh
- Optimistic updates possible

### 4. Improved Developer Experience ✅
- Clear data flow
- TypeScript types from React Query
- DevTools for debugging queries
- Less boilerplate code

### 5. Maintainability ✅
- Single place to update organization logic
- Easy to add new features
- Clear separation of concerns
- No hidden state

## Usage Examples

### Fetching Organizations
```typescript
function MyComponent() {
  const { organizations, isLoading, error } = useOrganizations()
  
  if (isLoading) return <Spinner />
  if (error) return <Error />
  
  return <OrganizationList organizations={organizations} />
}
```

### Getting Active Organization
```typescript
function MyComponent() {
  const { activeOrganization } = useOrganizations()
  
  return <div>Active: {activeOrganization?.name}</div>
}
```

### Switching Organizations
```typescript
function OrgSwitcher() {
  const { organizations, setActiveOrganization } = useOrganizations()
  
  return (
    <select onChange={e => setActiveOrganization(e.target.value)}>
      {organizations.map(org => (
        <option key={org.id} value={org.id}>{org.name}</option>
      ))}
    </select>
  )
}
```

### Creating Organization
```typescript
function CreateForm() {
  const { createOrganization, isCreating } = useOrganizations()
  
  const handleSubmit = (data) => {
    createOrganization(data) // Automatically handles success/error
  }
  
  return <Form onSubmit={handleSubmit} loading={isCreating} />
}
```

## Migration Checklist

- [x] Create `useOrganizations` hook with React Query
- [x] Update `team-switcher.tsx` to use new hook
- [x] Update `organizations-list.tsx` to remove sync logic
- [x] Update `pricing/index.tsx` to use new hook
- [x] Update `settings/billing.tsx` to use new hook
- [x] Update `use-sidebar-data.ts` to use new hook
- [x] Update `create-organization-dialog.tsx` to use new hook
- [x] Remove organization imports from `auth-store.ts`
- [x] Delete `organization-store.ts` file
- [x] Test all organization features
- [x] Verify no TypeScript errors

## Seed Data Context

According to `backend/scripts/seed/organizations.py`:

**admin@example.com (users[0]) has 2 organizations:**
1. **Development Team** - Role: **owner**
2. **Customer Success** - Role: **owner**

The team switcher should now correctly display both organizations for this user.

## Testing

### Manual Testing Steps
1. ✅ Login as admin@example.com
2. ✅ Verify team switcher shows "2 organizations"
3. ✅ Navigate to /organizations page
4. ✅ Verify page shows same 2 organizations
5. ✅ Switch between organizations in team switcher
6. ✅ Verify active organization updates across app
7. ✅ Create a new organization
8. ✅ Verify it appears in both team switcher and organizations page
9. ✅ Delete an organization
10. ✅ Verify it disappears from all places

### Expected Behavior
- Team switcher and organizations page always show identical data
- Switching organizations is instant
- Creating/deleting organizations updates entire app
- No console errors or warnings
- Loading states work correctly

## Configuration

### React Query Settings
```typescript
// In use-organizations.ts
staleTime: 5 * 60 * 1000,  // 5 minutes - data considered fresh
gcTime: 10 * 60 * 1000,     // 10 minutes - cache garbage collection
```

### Cookie Settings
```typescript
// In use-organizations.ts
setCookie(ACTIVE_ORG_COOKIE, organizationId, 30) // 30 days expiry
```

## Future Improvements

### Possible Enhancements
1. **Optimistic Updates** - Update UI before API responds
2. **Pagination** - For users with many organizations
3. **Search/Filter** - In organization selector
4. **Prefetching** - Load organization details on hover
5. **Mutation Queuing** - Handle offline mutations
6. **Real-time Updates** - WebSocket sync for multi-device

### Not Recommended
- ❌ Adding back Zustand stores for organizations
- ❌ Manual localStorage persistence
- ❌ useEffect synchronization between sources
- ❌ Component-level caching

## Conclusion

This migration successfully consolidated all data fetching into React Query, creating a **simpler, more maintainable, and more reliable** architecture. The application now has:

- ✅ Single source of truth for all server data
- ✅ Automatic synchronization across components
- ✅ Better performance through smart caching
- ✅ Improved developer experience
- ✅ Consistent data everywhere

All organization features work correctly with the seed data, showing that **admin@example.com** properly has access to 2 organizations as expected.
