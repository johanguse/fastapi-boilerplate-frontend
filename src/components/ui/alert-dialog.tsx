import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import * as React from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot='alert-dialog' {...props} />
}

function AlertDialogTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger> & {
  asChild?: boolean
}) {
  if (asChild && React.isValidElement(children)) {
    return (
      <AlertDialogPrimitive.Trigger
        data-slot='alert-dialog-trigger'
        render={children as React.ReactElement<Record<string, unknown>>}
        {...props}
      />
    )
  }
  return (
    <AlertDialogPrimitive.Trigger
      data-slot='alert-dialog-trigger'
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Trigger>
  )
}

function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return (
    <AlertDialogPrimitive.Portal data-slot='alert-dialog-portal' {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Backdrop>) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot='alert-dialog-overlay'
      className={cn(
        'data-[closed]:fade-out-0 data-[open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[closed]:animate-out data-[open]:animate-in',
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Popup>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Popup
        data-slot='alert-dialog-content'
        className={cn(
          'data-[closed]:fade-out-0 data-[open]:fade-in-0 data-[closed]:zoom-out-95 data-[open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[closed]:animate-out data-[open]:animate-in sm:max-w-lg',
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-dialog-header'
      className={cn('flex flex-col gap-2 text-center sm:text-start', className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-dialog-footer'
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot='alert-dialog-title'
      className={cn('font-semibold text-lg', className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description> & {
  asChild?: boolean
}) {
  if (asChild && React.isValidElement(children)) {
    return (
      <AlertDialogPrimitive.Description
        data-slot='alert-dialog-description'
        className={cn('text-muted-foreground text-sm', className)}
        render={children as React.ReactElement<Record<string, unknown>>}
        {...props}
      />
    )
  }
  return (
    <AlertDialogPrimitive.Description
      data-slot='alert-dialog-description'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Description>
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
