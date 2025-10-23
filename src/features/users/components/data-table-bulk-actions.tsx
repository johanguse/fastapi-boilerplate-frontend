import { type Table } from '@tanstack/react-table'
import { Mail, Trash2, UserCheck, UserX } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { sleep } from '@/lib/utils'
import { type User } from '../data/schema'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const { t } = useTranslation()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    toast.promise(sleep(2000), {
      loading: t(`users.bulkActions.${status === 'active' ? 'activating' : 'deactivating'}Users`, `${status === 'active' ? 'Activating' : 'Deactivating'} users...`),
      success: () => {
        table.resetRowSelection()
        return t(`users.bulkActions.${status === 'active' ? 'activated' : 'deactivated'}Users`, `${status === 'active' ? 'Activated' : 'Deactivated'} {{count}} {{count, plural, one {user} other {users}}}`, { count: selectedUsers.length })
      },
      error: t(`users.bulkActions.error${status === 'active' ? 'Activating' : 'Deactivating'}Users`, `Error ${status === 'active' ? 'activating' : 'deactivating'} users`),
    })
    table.resetRowSelection()
  }

  const handleBulkInvite = () => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    toast.promise(sleep(2000), {
      loading: t('users.bulkActions.invitingUsers', 'Inviting users...'),
      success: () => {
        table.resetRowSelection()
        return t('users.bulkActions.invitedUsers', 'Invited {{count}} {{count, plural, one {user} other {users}}}', { count: selectedUsers.length })
      },
      error: t('users.bulkActions.errorInvitingUsers', 'Error inviting users'),
    })
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='user'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkInvite}
              className='size-8'
              aria-label={t('users.bulkActions.inviteSelectedUsers', 'Invite selected users')}
              title={t('users.bulkActions.inviteSelectedUsers', 'Invite selected users')}
            >
              <Mail />
              <span className='sr-only'>{t('users.bulkActions.inviteSelectedUsers', 'Invite selected users')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('users.bulkActions.inviteSelectedUsers', 'Invite selected users')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('active')}
              className='size-8'
              aria-label={t('users.bulkActions.activateSelectedUsers', 'Activate selected users')}
              title={t('users.bulkActions.activateSelectedUsers', 'Activate selected users')}
            >
              <UserCheck />
              <span className='sr-only'>{t('users.bulkActions.activateSelectedUsers', 'Activate selected users')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('users.bulkActions.activateSelectedUsers', 'Activate selected users')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('inactive')}
              className='size-8'
              aria-label={t('users.bulkActions.deactivateSelectedUsers', 'Deactivate selected users')}
              title={t('users.bulkActions.deactivateSelectedUsers', 'Deactivate selected users')}
            >
              <UserX />
              <span className='sr-only'>{t('users.bulkActions.deactivateSelectedUsers', 'Deactivate selected users')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('users.bulkActions.deactivateSelectedUsers', 'Deactivate selected users')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label={t('users.bulkActions.deleteSelectedUsers', 'Delete selected users')}
              title={t('users.bulkActions.deleteSelectedUsers', 'Delete selected users')}
            >
              <Trash2 />
              <span className='sr-only'>{t('users.bulkActions.deleteSelectedUsers', 'Delete selected users')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('users.bulkActions.deleteSelectedUsers', 'Delete selected users')}</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
