import { User } from 'lucide-react'
import { useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials, stringToColor } from '@/lib/image-utils'
import { cn } from '@/lib/utils'

export interface UserAvatarProps {
  /**
   * User name for generating initials
   */
  name?: string | null
  /**
   * Image URL
   */
  image?: string | null
  /**
   * Avatar size
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Show online status indicator
   */
  showStatus?: boolean
  /**
   * Status (online, offline, away)
   */
  status?: 'online' | 'offline' | 'away'
}

const sizeClasses = {
  sm: 'size-6 text-xs',
  md: 'size-8 text-sm',
  lg: 'size-10 text-base',
  xl: 'size-12 text-lg',
  '2xl': 'size-16 text-xl',
}

const statusSizeClasses = {
  sm: 'size-1.5',
  md: 'size-2',
  lg: 'size-2.5',
  xl: 'size-3',
  '2xl': 'size-4',
}

const statusColorClasses = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
}

export function UserAvatar({
  name,
  image,
  size = 'md',
  className,
  showStatus,
  status = 'offline',
}: UserAvatarProps) {
  const initials = useMemo(() => getInitials(name || ''), [name])
  const backgroundColor = useMemo(
    () => (name ? stringToColor(name) : 'hsl(var(--muted))'),
    [name]
  )

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={cn(sizeClasses[size])}>
        {image ? <AvatarImage src={image} alt={name || 'User avatar'} /> : null}
        <AvatarFallback
          style={{ backgroundColor }}
          className='font-semibold text-white'
        >
          {initials || <User className='size-1/2' />}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span
          className={cn(
            'absolute right-0 bottom-0 block rounded-full ring-2 ring-background',
            statusSizeClasses[size],
            statusColorClasses[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}
