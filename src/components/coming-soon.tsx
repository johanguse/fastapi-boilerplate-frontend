import { Telescope } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ComingSoon() {
  const { t } = useTranslation()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <Telescope size={72} />
        <h1 className='font-bold text-4xl leading-tight'>{t('comingSoon.title', 'Coming Soon!')}</h1>
        <p className='text-center text-muted-foreground'>
          {t('comingSoon.description', 'This page has not been created yet.')} <br />
          {t('comingSoon.stayTuned', 'Stay tuned though!')}
        </p>
      </div>
    </div>
  )
}
