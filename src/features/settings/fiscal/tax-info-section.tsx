/**
 * Tax Info Section
 *
 * Loads existing tax information and renders the reusable TaxInfoForm.
 * Used inside the Settings > Tax Information page.
 */

import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { TaxInfoForm } from '@/features/fiscal/components/TaxInfoForm'
import { useTaxInfo } from '@/features/fiscal/hooks/useTaxInfo'

export function TaxInfoSection() {
  const { t } = useTranslation()
  const { taxInfo, isLoading, error } = useTaxInfo()

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
        <span className='ml-2 text-muted-foreground text-sm'>
          {t('fiscal.settings.loading', 'Loading tax information...')}
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <p className='py-4 text-center text-destructive text-sm'>
        {t(
          'fiscal.settings.loadError',
          'Failed to load tax information. Please try again.'
        )}
      </p>
    )
  }

  return (
    <TaxInfoForm
      initialData={taxInfo}
      submitLabel={
        taxInfo
          ? t('fiscal.form.update', 'Update')
          : t('fiscal.form.save', 'Save')
      }
    />
  )
}
