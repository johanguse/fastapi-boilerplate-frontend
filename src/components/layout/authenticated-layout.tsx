import { Outlet } from '@tanstack/react-router'
import { EmailVerificationBanner } from '@/components/email-verification-banner'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { NavPlanCard } from '@/components/nav-plan-card'
import { NavSecondary } from '@/components/nav-secondary'
import { SkipToMain } from '@/components/skip-to-main'
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from '@/components/ui/sidebar'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth-store'
import { useSidebarData } from './hooks/use-sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'

type AuthenticatedLayoutProps = {
  readonly children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const sidebarData = useSidebarData()
  // Initialize auth data loading
  const { user } = useAuth()

  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <LayoutProvider>
          <SkipToMain />
          <AppSidebar>
            <SidebarHeader>
              <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
              {sidebarData.navGroups.map((props) => (
                <NavGroup key={props.title} {...props} />
              ))}
              {sidebarData.secondaryNav && (
                <NavSecondary
                  items={sidebarData.secondaryNav}
                  className='mt-auto'
                />
              )}
              <NavPlanCard />
            </SidebarContent>
            <SidebarFooter>
              <NavUser />
            </SidebarFooter>
            <SidebarRail />
          </AppSidebar>
          <SidebarInset
            className={cn(
              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-[[data-layout=fixed]]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - 1rem (total margins) to prevent overflow
              // 'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-1rem)]',
              'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]',

              // Set content container, so we can use container queries
              '@container/content'
            )}
          >
            {user && !user.is_verified && (
              <div className='px-4 pt-4'>
                <EmailVerificationBanner />
              </div>
            )}
            {children ?? <Outlet />}
          </SidebarInset>
        </LayoutProvider>
      </SidebarProvider>
    </SearchProvider>
  )
}
