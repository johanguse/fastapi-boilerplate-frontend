/**
 * Tax Information Settings Page
 *
 * Settings section where users view/edit their tax information.
 * Reuses the shared TaxInfoForm component.
 */

import { useTranslation } from 'react-i18next'
import { Separator } from '@/components/ui/separator'
import { ContentSection } from '../components/content-section'
import { BillingHistorySection } from './billing-history-section'
import { TaxInfoSection } from './tax-info-section'

export default function SettingsFiscal() {
  const { t } = useTranslation()

  return (
    <ContentSection
      title={t('fiscal.settings.title', 'Tax Information')}
      desc={t(
        'fiscal.settings.description',
        'Manage your tax information and view NFS-e invoices.'
      )}
    >
      <div className='space-y-10 pb-10'>
        {/* Tax Information Form */}
        <section>
          <div className='mb-4'>
            <h4 className='mb-1 font-medium text-muted-foreground text-sm uppercase tracking-wider'>
              {t('fiscal.settings.taxInfoSection', 'Tax Details')}
            </h4>
            <p className='text-muted-foreground text-sm'>
              {t(
                'fiscal.settings.taxInfoDesc',
                'Your tax information is used to generate NFS-e invoices for purchases.'
              )}
            </p>
          </div>
          <div className='rounded-lg border bg-card p-6'>
            <TaxInfoSection />
          </div>
        </section>

        <Separator />

        {/* Invoice History */}
        <section>
          <div className='mb-4'>
            <h4 className='mb-1 font-medium text-muted-foreground text-sm uppercase tracking-wider'>
              {t('fiscal.settings.invoiceSection', 'Invoice History')}
            </h4>
            <p className='text-muted-foreground text-sm'>
              {t(
                'fiscal.settings.invoiceDesc',
                'Download and review your past NFS-e tax invoices.'
              )}
            </p>
          </div>
          <BillingHistorySection />
        </section>
      </div>
    </ContentSection>
  )
}
