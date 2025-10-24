import { useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function ForbiddenError() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='font-bold text-[7rem] leading-tight'>403</h1>
        <span className='font-medium'>
          {t('errors.forbidden.title', 'Access Forbidden')}
        </span>
        <p className='text-center text-muted-foreground'>
          {t(
            'errors.forbidden.description',
            "You don't have necessary permission"
          )}{' '}
          <br />
          {t('errors.forbidden.subDescription', 'to view this resource.')}
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            {t('errors.goBack', 'Go Back')}
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>
            {t('errors.backToHome', 'Back to Home')}
          </Button>
        </div>
      </div>
    </div>
  )
}
