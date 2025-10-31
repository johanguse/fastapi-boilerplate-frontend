import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UserAuthForm } from './user-auth-form'

// Mock dependencies
// Create a mock function that can be controlled
const mockLogin = vi.fn().mockResolvedValue({
  id: '1',
  email: 'test@example.com',
  onboarding_completed: true,
})

vi.mock('@/stores/auth-store', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}))

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}))

vi.mock('@tanstack/react-query', () => ({
  useMutation: ({
    mutationFn,
    onSuccess,
    onError,
  }: {
    mutationFn: (data: unknown) => Promise<unknown>
    onSuccess?: (result: unknown) => void
    onError?: (error: unknown) => void
  }) => {
    const mutate = async (data: unknown) => {
      try {
        const result = await mutationFn(data)
        onSuccess?.(result)
        return result
      } catch (error) {
        onError?.(error)
        throw error
      }
    }

    return {
      mutate,
      isPending: false,
      data: null,
      error: null,
    }
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
  }),
  initReactI18next: {
    type: 'languageDetector',
  },
}))

// Mock i18n module
vi.mock('@/lib/i18n', () => ({
  default: {
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
    use: vi.fn().mockReturnThis(),
    init: vi.fn(),
  },
}))

vi.mock('@/components/auth/social-login', () => ({
  SocialLogin: () => <div data-testid='social-login'>Social Login</div>,
}))

describe('UserAuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the sign-in form with email and password fields', () => {
    render(<UserAuthForm />)

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByText(/Sign In/i)).toBeInTheDocument()
  })

  it('renders the forgot password link', () => {
    render(<UserAuthForm />)
    const forgotLink = screen.getByText(/Forgot password/i)
    expect(forgotLink).toBeInTheDocument()
    expect(forgotLink.closest('a')).toHaveAttribute('href', '/forgot-password')
  })

  it('renders the SocialLogin component', () => {
    render(<UserAuthForm />)
    expect(screen.getByTestId('social-login')).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<UserAuthForm />)

    const emailInput = screen.getByLabelText(/Email/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const submitButton = screen.getByRole('button', { name: /Sign In/i })

    // Enter invalid email and try to submit
    await user.type(emailInput, 'invalid-email')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Wait for validation message
    await waitFor(() => {
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument()
    })
  })

  it('validates password minimum length', async () => {
    const user = userEvent.setup()
    render(<UserAuthForm />)

    const emailInput = screen.getByLabelText(/Email/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const submitButton = screen.getByRole('button', { name: /Sign In/i })

    // Enter valid email but too short password
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, '123')
    await user.click(submitButton)

    // Wait for validation message
    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 6 characters/i)
      ).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup()

    // Reset mock
    mockLogin.mockClear()
    mockLogin.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
      onboarding_completed: true,
    })

    render(<UserAuthForm />)

    const emailInput = screen.getByLabelText(/Email/i)
    const passwordInput = screen.getByLabelText(/Password/i)
    const submitButton = screen.getByRole('button', { name: /Sign In/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Wait for login to be called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('displays form elements correctly', () => {
    render(<UserAuthForm />)

    // This test just verifies the form renders
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  it('handles custom redirectTo prop', () => {
    render(<UserAuthForm redirectTo='/custom-path' />)
    expect(screen.getByTestId('social-login')).toBeInTheDocument()
  })
})
