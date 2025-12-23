import { useTranslation } from 'react-i18next'
import { Separator } from '@/components/ui/separator'
import { ContentSection } from '../components/content-section'
import { BillingDashboard } from './billing-dashboard'
import { BillingForm } from './billing-form'

export default function SettingsBilling() {
  const { t } = useTranslation()

  return (
    <ContentSection
      title={t('billing.title', 'Billing & Subscription')}
      desc={t(
        'billing.subtitle',
        'Manage your subscription, usage, and billing information.'
      )}
    >
      <div className='space-y-10 pb-10'>
        {/* Subscription and Usage Dashboard */}
        <section>
          <h4 className='mb-4 font-medium text-muted-foreground text-sm uppercase tracking-wider'>
            {t('billing.dashboardSection', 'Subscription & Usage')}
          </h4>
          <BillingDashboard />
        </section>

        <Separator />

        {/* Invoice / Billing Information Form */}
        <section>
          <div className='mb-4'>
            <h4 className='mb-1 font-medium text-muted-foreground text-sm uppercase tracking-wider'>
              {t('billing.infoSection', 'Invoice Information')}
            </h4>
            <p className='text-muted-foreground text-sm'>
              {t(
                'billing.infoSectionDesc',
                'Update your tax ID and billing address for invoices.'
              )}
            </p>
          </div>
          <div className='rounded-lg border bg-card p-6'>
            <BillingForm />
          </div>
        </section>
      </div>
    </ContentSection>
  )
}
