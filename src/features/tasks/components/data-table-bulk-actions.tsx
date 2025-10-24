import { type Table } from '@tanstack/react-table'
import { ArrowUpDown, CircleArrowUp, Download, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { sleep } from '@/lib/utils'
import { priorities, statuses } from '../data/data'
import { type Task } from '../data/schema'
import { TasksMultiDeleteDialog } from './tasks-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const { t } = useTranslation()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: string) => {
    const selectedTasks = selectedRows.map((row) => row.original as Task)
    toast.promise(sleep(2000), {
      loading: t('tasks.bulkActions.updatingStatus', 'Updating status...'),
      success: () => {
        table.resetRowSelection()
        return t(
          'tasks.bulkActions.statusUpdated',
          'Status updated to "{{status}}" for {{count}} {{count, plural, one {task} other {tasks}}}.',
          { status, count: selectedTasks.length }
        )
      },
      error: t('common.error', 'Error'),
    })
    table.resetRowSelection()
  }

  const handleBulkPriorityChange = (priority: string) => {
    const selectedTasks = selectedRows.map((row) => row.original as Task)
    toast.promise(sleep(2000), {
      loading: t('tasks.bulkActions.updatingPriority', 'Updating priority...'),
      success: () => {
        table.resetRowSelection()
        return t(
          'tasks.bulkActions.priorityUpdated',
          'Priority updated to "{{priority}}" for {{count}} {{count, plural, one {task} other {tasks}}}.',
          { priority, count: selectedTasks.length }
        )
      },
      error: t('common.error', 'Error'),
    })
    table.resetRowSelection()
  }

  const handleBulkExport = () => {
    const selectedTasks = selectedRows.map((row) => row.original as Task)
    toast.promise(sleep(2000), {
      loading: t('tasks.bulkActions.exportingTasks', 'Exporting tasks...'),
      success: () => {
        table.resetRowSelection()
        return t(
          'tasks.bulkActions.exportedTasks',
          'Exported {{count}} {{count, plural, one {task} other {tasks}}} to CSV.',
          { count: selectedTasks.length }
        )
      },
      error: t('common.error', 'Error'),
    })
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='task'>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label={t(
                    'tasks.bulkActions.updateStatus',
                    'Update status'
                  )}
                  title={t('tasks.bulkActions.updateStatus', 'Update status')}
                >
                  <CircleArrowUp />
                  <span className='sr-only'>
                    {t('tasks.bulkActions.updateStatus', 'Update status')}
                  </span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('tasks.bulkActions.updateStatus', 'Update status')}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {statuses.map((status) => (
              <DropdownMenuItem
                key={status.value}
                defaultValue={status.value}
                onClick={() => handleBulkStatusChange(status.value)}
              >
                {status.icon && (
                  <status.icon className='size-4 text-muted-foreground' />
                )}
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label={t(
                    'tasks.bulkActions.updatePriority',
                    'Update priority'
                  )}
                  title={t(
                    'tasks.bulkActions.updatePriority',
                    'Update priority'
                  )}
                >
                  <ArrowUpDown />
                  <span className='sr-only'>
                    {t('tasks.bulkActions.updatePriority', 'Update priority')}
                  </span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('tasks.bulkActions.updatePriority', 'Update priority')}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {priorities.map((priority) => (
              <DropdownMenuItem
                key={priority.value}
                defaultValue={priority.value}
                onClick={() => handleBulkPriorityChange(priority.value)}
              >
                {priority.icon && (
                  <priority.icon className='size-4 text-muted-foreground' />
                )}
                {priority.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkExport()}
              className='size-8'
              aria-label={t('tasks.bulkActions.exportTasks', 'Export tasks')}
              title={t('tasks.bulkActions.exportTasks', 'Export tasks')}
            >
              <Download />
              <span className='sr-only'>
                {t('tasks.bulkActions.exportTasks', 'Export tasks')}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('tasks.bulkActions.exportTasks', 'Export tasks')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label={t(
                'tasks.bulkActions.deleteSelectedTasks',
                'Delete selected tasks'
              )}
              title={t(
                'tasks.bulkActions.deleteSelectedTasks',
                'Delete selected tasks'
              )}
            >
              <Trash2 />
              <span className='sr-only'>
                {t(
                  'tasks.bulkActions.deleteSelectedTasks',
                  'Delete selected tasks'
                )}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {t(
                'tasks.bulkActions.deleteSelectedTasks',
                'Delete selected tasks'
              )}
            </p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <TasksMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}
