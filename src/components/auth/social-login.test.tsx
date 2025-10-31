import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SocialLogin } from './social-login'

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  signIn: {
    social: vi.fn(),
  },
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

describe('SocialLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders social login component with all enabled providers', () => {
    render(<SocialLogin />)

    // Check that provider buttons are rendered - using role instead of text
    expect(screen.getAllByRole('button')).toHaveLength(4) // Google, GitHub, Microsoft, Apple
  })

  it('renders divider text', () => {
    render(<SocialLogin />)
    expect(screen.getByText(/or continue with/i)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<SocialLogin className='custom-class' />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders with custom redirect URL', () => {
    render(<SocialLogin redirectTo='/custom-path' />)
    expect(screen.getByTestId('social-login-container')).toBeInTheDocument()
  })
})
