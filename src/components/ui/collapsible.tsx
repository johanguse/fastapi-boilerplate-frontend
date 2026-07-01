import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible'
import React from 'react'

function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot='collapsible' {...props} />
}

function CollapsibleTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Trigger> & {
  asChild?: boolean
}) {
  if (asChild && React.isValidElement(children)) {
    return (
      <CollapsiblePrimitive.Trigger
        data-slot='collapsible-trigger'
        render={children as React.ReactElement<Record<string, unknown>>}
        {...props}
      />
    )
  }
  return (
    <CollapsiblePrimitive.Trigger data-slot='collapsible-trigger' {...props}>
      {children}
    </CollapsiblePrimitive.Trigger>
  )
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Panel>) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot='collapsible-content'
      {...props}
    />
  )
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger }
