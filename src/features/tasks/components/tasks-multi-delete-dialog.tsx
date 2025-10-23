'use client'

import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sleep } from '@/lib/utils'

type TaskMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

export function TasksMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: TaskMultiDeleteDialogProps<TData>) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')

  const CONFIRM_WORD = t('tasks.delete.confirmWord', 'DELETE')

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(
        t(
          'tasks.delete.confirmPrompt',
          'Please type "{{confirmWord}}" to confirm.',
          { confirmWord: CONFIRM_WORD }
        )
      )
      return
    }

    onOpenChange(false)

    toast.promise(sleep(2000), {
      loading: t('tasks.delete.deleting', 'Deleting tasks...'),
      success: () => {
        table.resetRowSelection()
        return t(
          'tasks.delete.success',
          'Deleted {{count}} {{count, plural, one {task} other {tasks}}}',
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
            'tasks.delete.title',
            'Delete {{count}} {{count, plural, one {task} other {tasks}}}',
            { count: selectedRows.length }
          )}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            {t(
              'tasks.delete.description',
              'Are you sure you want to delete the selected tasks?\nThis action cannot be undone.'
            )}
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span className=''>
              {t(
                'tasks.delete.confirmLabel',
                'Confirm by typing "{{confirmWord}}":',
                { confirmWord: CONFIRM_WORD }
              )}
            </span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t(
                'tasks.delete.confirmPlaceholder',
                'Type "{{confirmWord}}" to confirm.',
                { confirmWord: CONFIRM_WORD }
              )}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>
              {t('tasks.delete.warningTitle', 'Warning!')}
            </AlertTitle>
            <AlertDescription>
              {t(
                'tasks.delete.warningDescription',
                'Please be careful, this operation can not be rolled back.'
              )}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('tasks.delete.confirmButton', 'Delete')}
      destructive
    />
  )
}
