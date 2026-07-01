import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { CheckIcon } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

function Checkbox({
  className,
  checked,
  ...props
}: Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, 'checked'> & {
  checked?: boolean | 'indeterminate'
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        'peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs outline-none transition-shadow focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground dark:bg-input/30 dark:data-[checked]:bg-primary dark:aria-invalid:ring-destructive/40',
        className
      )}
      checked={typeof checked === 'boolean' ? checked : undefined}
      indeterminate={checked === 'indeterminate' || undefined}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot='checkbox-indicator'
        className='flex items-center justify-center text-current transition-none'
      >
        <CheckIcon className='size-3.5' />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
