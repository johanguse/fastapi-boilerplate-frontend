/**
 * Image utility functions for upload, validation, and optimization
 */

export const IMAGE_CONFIG = {
  maxSizeInMB: 5,
  maxSizeInBytes: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  acceptedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
} as const

export interface ImageValidationError {
  type: 'size' | 'format' | 'general'
  message: string
}

/**
 * Validate image file
 */
export function validateImage(
  file: File
): { valid: true } | { valid: false; error: ImageValidationError } {
  // Check file type
  if (
    !IMAGE_CONFIG.acceptedTypes.includes(
      file.type as (typeof IMAGE_CONFIG.acceptedTypes)[number]
    )
  ) {
    return {
      valid: false,
      error: {
        type: 'format',
        message: `Invalid file format. Please upload ${IMAGE_CONFIG.acceptedExtensions.join(', ')} files only.`,
      },
    }
  }

  // Check file size
  if (file.size > IMAGE_CONFIG.maxSizeInBytes) {
    return {
      valid: false,
      error: {
        type: 'size',
        message: `File size must be less than ${IMAGE_CONFIG.maxSizeInMB}MB.`,
      },
    }
  }

  return { valid: true }
}

/**
 * Compress and optimize image
 */
export async function optimizeImage(
  file: File,
  maxWidth = 800,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'))
              return
            }

            const optimizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })

            resolve(optimizedFile)
          },
          file.type,
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Convert file to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  if (!name) return '?'

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }

  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Generate a color from string (for avatar backgrounds)
 */
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = hash % 360
  return `hsl(${hue}, 65%, 50%)`
}
