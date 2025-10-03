import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { useOrganizations } from '@/hooks/use-organizations'

export const Route = createFileRoute('/_authenticated/pricing/')({
  component: PricingPage,
})

interface Plan {
  id: string
  name: string
  display_name: string
  description: string
  price_monthly_usd: number
  price_yearly_usd: number
  price_monthly_eur?: number
  price_yearly_eur?: number
  price_monthly_gbp?: number
  price_yearly_gbp?: number
  price_monthly_brl?: number
  price_yearly_brl?: number
  max_projects: number
  max_users: number
  max_storage_gb: number
  features: string[]
  is_popular?: boolean
}

const defaultPlans: Plan[] = [
  {
    id: 'starter',
    name: 'starter',
    display_name: 'Starter',
    description: 'Perfect for getting started',
    price_monthly_usd: 990,
    price_yearly_usd: 9900,
    price_monthly_eur: 890,
    price_yearly_eur: 8900,
    price_monthly_gbp: 790,
    price_yearly_gbp: 7900,
    price_monthly_brl: 4990,
    price_yearly_brl: 49900,
    max_projects: 3,
    max_users: 5,
    max_storage_gb: 5,
    features: ['3 projects', '5 team members', '5GB storage', 'Basic support'],
  },
  {
    id: 'pro',
    name: 'pro',
    display_name: 'Professional',
    description: 'For growing teams',
    price_monthly_usd: 2990,
    price_yearly_usd: 29900,
    price_monthly_eur: 2690,
    price_yearly_eur: 26900,
    price_monthly_gbp: 2390,
    price_yearly_gbp: 23900,
    price_monthly_brl: 14990,
    price_yearly_brl: 149900,
    max_projects: 10,
    max_users: 20,
    max_storage_gb: 50,
    features: [
      '10 projects',
      '20 team members',
      '50GB storage',
      'Priority support',
      'Advanced analytics',
    ],
    is_popular: true,
  },
  {
    id: 'business',
    name: 'business',
    display_name: 'Business',
    description: 'For large organizations',
    price_monthly_usd: 9990,
    price_yearly_usd: 99900,
    price_monthly_eur: 8990,
    price_yearly_eur: 89900,
    price_monthly_gbp: 7990,
    price_yearly_gbp: 79900,
    price_monthly_brl: 49990,
    price_yearly_brl: 499900,
    max_projects: 50,
    max_users: 100,
    max_storage_gb: 500,
    features: [
      'Unlimited projects',
      '100 team members',
      '500GB storage',
      '24/7 priority support',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated account manager',
    ],
  },
]

function PricingPage() {
  const { t, i18n } = useTranslation()
  const { activeOrganization } = useOrganizations()
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null)

  const getCurrency = () => {
    const lang = i18n.language
    if (lang.startsWith('en-GB')) return 'GBP'
    if (lang.startsWith('pt')) return 'BRL'
    if (
      lang.startsWith('fr') ||
      lang.startsWith('de') ||
      lang.startsWith('es')
    )
      return 'EUR'
    return 'USD'
  }

  const formatPrice = (plan: Plan) => {
    const currency = getCurrency()
    const priceKey = isYearly
      ? (`price_yearly_${currency.toLowerCase()}` as keyof Plan)
      : (`price_monthly_${currency.toLowerCase()}` as keyof Plan)

    let price = plan[priceKey] as number
    if (!price) {
      price = isYearly ? plan.price_yearly_usd : plan.price_monthly_usd
    }

    const amount = price / 100

    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleSubscribe = async (plan: Plan) => {
    if (!activeOrganization) {
      toast.error(t('pricing.errors.noOrganization'))
      return
    }

    setLoadingPlanId(plan.id)

    try {
      // Create checkout session
      const response = await api.post(
        `/api/v1/subscriptions/organizations/${activeOrganization.id}/checkout`,
        {
          price_id: `price_${plan.id}_${isYearly ? 'yearly' : 'monthly'}`,
          success_url: `${window.location.origin}/settings?subscription=success`,
          cancel_url: `${window.location.origin}/pricing?subscription=canceled`,
        }
      )

      // Redirect to Stripe checkout
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.detail || t('pricing.errors.checkoutFailed')
      )
    } finally {
      setLoadingPlanId(null)
    }
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mx-auto max-w-6xl'>
        {/* Header */}
        <div className='mb-12 text-center'>
          <h1 className='mb-4 text-4xl font-bold'>
            {t('pricing.title', { defaultValue: 'Choose Your Plan' })}
          </h1>
          <p className='mb-8 text-lg text-muted-foreground'>
            {t(
              'pricing.subtitle',
              'Select the perfect plan for your team. Upgrade or downgrade anytime.'
            )}
          </p>

          {/* Billing Toggle */}
          <div className='flex items-center justify-center gap-4'>
            <Label
              htmlFor='billing-toggle'
              className={!isYearly ? 'font-semibold' : ''}
            >
              {t('pricing.monthly', 'Monthly')}
            </Label>
            <Switch
              id='billing-toggle'
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label
              htmlFor='billing-toggle'
              className={isYearly ? 'font-semibold' : ''}
            >
              {t('pricing.yearly', 'Yearly')}
              <Badge variant='secondary' className='ml-2'>
                {t('pricing.save', 'Save 17%')}
              </Badge>
            </Label>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className='grid gap-8 md:grid-cols-3'>
          {defaultPlans.map((plan) => (
            <Card
              key={plan.id}
              className={
                plan.is_popular
                  ? 'relative border-primary shadow-lg'
                  : 'relative'
              }
            >
              {plan.is_popular && (
                <div className='absolute -top-4 left-1/2 -translate-x-1/2'>
                  <Badge className='px-4 py-1'>
                    {t('pricing.popular', 'Most Popular')}
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className='text-2xl'>{plan.display_name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className='mt-4'>
                  <span className='text-4xl font-bold'>
                    {formatPrice(plan)}
                  </span>
                  <span className='text-muted-foreground'>
                    /{isYearly ? t('pricing.year', 'year') : t('pricing.month', 'month')}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className='space-y-3'>
                  <li className='flex items-center gap-2'>
                    <Check className='h-5 w-5 text-primary' />
                    <span>
                      {t('pricing.features.projects', {
                        count: plan.max_projects,
                        defaultValue: `${plan.max_projects} projects`,
                      })}
                    </span>
                  </li>
                  <li className='flex items-center gap-2'>
                    <Check className='h-5 w-5 text-primary' />
                    <span>
                      {t('pricing.features.users', {
                        count: plan.max_users,
                        defaultValue: `${plan.max_users} team members`,
                      })}
                    </span>
                  </li>
                  <li className='flex items-center gap-2'>
                    <Check className='h-5 w-5 text-primary' />
                    <span>
                      {t('pricing.features.storage', {
                        size: plan.max_storage_gb,
                        defaultValue: `${plan.max_storage_gb}GB storage`,
                      })}
                    </span>
                  </li>
                  {plan.features.slice(3).map((feature, index) => (
                    <li key={index} className='flex items-center gap-2'>
                      <Check className='h-5 w-5 text-primary' />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className='w-full'
                  variant={plan.is_popular ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlanId !== null}
                >
                  {loadingPlanId === plan.id ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {t('pricing.loading', 'Processing...')}
                    </>
                  ) : (
                    t('pricing.subscribe', 'Get Started')
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className='mt-16'>
          <h2 className='mb-8 text-center text-2xl font-bold'>
            {t('pricing.faq.title', 'Frequently Asked Questions')}
          </h2>
          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('pricing.faq.cancel.question', 'Can I cancel anytime?')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  {t(
                    'pricing.faq.cancel.answer',
                    'Yes! You can cancel your subscription at any time. Your plan will remain active until the end of your billing period.'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t('pricing.faq.change.question', 'Can I change plans?')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  {t(
                    'pricing.faq.change.answer',
                    'Absolutely! You can upgrade or downgrade your plan at any time. Changes will be prorated automatically.'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t('pricing.faq.payment.question', 'What payment methods do you accept?')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  {t(
                    'pricing.faq.payment.answer',
                    'We accept all major credit cards and debit cards through our secure payment processor, Stripe.'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {t('pricing.faq.refund.question', 'Do you offer refunds?')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground'>
                  {t(
                    'pricing.faq.refund.answer',
                    'We offer a 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.'
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
