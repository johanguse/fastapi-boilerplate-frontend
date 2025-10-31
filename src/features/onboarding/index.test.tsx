import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Onboarding } from './index'

// Mock stores
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  onboarding_completed: false,
  onboarding_step: 0,
}

vi.mock('@/stores/auth-store', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}))

// Mock router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
  }),
}))

// Mock fetch
global.fetch = vi.fn()

// Mock child components
vi.mock('./components/onboarding-profile', () => ({
  OnboardingProfile: () => (
    <div data-testid='onboarding-profile'>Profile Step</div>
  ),
}))

vi.mock('./components/onboarding-organization', () => ({
  OnboardingOrganization: () => (
    <div data-testid='onboarding-organization'>Organization Step</div>
  ),
}))

vi.mock('./components/onboarding-complete', () => ({
  OnboardingComplete: () => (
    <div data-testid='onboarding-complete'>Complete Step</div>
  ),
}))

describe('Onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders onboarding container', () => {
    render(<Onboarding />)
    expect(screen.getByText(/Welcome to Your Workspace/i)).toBeInTheDocument()
  })

  it('displays progress bar', () => {
    render(<Onboarding />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows profile step for step 0', () => {
    render(<Onboarding />)
    expect(screen.getByTestId('onboarding-profile')).toBeInTheDocument()
  })
})
