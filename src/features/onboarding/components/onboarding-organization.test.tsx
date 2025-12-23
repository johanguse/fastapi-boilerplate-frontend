import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { OnboardingProvider } from '../context/onboarding-context'
import { OnboardingOrganization } from './onboarding-organization'

// Mock API
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({ data: { id: 1, name: 'Test Org' } }),
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

// Mock ImageUpload component
vi.mock('@/components/ui/image-upload', () => ({
  ImageUpload: ({ onChange }: { onChange: (file: File | null) => void }) => (
    <div data-testid='logo-upload'>
      <input
        type='file'
        data-testid='logo-upload-input'
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        accept='image/*'
      />
    </div>
  ),
}))

describe('OnboardingOrganization', () => {
  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders organization form fields', () => {
    render(
      <OnboardingProvider>
        <OnboardingOrganization onComplete={mockOnComplete} />
      </OnboardingProvider>
    )

    expect(screen.getByLabelText(/Organization Name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/URL Slug/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
  })

  it('shows logo upload component', () => {
    render(
      <OnboardingProvider>
        <OnboardingOrganization onComplete={mockOnComplete} />
      </OnboardingProvider>
    )
    expect(screen.getByTestId('logo-upload')).toBeInTheDocument()
  })

  it('shows submit button', () => {
    render(
      <OnboardingProvider>
        <OnboardingOrganization onComplete={mockOnComplete} />
      </OnboardingProvider>
    )
    expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument()
  })

  it('auto-generates slug from organization name', async () => {
    const user = userEvent.setup()
    render(
      <OnboardingProvider>
        <OnboardingOrganization onComplete={mockOnComplete} />
      </OnboardingProvider>
    )

    const nameInput = screen.getByLabelText(/Organization Name/i)
    const slugInput = screen.getByLabelText(/URL Slug/i)

    await user.type(nameInput, 'My Test Organization')

    await waitFor(() => {
      expect(slugInput).toHaveValue('my-test-organization')
    })
  })

  it('validates required organization name', async () => {
    const user = userEvent.setup()
    render(
      <OnboardingProvider>
        <OnboardingOrganization onComplete={mockOnComplete} />
      </OnboardingProvider>
    )

    await user.click(screen.getByRole('button', { name: /Create/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/Organization name must be at least 2 characters/i)
      ).toBeInTheDocument()
    })
  })

  it('handles logo upload', async () => {
    render(
      <OnboardingProvider>
        <OnboardingOrganization onComplete={mockOnComplete} />
      </OnboardingProvider>
    )

    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    const input = screen.getByTestId('logo-upload-input')

    fireEvent.change(input, { target: { files: [file] } })

    expect(input).toBeInTheDocument()
  })

  it('submits form with valid data and uploads logo', async () => {
    const user = userEvent.setup()
    const { api } = await import('@/lib/api')
    const { toast } = await import('sonner')

    render(
      <OnboardingProvider>
        <OnboardingOrganization onComplete={mockOnComplete} />
      </OnboardingProvider>
    )

    // Fill form
    await user.type(screen.getByLabelText(/Organization Name/i), 'Test Corp')
    await user.type(
      screen.getByLabelText(/Description/i),
      'A test organization'
    )

    // Upload logo
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    const logoInput = screen.getByTestId('logo-upload-input')
    fireEvent.change(logoInput, { target: { files: [file] } })

    // Submit
    await user.click(screen.getByRole('button', { name: /Create/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/organizations/',
        expect.objectContaining({
          name: 'Test Corp',
          description: 'A test organization',
        })
      )
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled()
      expect(mockOnComplete).toHaveBeenCalled()
    })
  })

  it('handles 409 conflict error (duplicate organization)', async () => {
    const user = userEvent.setup()
    const { api } = await import('@/lib/api')
    const { toast } = await import('sonner')

    ;(api.post as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: {
        status: 409,
        data: {
          detail: 'Organization already exists',
        },
      },
    })

    render(
      <OnboardingProvider>
        <OnboardingOrganization onComplete={mockOnComplete} />
      </OnboardingProvider>
    )

    await user.type(screen.getByLabelText(/Organization Name/i), 'Existing Org')
    await user.click(screen.getByRole('button', { name: /Create/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('already exists')
      )
      expect(mockOnComplete).not.toHaveBeenCalled()
    })
  })

  it('handles network errors', async () => {
    const user = userEvent.setup()
    const { api } = await import('@/lib/api')
    const { toast } = await import('sonner')

    ;(api.post as ReturnType<typeof vi.fn>).mockRejectedValue({
      code: 'ERR_NETWORK',
    })

    render(
      <OnboardingProvider>
        <OnboardingOrganization onComplete={mockOnComplete} />
      </OnboardingProvider>
    )

    await user.type(screen.getByLabelText(/Organization Name/i), 'Test Org')
    await user.click(screen.getByRole('button', { name: /Create/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Network error')
      )
      expect(mockOnComplete).not.toHaveBeenCalled()
    })
  })
})
