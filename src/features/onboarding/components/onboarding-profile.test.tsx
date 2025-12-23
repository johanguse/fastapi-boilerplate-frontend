import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OnboardingProvider } from '../context/onboarding-context'
import { OnboardingProfile } from './onboarding-profile'

// Mock fetch for API calls
global.fetch = vi.fn()

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

// Mock ImageUpload component
vi.mock('@/components/ui/image-upload', () => ({
  ImageUpload: ({ onChange }: { onChange: (file: File | null) => void }) => (
    <div data-testid='image-upload'>
      <input
        type='file'
        data-testid='image-upload-input'
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        accept='image/*'
      />
    </div>
  ),
}))

const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  image: null,
  emailVerified: true,
  role: 'member',
  status: 'active',
  onboarding_completed: false,
  onboarding_step: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('OnboardingProfile', () => {
  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)
  })

  it('renders profile form fields', () => {
    render(
      <OnboardingProvider>
        <OnboardingProfile onComplete={mockOnComplete} user={mockUser} />
      </OnboardingProvider>
    )

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Company/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Bio/i)).toBeInTheDocument()
  })

  it('shows image upload component', () => {
    render(
      <OnboardingProvider>
        <OnboardingProfile onComplete={mockOnComplete} user={mockUser} />
      </OnboardingProvider>
    )
    expect(screen.getByTestId('image-upload')).toBeInTheDocument()
  })

  it('shows submit button', () => {
    render(
      <OnboardingProvider>
        <OnboardingProfile onComplete={mockOnComplete} user={mockUser} />
      </OnboardingProvider>
    )
    expect(
      screen.getByRole('button', { name: /Continue/i })
    ).toBeInTheDocument()
  })

  it('pre-populates form with user data if available', () => {
    const userWithData = {
      ...mockUser,
      name: 'John Doe',
      company: 'Test Company',
      job_title: 'Developer',
    }

    render(
      <OnboardingProvider>
        <OnboardingProfile onComplete={mockOnComplete} user={userWithData} />
      </OnboardingProvider>
    )

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Developer')).toBeInTheDocument()
  })

  it('validates required name field', async () => {
    const user = userEvent.setup()
    render(
      <OnboardingProvider>
        <OnboardingProfile onComplete={mockOnComplete} user={mockUser} />
      </OnboardingProvider>
    )

    const nameInput = screen.getByLabelText(/Full Name/i)
    await user.clear(nameInput)
    await user.click(screen.getByRole('button', { name: /Continue/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/Name must be at least 2 characters/i)
      ).toBeInTheDocument()
    })
  })

  it('handles profile image upload', async () => {
    render(
      <OnboardingProvider>
        <OnboardingProfile onComplete={mockOnComplete} user={mockUser} />
      </OnboardingProvider>
    )

    const file = new File(['image'], 'avatar.png', { type: 'image/png' })
    const input = screen.getByTestId('image-upload-input')

    fireEvent.change(input, { target: { files: [file] } })

    expect(input).toBeInTheDocument()
  })

  it('submits form with valid data and uploads image', async () => {
    const user = userEvent.setup()
    const { toast } = await import('sonner')

    render(
      <OnboardingProvider>
        <OnboardingProfile onComplete={mockOnComplete} user={mockUser} />
      </OnboardingProvider>
    )

    // Fill form
    await user.type(screen.getByLabelText(/Full Name/i), 'John Doe')
    await user.type(screen.getByLabelText(/Company/i), 'Test Corp')

    // Upload image
    const file = new File(['image'], 'avatar.png', { type: 'image/png' })
    const imageInput = screen.getByTestId('image-upload-input')
    fireEvent.change(imageInput, { target: { files: [file] } })

    // Submit
    await user.click(screen.getByRole('button', { name: /Continue/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/users/me/upload-image'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      )
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled()
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    const { toast } = await import('sonner')

    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    render(
      <OnboardingProvider>
        <OnboardingProfile onComplete={mockOnComplete} user={mockUser} />
      </OnboardingProvider>
    )

    await user.type(screen.getByLabelText(/Full Name/i), 'John Doe')
    await user.click(screen.getByRole('button', { name: /Continue/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
      expect(mockOnComplete).not.toHaveBeenCalled()
    })
  })
})
