import { fireEvent, render, screen } from '@testing-library/react'
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

      const image = screen.getByRole('img', { name: /John Doe/i })
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('handles file selection', () => {
      render(
        <ImageUpload
          type='avatar'
          value={null}
          onChange={mockOnChange}
          name='John Doe'
        />
      )

      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload image/i)

      fireEvent.change(input, { target: { files: [file] } })

      expect(mockOnChange).toHaveBeenCalledWith(file)
    })

    it('validates file type', async () => {
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
      const input = screen.getByLabelText(/upload image/i)

      fireEvent.change(input, { target: { files: [file] } })

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('file type')
      )
      expect(mockOnChange).not.toHaveBeenCalled()
    })

    it('validates file size (5MB limit)', async () => {
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

      const input = screen.getByLabelText(/upload image/i)
      fireEvent.change(input, { target: { files: [largeFile] } })

      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('5MB'))
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

      // Logo fallback should show Building2 icon
      expect(screen.getByTestId('building-icon')).toBeInTheDocument()
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

      const image = screen.getByRole('img', { name: /Test Org/i })
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/logo.png')
    })

    it('handles file selection for logo', () => {
      render(
        <ImageUpload
          type='logo'
          value={null}
          onChange={mockOnChange}
          name='Test Org'
        />
      )

      const file = new File(['logo'], 'logo.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload image/i)

      fireEvent.change(input, { target: { files: [file] } })

      expect(mockOnChange).toHaveBeenCalledWith(file)
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

      const avatar = container.querySelector('.h-8.w-8')
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

      const avatar = container.querySelector('.h-20.w-20')
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

      const avatar = container.querySelector('.h-32.w-32')
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
