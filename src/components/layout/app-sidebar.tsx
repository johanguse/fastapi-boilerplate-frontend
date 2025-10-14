import { Sidebar } from '@/components/ui/sidebar'
import { useLayout } from '@/context/layout-provider'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { collapsible, variant } = useLayout()
  return <Sidebar {...props} collapsible={collapsible} variant={variant} />
}
