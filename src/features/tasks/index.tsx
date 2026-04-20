import { useTranslation } from 'react-i18next'
import { ConfigDrawer } from '@/components/config-drawer'
import { PageLayout } from '@/components/layout/page-layout'
import { Search } from '@/components/search'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'
import { tasks } from './data/tasks'

export function Tasks() {
  const { t } = useTranslation()

  return (
    <TasksProvider>
      <>
        <PageLayout headerContent={<Search />} headerActions={<ConfigDrawer />}>
          <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 space-y-2'>
            <div>
              <h2 className='font-bold text-2xl tracking-tight'>
                {t('tasks.title', 'Tasks')}
              </h2>
              <p className='text-muted-foreground'>
                {t(
                  'tasks.description',
                  "Here's a list of your tasks for this month!"
                )}
              </p>
            </div>
            <TasksPrimaryButtons />
          </div>
          <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
            <TasksTable data={tasks} />
          </div>
        </PageLayout>

        <TasksDialogs />
      </>
    </TasksProvider>
  )
}
