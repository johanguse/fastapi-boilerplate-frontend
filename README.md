# Boilerplate Frontend

Modern admin dashboard built with React, TypeScript, and Shadcn UI. Features internationalization, authentication with session persistence, and a comprehensive component library.

This project serves as a complete frontend boilerplate that works with **two backend options**:

- **FastAPI** (Python) - Port 8000
- **Bun + Hono** (TypeScript) - Port 3000

## ✨ Features

### 🔐 Authentication & Session Management

- **Session Persistence**: Maintains login state across page reloads
- **Better Auth Integration**: Cookie-based authentication with automatic session restoration
- **Protected Routes**: Seamless authentication checks with redirect handling
- **Multi-provider Support**: GitHub, Facebook, and email/password authentication

### 🌍 Internationalization (i18n)

- **9 Languages**: English (US, GB), Spanish (ES, MX), French (FR, CA), German, and Portuguese (BR, PT)
- **Import-based Loading**: Translation files bundled with the application for better performance
- **TypeScript Integration**: Full type safety and autocomplete for translation keys
- **CLI Automation**: [i18next-cli](https://github.com/i18next/i18next-cli) for automatic key extraction and validation
- **Language Switcher**: Easy language switching in authentication flows
- **Robust Fallback**: Default text for all translation keys prevents missing UI text
- **Automated Testing**: Translation consistency tests ensure no missing keys
- **Developer Experience**: Watch mode for automatic key extraction during development

### 🎨 UI & Design

- **Shadcn UI Components**: Modern, accessible component library
- **Light/Dark Mode**: Theme switching with system preference detection
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **RTL Support**: Right-to-left language support
- **Accessibility**: WCAG compliant components

### 📱 Layout & Navigation

- **Sidebar Navigation**: Collapsible sidebar with organized sections
- **Breadcrumb Navigation**: Context-aware breadcrumbs
- **Global Search**: Command palette for quick navigation
- **Top Navigation**: Dashboard tabs and user menu

### 🛠 Developer Experience

- **React 19.2**: Latest React with `useEffectEvent` for cleaner effect handling
- **TypeScript**: Full type safety throughout the application
- **Bun**: Ultra-fast JavaScript runtime and package manager
- **Vite**: Fast build tool with Hot Module Replacement (HMR)
- **Biome**: Lightning-fast linter and formatter (10-100x faster than ESLint/Prettier)
- **TanStack Router**: Type-safe routing with automatic code splitting
- **React Query**: Data fetching and caching
- **Zustand**: Lightweight state management
- **Hey API**: Auto-generated TypeScript SDK from backend OpenAPI spec for end-to-end type safety

## 📋 Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   ├── layout/         # Layout components (sidebar, header)
│   └── auth-provider.tsx # Session persistence provider
├── features/           # Feature-based modules
│   ├── auth/          # Authentication components
│   ├── dashboard/     # Dashboard pages
│   └── organizations/ # Organization management
├── i18n/              # Internationalization
│   ├── locales/       # Translation files (9 languages)
│   └── types.ts       # TypeScript definitions
├── hooks/             # Custom React hooks
│   ├── use-auth.ts    # Authentication hook
│   └── use-auth-init.ts # Session initialization
├── stores/            # Zustand state stores
├── lib/               # Utilities and configurations
│   └── i18n.ts        # i18n configuration
├── routes/            # TanStack Router route definitions
└── styles/            # Global styles and themes
```

## 🌍 Internationalization Status

### Current Implementation

- ✅ **Migration Complete**: Successfully migrated from HTTP backend to import-based loading
- ✅ **CLI Integration**: i18next-cli configured for automated key extraction and validation
- ✅ **TypeScript Support**: Full type safety and autocomplete for translation keys
- ✅ **Testing**: Automated consistency tests ensure all languages have matching keys
- ✅ **Documentation**: Comprehensive i18n documentation in `docs/i18n.md`

### Available Scripts

```bash
# Extract translation keys from your code
bun run i18n:extract

# Watch mode - automatically extract keys as you code
bun run i18n:extract:watch

# Sync translation files between languages
bun run i18n:sync

# Test translation consistency
bun test
```

### Next Steps

- Gradually internationalize existing hardcoded strings
- Re-enable linting when more strings are properly internationalized
- Consider integration with translation management services

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔧 Component Customizations

This project uses Shadcn UI components, with some customized for better RTL support and other improvements.

### Modified Components

- **scroll-area**: General updates for better UX
- **sonner**: Toast notification customizations
- **separator**: Layout improvements

### RTL Updated Components

- **alert-dialog, calendar, command**: RTL layout adjustments
- **dialog, dropdown-menu, select**: Positioning updates for RTL
- **table, sheet, sidebar**: RTL-compatible layouts
- **switch**: Direction-aware styling

**Note**: If you don't require RTL support, RTL Updated Components can be safely updated via Shadcn CLI. For Modified Components, manually merge changes to preserve customizations.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and Bun (or pnpm/npm/yarn)
- One of the following backends running:
  - **FastAPI** (Python) on port 8000
  - **Bun + Hono** (TypeScript) on port 3000

### Installation

Clone the repository

```bash
git clone <repository-url>
cd boilerplate/frontend
```

Install dependencies

```bash
bun install
```

Configure environment variables

```bash
# For FastAPI backend (default)
cp .env.fastapi .env

# For Bun + Hono backend
cp .env.bun .env
```

Or create your own `.env` from the example:

```bash
cp .env.example .env
```

Key environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_BACKEND_TYPE` | Backend type: `fastapi` or `bun` | `fastapi` |
| `VITE_API_URL_FASTAPI` | FastAPI API URL | `http://localhost:8000/api/v1` |
| `VITE_API_URL_BUN` | Bun + Hono API URL | `http://localhost:3000/api/v1` |
| `VITE_APP_NAME` | Application name | - |

Generate the API client (Hey API)

```bash
# With FastAPI backend running
bun run gen:api

# With Bun + Hono backend running
bun run gen:api:bun
```

Start the development server

```bash
bun run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
bun run build
bun run preview
```

### Code Quality

Run linting and formatting:

```bash
# Check code quality (linting + formatting)
bun run check

# Auto-fix issues
bun run check:fix

# Format only
bun run format

# Lint only
bun run lint
```

## 🔧 Configuration

### Code Quality with Biome

This project uses [Biome](https://biomejs.dev/) for blazing-fast linting and formatting:

**Why Biome?**

- ⚡ **10-100x faster** than ESLint + Prettier
- 🔧 **Single tool** for linting AND formatting
- 🎯 **Zero configuration** needed to get started
- 📦 **Smaller footprint** - one dependency instead of dozens

**Configuration**: See `biome.json` for the complete setup. The configuration:

- Enforces consistent code style (single quotes, 2-space indentation, no semicolons)
- Checks for common errors and code quality issues
- Automatically organizes imports
- Excludes generated files and UI library components
- Uses `.gitignore` for consistent file exclusions

**Editor Integration**: Install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) for real-time linting and format-on-save.

### Authentication Setup

The frontend is configured to work with Better Auth backend. Ensure your FastAPI backend has the following endpoints:

- `POST /api/v1/auth/sign-in/email` - Email/password login
- `POST /api/v1/auth/sign-up/email` - User registration
- `GET /api/v1/auth/session` - Get current session
- `POST /api/v1/auth/sign-out` - Logout

### Internationalization (i18n) Configuration

The project uses [i18next-cli](https://github.com/i18next/i18next-cli) for automated translation management:

**Available Commands:**

```bash
bun run i18n:extract        # Extract translation keys from code
bun run i18n:extract:watch  # Watch mode - auto-extract as you code
bun run i18n:lint          # Validate translation files
bun run i18n:sync          # Sync translations between languages
```

**Adding New Languages:**

1. Add language code to `i18next.config.ts`
2. Run `bun run i18n:extract` to create translation files
3. Translate the generated keys in `src/i18n/locales/[lang]/translation.json`
4. Update the language switcher component

**Translation Structure:**

- All translations are in `src/i18n/locales/`
- Import-based loading for better TypeScript integration
- Automatic key extraction from your codebase
- Type safety and autocomplete for translation keys

## 📦 Tech Stack

**Framework:** [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)

**Build Tool:** [Vite](https://vitejs.dev/) with Hot Module Replacement

**UI Library:** [Shadcn UI](https://ui.shadcn.com) (Tailwind CSS + Radix UI)

**Routing:** [TanStack Router](https://tanstack.com/router/latest) with type-safe routes

**State Management:** [Zustand](https://github.com/pmndrs/zustand) for global state

**Data Fetching:** [TanStack Query](https://tanstack.com/query/latest) with caching

**Authentication:** [Better Auth](https://www.better-auth.com/) integration

**Internationalization:** [React i18next](https://react.i18next.com/) with [i18next-cli](https://github.com/i18next/i18next-cli) automation and 9 language locales

**Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom design system

**Icons:** [Lucide Icons](https://lucide.dev/icons/) and [Radix Icons](https://www.radix-ui.com/icons)

**Code Quality:** [Biome](https://biomejs.dev/) - Fast linter & formatter (replaces ESLint + Prettier)

**Package Manager:** [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager

## 🔍 Key Features Explained

### Session Persistence

The application automatically restores user sessions on page reload through:

- **AuthProvider Component**: Wraps the app and checks for existing sessions on startup
- **Cookie-based Storage**: Uses HTTP-only cookies for secure session management
- **Automatic Restoration**: Fetches user data from backend if session cookie exists
- **Loading States**: Shows loading spinner during session check

### Internationalization System

Complete i18n implementation with:

- **Translation Files**: JSON files in `src/i18n/locales/[lang]/translation.json`
- **9 Language Variants**: en-US, en-GB, es-ES, es-MX, fr-FR, fr-CA, de-DE, pt-BR, pt-PT
- **Import-based Loading**: Translation files bundled with the application for better performance
- **CLI Automation**: Automatic key extraction and validation with i18next-cli
- **TypeScript Integration**: Full type safety and autocomplete for translation keys
- **Namespace Organization**: Structured translations (auth, dashboard, admin, common, etc.)
- **Fallback Support**: English (en-US) as default fallback language
- **Context Integration**: Available throughout the app via `useTranslation` hook
- **Type Safety**: All translation keys have default text fallbacks
- **Automated Testing**: Consistency tests ensure all locales have matching keys

### Authentication Flow

1. User signs in via email/password or OAuth providers
2. Backend sets HTTP-only session cookie
3. Frontend stores user data in Zustand store
4. Protected routes check authentication status
5. Session automatically restored on app reload

## 🛠 Available Scripts

```bash
# Development
bun run dev              # Start development server with HMR

# Building
bun run build            # Type-check and build for production
bun run preview          # Preview production build locally


# Code Quality (powered by Biome)
bun run check            # Check linting & formatting (recommended for CI/CD)
bun run check:fix        # Auto-fix linting & formatting issues (recommended for development)
bun run lint             # Run linter only
bun run lint:fix         # Run linter with auto-fix
bun run format           # Format all code files
bun run format:check     # Check formatting without modifying files

# Testing
bun test                 # Run all tests (includes i18n consistency tests)

# API Client Generation (Hey API) - Make sure the backend is running
bun run gen:api          # Generate SDK from FastAPI backend (port 8000)
bun run gen:api:bun      # Generate SDK from Bun + Hono backend (port 3000)
bun run gen:api:watch    # Watch mode - regenerate SDK when spec changes
bun run gen:api:check    # Regenerate and fail if types changed (for CI)

# CI/CD
bun run ci               # Run checks and tests
bun run ci:full          # Run gen:api:check + checks + tests (ensures SDK in sync)

# Internationalization
bun run i18n:extract     # Extract translation keys from code
bun run i18n:extract:watch # Watch mode - auto-extract as you code
bun run i18n:lint       # Validate translation files
bun run i18n:sync       # Sync translations between languages

# Utilities
bun run generate-routes  # Generate TanStack Router route tree
bun run knip             # Find unused dependencies and exports
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run `bun run check:fix` to ensure code quality
5. Run `bun test` to verify all tests pass
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

**Code Quality Standards:**

- All code must pass `bun run check` (Biome linting + formatting)
- All translation keys must have default fallback text
- New translations must be added to all 9 language files
- Run `bun test` to ensure i18n consistency
