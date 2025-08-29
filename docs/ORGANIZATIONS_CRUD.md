# Organizations CRUD Implementation

## Overview
Complete CRUD (Create, Read, Update, Delete) implementation for organizations in the FastAPI backend and React frontend boilerplate.

## Backend Implementation

### New API Endpoints Added

#### 1. Get Organization by ID
- **Endpoint**: `GET /api/v1/auth/organization/{org_id}`
- **Description**: Retrieve a specific organization the user is a member of
- **Authentication**: Required
- **Permissions**: User must be a member of the organization

#### 2. Update Organization
- **Endpoint**: `PUT /api/v1/auth/organization/{org_id}`
- **Description**: Update organization details (name, slug, logo)
- **Authentication**: Required
- **Permissions**: User must be owner or admin of the organization
- **Body**: `{ "name": "string", "slug": "string", "logo": "string" }`

#### 3. Delete Organization
- **Endpoint**: `DELETE /api/v1/auth/organization/{org_id}`
- **Description**: Delete an organization and all associated data
- **Authentication**: Required
- **Permissions**: Only organization owners can delete
- **Cascade**: Automatically removes organization members

### Existing Endpoints
- `GET /api/v1/auth/organization` - List user's organizations
- `POST /api/v1/auth/organization` - Create new organization
- `POST /api/v1/auth/organization/set-active` - Set active organization

## Frontend Implementation

### Components Structure
```
src/features/organizations/
├── index.tsx                     # Main export
├── components/
│   ├── organizations-list.tsx    # Main list view with CRUD actions
│   ├── create-organization-dialog.tsx  # Create organization modal
│   └── edit-organization-dialog.tsx    # Edit organization modal
```

### Routes
- `/organizations` - Main organizations management page

### Features Implemented

#### 1. Organizations List Page
- **Grid layout** with organization cards
- **Loading states** with skeleton cards
- **Empty state** with call-to-action
- **Responsive design** (mobile, tablet, desktop)

#### 2. Create Organization
- **Modal dialog** with form validation
- **Auto-slug generation** from organization name
- **Inline error handling** with server error display
- **Real-time updates** to organization list
- **Success notifications**

#### 3. Edit Organization
- **Modal dialog** pre-populated with current data
- **Form validation** with zod schema
- **Inline error handling**
- **Real-time updates** after successful edit
- **Success notifications**

#### 4. Delete Organization
- **Confirmation dialog** with destructive action warning
- **Error handling** for insufficient permissions
- **Real-time updates** after successful deletion
- **Success notifications**

#### 5. Navigation Integration
- Added "Organizations" link to main sidebar navigation
- Uses Building2 icon from Lucide React

### State Management

#### Auth Store Extensions
- **Added `addOrganization` method** to add new organizations to state
- **Enhanced organization management** with proper state updates
- **Integration with Better Auth** for seamless organization handling

### API Client Updates
- **Enhanced organizationApi** with full CRUD operations:
  - `list()` - Get all user organizations
  - `get(id)` - Get specific organization
  - `create(data)` - Create new organization
  - `update(id, data)` - Update organization
  - `delete(id)` - Delete organization
  - `setActive(id)` - Set active organization

### Error Handling
- **Inline error display** for form validation errors
- **Server error handling** with proper error message extraction
- **Toast notifications** for success/error feedback
- **Loading states** during API operations
- **Permission-based error messages**

### Form Validation
- **Zod schemas** for type-safe validation
- **Required field validation**
- **String length limits** (organization name max 100 chars)
- **Auto-slug generation** with sanitization
- **Real-time validation feedback**

## Usage Flow

### Create Organization
1. Click "Create Organization" button
2. Enter organization name (required)
3. Optionally customize slug (auto-generated)
4. Submit form
5. Organization added to list and auth store
6. Success notification displayed

### Edit Organization
1. Click three-dot menu on organization card
2. Select "Edit" option
3. Modify organization details in modal
4. Submit changes
5. Organization updated in list
6. Success notification displayed

### Delete Organization
1. Click three-dot menu on organization card
2. Select "Delete" option (red, destructive)
3. Confirm deletion in warning dialog
4. Organization removed from list and backend
5. Success notification displayed

## Security Features
- **Authentication required** for all operations
- **Role-based permissions** (owner/admin for edit, owner for delete)
- **Input validation** and sanitization
- **Error message standardization**
- **CORS protection** through existing backend setup

## Technical Features
- **Type-safe** with TypeScript interfaces
- **React Query** for caching and optimistic updates
- **Form validation** with react-hook-form and zod
- **Responsive design** with Tailwind CSS
- **Accessibility** with proper ARIA labels and keyboard navigation
- **Loading states** and error boundaries
- **Toast notifications** for user feedback

## Database Schema
Uses existing organization and organization_member tables:
- Organizations can have multiple members
- Members have roles (owner, admin, member)
- Cascade deletion removes associated members
- Foreign key constraints ensure data integrity

## Integration Points
- **Team Switcher**: Integrates with existing organization selection
- **Navigation**: Added to main sidebar menu
- **Auth Store**: Seamless integration with authentication state
- **Permissions**: Respects existing role-based access control
- **Better Auth**: Compatible with existing authentication flow

This implementation provides a complete, production-ready CRUD interface for organization management with proper error handling, validation, and user experience considerations.