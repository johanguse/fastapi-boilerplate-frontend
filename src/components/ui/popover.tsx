import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import * as React from 'react'
import { cn } from '@/lib/utils'

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot='popover' {...props} />
}

function PopoverTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger> & {
  asChild?: boolean
}) {
  if (asChild && React.isValidElement(children)) {
    return (
      <PopoverPrimitive.Trigger
        data-slot='popover-trigger'
        render={children as React.ReactElement<Record<string, unknown>>}
        {...props}
      />
    )
  }
  return (
    <PopoverPrimitive.Trigger data-slot='popover-trigger' {...props}>
      {children}
    </PopoverPrimitive.Trigger>
  )
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  side,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> & {
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
  side?: 'top' | 'right' | 'bottom' | 'left'
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <PopoverPrimitive.Popup
          data-slot='popover-content'
          className={cn(
            'data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[closed]:animate-out data-[open]:animate-in',
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverContent, PopoverTrigger }
