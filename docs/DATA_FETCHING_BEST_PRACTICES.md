# Data Fetching Best Practices

This document outlines the correct patterns for fetching data in the application using React Query (TanStack Query).

## Table of Contents

1. [Why React Query?](#why-react-query)
2. [Correct Pattern: Using `useQuery`](#correct-pattern-using-usequery)
3. [Correct Pattern: Using `useMutation`](#correct-pattern-using-usemutation)
4. [Correct Pattern: Custom Hooks](#correct-pattern-custom-hooks)
5. [Anti-Pattern: Manual Fetching](#anti-pattern-manual-fetching)
6. [Migration Guide](#migration-guide)
7. [Complete Examples](#complete-examples)

---

## Why React Query?

React Query provides:
- ✅ Automatic caching and background refetching
- ✅ Loading and error states out of the box
- ✅ No need for `useEffect` for data fetching
- ✅ Automatic retries and stale-while-revalidate
- ✅ Built-in pagination and infinite scroll support
- ✅ Mutation with optimistic updates

---

## Correct Pattern: Using `useQuery`

### ✅ Good Example: Organization Details

**File:** `features/organizations/organization-details.tsx`

```typescript
import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { api } from '@/lib/api'

export function OrganizationDetails() {
  const { organizationId } = useParams({
    from: '/_authenticated/organizations/$organizationId/',
  })

  // ✅ Uses useQuery for fetching data
  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization', organizationId],
    queryFn: async () => {
      const response = await api.get(`/api/v1/organizations/${organizationId}`)
      return response.data
    },
  })

  // ✅ Automatic loading state
  if (isLoading || !organization) {
    return <div>Loading...</div>
  }

  return <div>{organization.name}</div>
}
```

**Benefits:**
- No manual loading state management
- Automatic caching and refetching
- No `useEffect` needed
- Type-safe with TypeScript

---

## Correct Pattern: Using `useMutation`

### ✅ Good Example: Custom Hook with Mutations

**File:** `hooks/use-organizations.ts`

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { organizationApi } from '@/lib/api'

export function useOrganizations() {
  const queryClient = useQueryClient()

  // ✅ Fetching data with useQuery
  const {
    data: organizations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['organizations'],
    queryFn: organizationApi.list,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // ✅ Mutation for creating organizations
  const createMutation = useMutation({
    mutationFn: organizationApi.create,
    onSuccess: (newOrg) => {
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization created successfully')
    },
    onError: () => {
      toast.error('Failed to create organization')
    },
  })

  // ✅ Mutation for deleting organizations
  const deleteMutation = useMutation({
    mutationFn: organizationApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete organization')
    },
  })

  return {
    organizations,
    isLoading,
    createOrganization: createMutation.mutate,
    deleteOrganization: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
```

---

## Correct Pattern: Custom Hooks

### ✅ Good Example: Analytics Charts

**File:** `features/ai-analytics/components/analytics-charts.tsx`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '@/lib/api'

export function AnalyticsCharts() {
  const queryClient = useQueryClient()
  const [selectedChart, setSelectedChart] = useState(null)

  // ✅ Fetching with useQuery
  const {
    data: charts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ai-analytics', 'charts'],
    queryFn: async () => {
      const response = await api.get('/ai-analytics/charts')
      return response.data.items || []
    },
  })

  // ✅ Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (chartId: string) => {
      await api.delete(`/ai-analytics/charts/${chartId}`)
    },
    onSuccess: () => {
      // Invalidate cache after delete
      queryClient.invalidateQueries({ queryKey: ['ai-analytics', 'charts'] })
      if (selectedChart) {
        setSelectedChart(null)
      }
    },
  })

  // ✅ Loading state
  if (isLoading) {
    return <div>Loading...</div>
  }

  // ✅ Error state
  if (error) {
    return <div>Error: {error.message}</div>
  }

  // ✅ Manual refresh
  return (
    <div>
      <Button onClick={() => refetch()}>Refresh</Button>
      {charts.map(chart => (
        <div key={chart.id}>{chart.name}</div>
      ))}
    </div>
  )
}
```

---

## Anti-Pattern: Manual Fetching

### ❌ Bad Example: Manual Fetch with useEffect

**❌ DON'T DO THIS:**

```typescript
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export function AnalyticsQuery() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ❌ Manual fetching with useEffect
  useEffect(() => {
    let ignore = false

    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await api.get('/data')
        if (!ignore) {
          setData(response.data)
        }
      } catch (err: any) { // ❌ Using 'any' type
        if (!ignore) {
          setError(err.response?.data?.detail)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => { ignore = true }
  }, [])

  return <div>{/* ... */}</div>
}
```

**Problems:**
- ❌ Manual loading/error state management
- ❌ Race condition handling with `ignore` flag
- ❌ No automatic caching
- ❌ No automatic refetching
- ❌ Dependency management issues
- ❌ More boilerplate code

---

## Migration Guide

### Step 1: Replace `useEffect` with `useQuery`

**Before:**
```typescript
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/data')
      setData(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

**After:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['myData'],
  queryFn: async () => {
    const response = await api.get('/data')
    return response.data
  },
})
```

### Step 2: Replace Manual Mutations with `useMutation`

**Before:**
```typescript
const handleDelete = async (id) => {
  try {
    setLoading(true)
    await api.delete(`/items/${id}`)
    setItems(prev => prev.filter(item => item.id !== id))
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

**After:**
```typescript
const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    await api.delete(`/items/${id}`)
  },
  onSuccess: () => {
    // Invalidate cache
    queryClient.invalidateQueries({ queryKey: ['items'] })
  },
})

const handleDelete = (id: string) => {
  deleteMutation.mutate(id)
}
```

### Step 3: Use Custom Hooks for Reusability

Create reusable hooks for common data operations:

```typescript
// hooks/use-analytics.ts
export function useAnalytics() {
  const queryClient = useQueryClient()

  const { data: charts = [], isLoading } = useQuery({
    queryKey: ['analytics', 'charts'],
    queryFn: async () => {
      const response = await api.get('/analytics/charts')
      return response.data
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/analytics/charts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'charts'] })
    },
  })

  return {
    charts,
    isLoading,
    deleteChart: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}
```

---

## Complete Examples

### Example 1: Simple Data Fetching

**Features:**
- Automatic loading/error states
- Caching
- Refetch on focus

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users')
      return response.data
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return <div>{/* Render data */}</div>
}
```

### Example 2: Data with Parameters

```typescript
function UserDetails({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId], // Include userId in key
    queryFn: async () => {
      const response = await api.get(`/users/${userId}`)
      return response.data
    },
    enabled: !!userId, // Only fetch if userId exists
  })

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>User not found</div>

  return <div>{data.name}</div>
}
```

### Example 3: Create, Update, Delete with Mutations

```typescript
function ItemManager() {
  const queryClient = useQueryClient()

  const { data: items = [] } = useQuery({
    queryKey: ['items'],
    queryFn: () => api.get('/items').then(res => res.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateItemData) => api.post('/items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateItemData }) =>
      api.put(`/items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })

  return (
    <div>
      <Button onClick={() => createMutation.mutate(newItemData)}>
        Create
      </Button>
      {items.map(item => (
        <div key={item.id}>
          <Button onClick={() => deleteMutation.mutate(item.id)}>
            Delete
          </Button>
        </div>
      ))}
    </div>
  )
}
```

### Example 4: Optimistic Updates

```typescript
function TodoList() {
  const queryClient = useQueryClient()

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/todos/${id}`),
    // Optimistically update the cache
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previousTodos = queryClient.getQueryData(['todos'])
      
      queryClient.setQueryData(['todos'], (old: any) => 
        old.map((todo: any) => 
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      )
      
      return { previousTodos }
    },
    onError: (err, id, context) => {
      // Rollback on error
      queryClient.setQueryData(['todos'], context?.previousTodos)
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return <div>{/* ... */}</div>
}
```

---

## Best Practices Summary

### ✅ DO:

1. **Use `useQuery` for fetching data**
   ```typescript
   const { data, isLoading, error } = useQuery({ ... })
   ```

2. **Use `useMutation` for create/update/delete**
   ```typescript
   const mutation = useMutation({ ... })
   ```

3. **Invalidate queries after mutations**
   ```typescript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ['myData'] })
   }
   ```

4. **Create custom hooks for reusable logic**
   ```typescript
   export function useMyData() {
     return useQuery({ ... })
   }
   ```

5. **Use proper TypeScript types**
   ```typescript
   const { data } = useQuery<MyDataType>({ ... })
   ```

6. **Use `refetch()` for manual refreshes**
   ```typescript
   const { refetch } = useQuery({ ... })
   <Button onClick={() => refetch()}>Refresh</Button>
   ```

### ❌ DON'T:

1. **Don't use `useEffect` for data fetching**
   ```typescript
   ❌ useEffect(() => { fetchData() }, [])
   ```

2. **Don't manually manage loading/error states**
   ```typescript
   ❌ const [loading, setLoading] = useState(true)
   ```

3. **Don't use `any` type for errors**
   ```typescript
   ❌ catch (err: any)
   ✅ catch (err: unknown) { const error = err as { message: string } }
   ```

4. **Don't forget to invalidate queries after mutations**
   ```typescript
   ❌ Just update local state
   ✅ Invalidate cache with queryClient.invalidateQueries
   ```

5. **Don't include function dependencies in useEffect**
   ```typescript
   ❌ useEffect(() => { fetchData() }, [fetchData])
   ```

---

## Real-World Examples in Codebase

### ✅ Good Examples:

1. **`features/organizations/organization-details.tsx`**
   - Uses `useQuery` for fetching organization data
   - Proper loading states
   - Clean and simple

2. **`hooks/use-organizations.ts`**
   - Custom hook with `useQuery` and `useMutation`
   - Proper cache invalidation
   - Great pattern for reusable data logic

3. **`features/organizations/components/organizations-list.tsx`**
   - Consumes custom hook
   - Clean separation of concerns
   - No manual data management

4. **`features/ai-analytics/components/analytics-charts.tsx`**
   - Uses `useQuery` for fetching
   - Uses `useMutation` for delete operations
   - Proper error handling

### ❌ Needs Migration:

1. **`features/ai-analytics/components/analytics-query.tsx`**
   - Uses manual `api.post()` in handler
   - Should use `useMutation` for the submit operation
   - Mix of correct and incorrect patterns

---

## Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools/devtools)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)

---

## Quick Reference

### Query Key Naming
```typescript
['users']                    // Simple list
['user', userId]             // Single item with ID
['users', 'list', { page }]  // List with pagination
['analytics', 'charts']      // Feature-specific
```

### Error Handling
```typescript
const { data, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  retry: 3,                    // Retry 3 times
  retryDelay: 1000,            // Wait 1s between retries
})

// Type-safe error handling
const errorMessage = error instanceof Error 
  ? error.message 
  : typeof error === 'string' 
    ? error 
    : 'An error occurred'
```

### Fetching Multiple Queries
```typescript
const { data: users } = useQuery({ queryKey: ['users'], queryFn: ... })
const { data: posts } = useQuery({ queryKey: ['posts'], queryFn: ... })
const { data: todos } = useQuery({ queryKey: ['todos'], queryFn: ... })
```

---

**Last Updated:** December 2024
