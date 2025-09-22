import { useNavigate, useLocation } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/stores/auth-store'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({
  open,
  onOpenChange,
}: Readonly<SignOutDialogProps>) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { logout } = useAuth()

  const handleSignOut = async () => {
    try {
      await logout()
      // Preserve current location for redirect after sign-in
      const currentPath = location.href
      navigate({
        to: '/sign-in',
        search: { redirect: currentPath },
        replace: true,
      })
    } catch (_error) {
      // Even if logout fails on server, redirect to sign-in
      navigate({ to: '/sign-in', replace: true })
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('auth.signOutTitle')}
      desc={t('auth.signOutDescription')}
      confirmText={t('auth.signOutConfirm')}
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
