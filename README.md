# FastAPI Boilerplate Frontend

Modern admin dashboard built with React, TypeScript, and Shadcn UI. Features internationalization, authentication with session persistence, and a comprehensive component library.

This project serves as a complete frontend boilerplate for FastAPI applications, providing authentication, internationalization, and a beautiful admin interface out of the box.

## ✨ Features

### 🔐 Authentication & Session Management

- **Session Persistence**: Maintains login state across page reloads
- **Better Auth Integration**: Cookie-based authentication with automatic session restoration
- **Protected Routes**: Seamless authentication checks with redirect handling
- **Multi-provider Support**: GitHub, Facebook, and email/password authentication

### 🌍 Internationalization (i18n)

- **9 Languages**: English (US, GB), Spanish (ES, MX), French (FR, CA), German, and Portuguese (BR, PT)
- **File-based Translations**: Organized JSON translation files
- **React i18next**: Powerful internationalization framework
- **Language Switcher**: Easy language switching in authentication flows
- **Complete Coverage**: All UI components and pages translated with fallback support
- **Automated Testing**: Translation consistency tests ensure no missing keys

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

- **TypeScript**: Full type safety throughout the application
- **Bun**: Ultra-fast JavaScript runtime and package manager
- **Vite**: Fast build tool with Hot Module Replacement (HMR)
- **Biome**: Lightning-fast linter and formatter (10-100x faster than ESLint/Prettier)
- **TanStack Router**: Type-safe routing with automatic code splitting
- **React Query**: Data fetching and caching
- **Zustand**: Lightweight state management

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
├── hooks/             # Custom React hooks
│   ├── use-auth.ts    # Authentication hook
│   └── use-auth-init.ts # Session initialization
├── stores/            # Zustand state stores
├── lib/               # Utilities and configurations
├── routes/            # TanStack Router route definitions
└── styles/            # Global styles and themes
```

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
- FastAPI backend running (for authentication)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd boilerplate/frontend
```

1. Install dependencies

```bash
bun install
```

1. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
VITE_API_URL=
VITE_APP_NAME="Your App Name"
```

1. Start the development server

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
bun run check:write

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

### Language Configuration

Add new languages by:

1. Creating translation files in `public/locales/[lang]/translation.json`
2. Adding the language to `src/lib/i18n.ts`
3. Updating the language switcher component

## 📦 Tech Stack

**Framework:** [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)

**Build Tool:** [Vite](https://vitejs.dev/) with Hot Module Replacement

**UI Library:** [Shadcn UI](https://ui.shadcn.com) (Tailwind CSS + Radix UI)

**Routing:** [TanStack Router](https://tanstack.com/router/latest) with type-safe routes

**State Management:** [Zustand](https://github.com/pmndrs/zustand) for global state

**Data Fetching:** [TanStack Query](https://tanstack.com/query/latest) with caching

**Authentication:** [Better Auth](https://www.better-auth.com/) integration

**Internationalization:** [React i18next](https://react.i18next.com/) with 9 language locales

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

- **Translation Files**: JSON files in `public/locales/[lang]/translation.json`
- **9 Language Variants**: en-US, en-GB, es-ES, es-MX, fr-FR, fr-CA, de-DE, pt-BR, pt-PT
- **Namespace Organization**: Structured translations (auth, dashboard, admin, common, etc.)
- **Dynamic Loading**: Language files loaded on demand
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
bun run check:write      # Auto-fix linting & formatting issues (recommended for development)
bun run lint             # Run linter only
bun run lint:write       # Run linter with auto-fix
bun run format           # Format all code files
bun run format:check     # Check formatting without modifying files

# Testing
bun test                 # Run all tests (includes i18n consistency tests)

# Utilities
bun run generate-routes  # Generate TanStack Router route tree
bun run knip             # Find unused dependencies and exports
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run `bun run check:write` to ensure code quality
5. Run `bun test` to verify all tests pass
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

**Code Quality Standards:**
- All code must pass `bun run check` (Biome linting + formatting)
- All translation keys must have default fallback text
- New translations must be added to all 9 language files
- Run `bun test` to ensure i18n consistency
