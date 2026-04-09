import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'
import { Header } from './header'
import { Main } from './main'

type PageLayoutProps = {
  /** Page title shown in the header bar */
  title?: string
  /** Content placed between the title and right-side controls (e.g. search, tabs) */
  headerContent?: React.ReactNode
  /** Action buttons placed to the left of theme/profile controls */
  headerActions?: React.ReactNode
  /** Extra classes on the header element (e.g. border-b) */
  headerClassName?: string
  /** Sticky header with scroll shadow */
  fixed?: boolean
  /** Fluid width (no max-width constraint) */
  fluid?: boolean
  /** Fixed-height layout (for app-like views with internal scroll) */
  fixedMain?: boolean
  className?: string
  children: React.ReactNode
}

export function PageLayout({
  title,
  headerContent,
  headerActions,
  headerClassName,
  fixed = true,
  fluid,
  fixedMain,
  className,
  children,
}: PageLayoutProps) {
  return (
    <>
      <Header fixed={fixed} className={headerClassName}>
        {title && (
          <h1 className='font-semibold text-lg leading-none tracking-tight'>
            {title}
          </h1>
        )}
        {headerContent}
        <div className='ms-auto flex items-center gap-2'>
          {headerActions}
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main fixed={fixedMain} fluid={fluid} className={cn(className)}>
        {children}
      </Main>
    </>
  )
}
