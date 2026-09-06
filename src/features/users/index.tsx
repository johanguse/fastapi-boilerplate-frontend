import { getRouteApi } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ConfigDrawer } from '@/components/config-drawer'
import { PageLayout } from '@/components/layout/page-layout'
import { Search } from '@/components/search'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { users } from './data/users'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const { t } = useTranslation()
  const search = route.useSearch()
  const navigate = route.useNavigate()

  return (
    <UsersProvider>
      <PageLayout headerContent={<Search />} headerActions={<ConfigDrawer />}>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='font-bold text-2xl tracking-tight'>
              {t('users.title', 'User List')}
            </h2>
            <p className='text-muted-foreground'>
              {t(
                'users.description',
                'Manage your users and their roles here.'
              )}
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          <UsersTable data={users} search={search} navigate={navigate} />
        </div>
      </PageLayout>

      <UsersDialogs />
    </UsersProvider>
  )
}
