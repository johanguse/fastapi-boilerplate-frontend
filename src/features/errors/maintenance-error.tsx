import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function MaintenanceError() {
  const { t } = useTranslation()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='font-bold text-[7rem] leading-tight'>503</h1>
        <span className='font-medium'>
          {t('errors.maintenance.title', 'Website is under maintenance!')}
        </span>
        <p className='text-center text-muted-foreground'>
          {t(
            'errors.maintenance.description',
            'The site is not available at the moment.'
          )}{' '}
          <br />
          {t(
            'errors.maintenance.subDescription',
            "We'll be back online shortly."
          )}
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline'>
            {t('errors.learnMore', 'Learn more')}
          </Button>
        </div>
      </div>
    </div>
  )
}
