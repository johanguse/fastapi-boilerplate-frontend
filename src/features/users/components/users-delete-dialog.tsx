'use client'

import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { type User } from '../entities/user'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')

  const handleDelete = () => {
    if (value.trim() !== currentRow.username) return

    onOpenChange(false)
    showSubmittedData(
      currentRow,
      t('users.deleteSuccessMessage', 'The following user has been deleted:')
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          {t('users.deleteUser', 'Delete User')}
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            {t(
              'users.deleteConfirmQuestion',
              'Are you sure you want to delete'
            )}{' '}
            <span className='font-bold'>{currentRow.username}</span>?
            <br />
            {t(
              'users.deleteConfirmDescription',
              'This action will permanently remove the user with the role of'
            )}{' '}
            <span className='font-bold'>{currentRow.role.toUpperCase()}</span>{' '}
            {t(
              'users.deleteConfirmWarning',
              'from the system. This cannot be undone.'
            )}
          </p>

          <Label className='my-2'>
            {t('users.usernameLabel', 'Username:')}
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t(
                'users.usernamePlaceholder',
                'Enter username to confirm deletion.'
              )}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>{t('users.warningTitle', 'Warning!')}</AlertTitle>
            <AlertDescription>
              {t(
                'users.warningDescription',
                'Please be careful, this operation can not be rolled back.'
              )}
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={t('common.delete', 'Delete')}
      destructive
    />
  )
}
