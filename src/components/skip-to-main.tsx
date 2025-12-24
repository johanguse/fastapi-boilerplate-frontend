import { useTranslation } from 'react-i18next'

export function SkipToMain() {
  const { t } = useTranslation()

  return (
    <a
      className={`fixed start-44 z-999 -translate-y-52 whitespace-nowrap bg-primary px-4 py-2 font-medium text-primary-foreground text-sm opacity-95 shadow-sm transition hover:bg-primary/90 focus:translate-y-3 focus:transform focus-visible:ring-1 focus-visible:ring-ring`}
      href='#content'
    >
      {t('accessibility.skipToMain', 'Skip to Main')}
    </a>
  )
}
