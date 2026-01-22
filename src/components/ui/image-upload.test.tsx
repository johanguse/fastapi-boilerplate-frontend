import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ImageUpload } from './image-upload'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue ?? key,
  }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

// Mock image-utils
vi.mock('@/lib/image-utils', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/image-utils')>(
      '@/lib/image-utils'
    )
  return {
    ...actual,
    validateImage: vi.fn((file: File) => {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        return {
          valid: false,
          error: {
            type: 'format',
            message: 'Invalid file type',
          },
        }
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return {
          valid: false,
          error: {
            type: 'size',
            message: 'File size must be less than 5MB',
          },
        }
      }
      return { valid: true }
    }),
    optimizeImage: vi.fn((file: File) => Promise.resolve(file)),
  }
})

describe('ImageUpload', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Avatar type', () => {
    it('renders avatar upload with initials fallback', () => {
      render(
        <ImageUpload
          type='avatar'
          value={null}
          onChange={mockOnChange}
          name='John Doe'
        />
      )

      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('displays image when value is provided', () => {
      render(
        <ImageUpload
          type='avatar'
          value='https://example.com/avatar.jpg'
          onChange={mockOnChange}
          name='John Doe'
        />
      )

      const image = screen.getByRole('img', { name: /Preview/i })
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it.skip('handles file selection', async () => {
      render(
        <ImageUpload
          type='avatar'
          value={null}
          onChange={mockOnChange}
          name='John Doe'
          optimize={false}
        />
      )

      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } })
        // Wait for FileReader mock to process
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      await waitFor(
        () => {
          expect(mockOnChange).toHaveBeenCalledWith(file)
        },
        { timeout: 2000 }
      )
    })

    it.skip('validates file type', async () => {
      const { toast } = await import('sonner')
      render(
        <ImageUpload
          type='avatar'
          value={null}
          onChange={mockOnChange}
          name='John Doe'
        />
      )

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } })
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      await waitFor(
        () => {
          expect(toast.error).toHaveBeenCalled()
        },
        { timeout: 2000 }
      )
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it.skip('validates file size (5MB limit)', async () => {
      const { toast } = await import('sonner')
      render(
        <ImageUpload
          type='avatar'
          value={null}
          onChange={mockOnChange}
          name='John Doe'
        />
      )

      // Create a file larger than 5MB
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', {
        type: 'image/png',
      })

      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement

      await act(async () => {
        fireEvent.change(input, { target: { files: [largeFile] } })
        await new Promise((resolve) => setTimeout(resolve, 10))
      })

      await waitFor(
        () => {
          expect(toast.error).toHaveBeenCalled()
        },
        { timeout: 2000 }
      )
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  describe('Logo type', () => {
    it('renders logo upload with icon fallback', () => {
      render(
        <ImageUpload
          type='logo'
          value={null}
          onChange={mockOnChange}
          name='Test Org'
        />
      )

      // Logo fallback should show Building2 icon - check for SVG element
      const uploadButton = screen.getByRole('button', { name: /upload image/i })
      expect(uploadButton).toBeInTheDocument()
      // The Building2 icon is rendered but without explicit test-id, just verify the button renders
    })

    it('displays logo image when value is provided', () => {
      render(
        <ImageUpload
          type='logo'
          value='https://example.com/logo.png'
          onChange={mockOnChange}
          name='Test Org'
        />
      )

      const image = screen.getByRole('img', { name: /Preview/i })
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/logo.png')
    })

    it.skip('handles file selection for logo', async () => {
      render(
        <ImageUpload
          type='logo'
          value={null}
          onChange={mockOnChange}
          name='Test Org'
          optimize={false}
        />
      )

      const file = new File(['logo'], 'logo.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload image/i) as HTMLInputElement

      await act(async () => {
        fireEvent.change(input, { target: { files: [file] } })
        // Wait for FileReader mock to process
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      await waitFor(
        () => {
          expect(mockOnChange).toHaveBeenCalledWith(file)
        },
        { timeout: 2000 }
      )
    })
  })

  describe('Different sizes', () => {
    it('renders small size', () => {
      const { container } = render(
        <ImageUpload
          type='avatar'
          value={null}
          onChange={mockOnChange}
          name='John'
          size='sm'
        />
      )

      const avatar = container.querySelector('.size-16')
      expect(avatar).toBeInTheDocument()
    })

    it('renders large size', () => {
      const { container } = render(
        <ImageUpload
          type='avatar'
          value={null}
          onChange={mockOnChange}
          name='John'
          size='lg'
        />
      )

      const avatar = container.querySelector('.size-32')
      expect(avatar).toBeInTheDocument()
    })

    it('renders extra large size', () => {
      const { container } = render(
        <ImageUpload
          type='avatar'
          value={null}
          onChange={mockOnChange}
          name='John'
          size='xl'
        />
      )

      const avatar = container.querySelector('.size-40')
      expect(avatar).toBeInTheDocument()
    })
  })

  describe('File removal', () => {
    it('clears selection when no file is chosen', () => {
      render(
        <ImageUpload
          type='avatar'
          value={null}
          onChange={mockOnChange}
          name='John Doe'
        />
      )

      const input = screen.getByLabelText(/upload image/i)
      fireEvent.change(input, { target: { files: null } })

      // Should not call onChange when files is null
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })
})
