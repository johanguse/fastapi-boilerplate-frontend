import { Building2, Upload, User, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { IMAGE_CONFIG, optimizeImage, validateImage } from '@/lib/image-utils'
import { cn } from '@/lib/utils'

export interface ImageUploadProps {
  /**
   * Current image URL
   */
  value?: string | null
  /**
   * Callback when image changes
   */
  onChange: (file: File | null) => void
  /**
   * Upload type: avatar (circular) or logo (rounded square)
   */
  type?: 'avatar' | 'logo'
  /**
   * Preview size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Disabled state
   */
  disabled?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Name for generating initials (for avatar type)
   */
  name?: string
  /**
   * Enable image optimization
   */
  optimize?: boolean
}

const sizeClasses = {
  sm: 'size-16',
  md: 'size-24',
  lg: 'size-32',
  xl: 'size-40',
}

export function ImageUpload({
  value,
  onChange,
  type = 'avatar',
  size = 'lg',
  disabled,
  className,
  name,
  optimize = true,
}: ImageUploadProps) {
  const { t } = useTranslation()
  const [preview, setPreview] = useState<string | null>(value || null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsProcessing(true)

      try {
        // Validate image
        const validation = validateImage(file)
        if (!validation.valid) {
          toast.error(validation.error.message)
          setIsProcessing(false)
          return
        }

        // Optimize if enabled
        const processedFile = optimize
          ? await optimizeImage(file, 800, 0.85)
          : file

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(processedFile)

        // Call onChange
        onChange(processedFile)
      } catch (_error) {
        toast.error(
          t(
            'common.imageUploadError',
            'Failed to process image. Please try again.'
          )
        )
      } finally {
        setIsProcessing(false)
      }
    },
    [onChange, optimize, t]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()

      if (disabled || isProcessing) return

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [disabled, isProcessing, handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleClick = useCallback(() => {
    if (!disabled && !isProcessing) {
      fileInputRef.current?.click()
    }
  }, [disabled, isProcessing])

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setPreview(null)
      onChange(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onChange]
  )

  const getInitials = (str: string) => {
    if (!str) return '?'
    const parts = str.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase()
  }

  const FallbackIcon = type === 'avatar' ? User : Building2
  const shapeClass = type === 'avatar' ? 'rounded-full' : 'rounded-lg'

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden border-2 border-muted-foreground/25 border-dashed bg-muted/50 transition-colors hover:border-muted-foreground/50 hover:bg-muted/80',
          sizeClasses[size],
          shapeClass,
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && !isProcessing && 'cursor-pointer',
          isProcessing && 'cursor-wait'
        )}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        role='button'
        tabIndex={disabled ? -1 : 0}
        aria-label={t('common.uploadImage', 'Upload image')}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt='Preview'
              className='size-full object-cover'
            />
            {!disabled && !isProcessing && (
              <Button
                size='icon'
                variant='destructive'
                className='absolute top-1 right-1 size-6 rounded-full'
                onClick={handleRemove}
                aria-label={t('common.removeImage', 'Remove image')}
              >
                <X className='size-3' />
              </Button>
            )}
          </>
        ) : (
          <div className='flex flex-col items-center justify-center gap-2 p-4 text-center'>
            {type === 'avatar' && name ? (
              <div
                className={cn(
                  'flex items-center justify-center bg-primary/10 text-primary',
                  sizeClasses[size],
                  shapeClass
                )}
              >
                <span className='font-semibold text-2xl'>
                  {getInitials(name)}
                </span>
              </div>
            ) : (
              <FallbackIcon className='size-1/3 text-muted-foreground' />
            )}
            {!isProcessing && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity hover:opacity-100'>
                <Upload className='size-8 text-white' />
              </div>
            )}
          </div>
        )}

        {isProcessing && (
          <div className='absolute inset-0 flex items-center justify-center bg-background/80'>
            <div className='size-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept={IMAGE_CONFIG.acceptedExtensions.join(',')}
        onChange={handleFileInputChange}
        className='hidden'
        disabled={disabled || isProcessing}
      />

      <p className='text-muted-foreground text-xs'>
        {t(
          'common.imageUploadHint',
          `Accepted: ${IMAGE_CONFIG.acceptedExtensions.join(', ')}. Max size: ${IMAGE_CONFIG.maxSizeInMB}MB.`
        )}
      </p>
    </div>
  )
}
