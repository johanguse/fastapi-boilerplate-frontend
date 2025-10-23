'use client'

import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sleep } from '@/lib/utils'

type UserMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export function UsersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: UserMultiDeleteDialogProps<TData>) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')

  const CONFIRM_WORD = t('users.delete.confirmWord', 'DELETE')

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(
        t(
          'users.delete.confirmPrompt',
          `Please type "${CONFIRM_WORD}" to confirm.`
        )
      )
      return
    }

    onOpenChange(false)

    toast.promise(sleep(2000), {
      loading: t('users.delete.deleting', 'Deleting users...'),
      success: () => {
        table.resetRowSelection()
        return t(
          'users.delete.success',
          'Deleted {{count}} {{count, plural, one {user} other {users}}}',
          { count: selectedRows.length }
        )
      },
      error: t('common.error', 'Error'),
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          {t(
            'users.delete.title',
            'Delete {{count}} {{count, plural, one {user} other {users}}}',
            { count: selectedRows.length }
          )}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            {t(
              'users.delete.description',
              'Are you sure you want to delete the selected users?'
            )}{' '}
            <br />
            {t(
              'users.delete.warningDescription',
              'This action cannot be undone.'
            )}
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span className=''>
              {t(
                'users.delete.confirmLabel',
                'Confirm by typing "{{confirmWord}}":',
                { confirmWord: CONFIRM_WORD }
              )}
            </span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t(
                'users.delete.confirmPlaceholder',
                'Type "{{confirmWord}}" to confirm.',
                { confirmWord: CONFIRM_WORD }
              )}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>
              {t('users.delete.warningTitle', 'Warning!')}
            </AlertTitle>
            <AlertDescription>
              {t(
                'users.delete.warningDescription',
                'Please be careful, this operation can not be rolled back.'
              )}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('users.delete.confirmButton', 'Delete')}
      destructive
    />
  )
}
