import { Outlet } from '@tanstack/react-router'
import { Bell, CreditCard, Palette, ReceiptText, UserCog } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Separator } from '@/components/ui/separator'
import { SidebarNav } from './components/sidebar-nav'

export function Settings() {
  const { t } = useTranslation()

  const sidebarNavItems = [
    {
      title: t('settings.nav.profile', 'Profile'),
      href: '/settings',
      icon: <UserCog size={18} />,
    },
    {
      title: t('settings.nav.appearance', 'Appearance'),
      href: '/settings/appearance',
      icon: <Palette size={18} />,
    },
    {
      title: t('settings.nav.notifications', 'Notifications'),
      href: '/settings/notifications',
      icon: <Bell size={18} />,
    },
    {
      title: t('settings.nav.billing', 'Billing'),
      href: '/settings/billing',
      icon: <CreditCard size={18} />,
    },
    {
      title: t('settings.nav.fiscal', 'Tax Info'),
      href: '/settings/fiscal',
      icon: <ReceiptText size={18} />,
    },
  ]

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='font-bold text-2xl tracking-tight md:text-3xl'>
            {t('settings.title', 'Settings')}
          </h1>
          <p className='text-muted-foreground'>
            {t(
              'settings.description',
              'Manage your account settings and set e-mail preferences.'
            )}
          </p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
