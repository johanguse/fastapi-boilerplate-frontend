import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Globe,
  Hash,
  Loader2,
  MapPin,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { authApi } from '@/lib/api'
import { COUNTRIES } from '@/lib/countries'
import {
  type BillingInfo,
  billingInfoDefaultValues,
  createBillingInfoSchema,
} from '@/shared/entities/billing'

interface BillingInfoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  actionType?: 'subscription' | 'credits'
}

export default function BillingInfoModal({
  isOpen,
  onClose,
  onSuccess,
  actionType = 'subscription',
}: BillingInfoModalProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // Create schema with i18n support
  const billingInfoSchema = createBillingInfoSchema(t)

  // Fetch user profile data with React Query
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: isOpen,
  })

  // Transform API data (snake_case) to form values (camelCase)
  const formValues: BillingInfo = user
    ? {
        companyName: user.company_name || user.name || '',
        taxId: user.tax_id || '',
        country: user.country || '',
        addressStreet: user.address_street || '',
        addressCity: user.address_city || '',
        addressState: user.address_state || '',
        addressPostalCode: user.address_postal_code || '',
      }
    : billingInfoDefaultValues

  const form = useForm<BillingInfo>({
    resolver: zodResolver(billingInfoSchema),
    values: formValues,
    mode: 'onChange',
  })

  const { isValid } = form.formState

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: BillingInfo) =>
      authApi.updateProfile({
        company_name: data.companyName.trim(),
        tax_id: data.taxId.trim(),
        country: data.country,
        address_street: data.addressStreet.trim(),
        address_city: data.addressCity.trim(),
        address_state: data.addressState.trim(),
        address_postal_code: data.addressPostalCode.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
      toast.success(
        t('billing.saveSuccess', 'Billing information saved successfully!')
      )
      onSuccess()
    },
    onError: () => {
      toast.error(
        t(
          'billing.saveError',
          'Failed to save billing information. Please try again.'
        )
      )
    },
  })

  const onSubmit = (data: BillingInfo) => {
    updateProfileMutation.mutate(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-yellow-500' />
            {t('billing.modalTitle', 'Billing Information Required')}
          </DialogTitle>
          <DialogDescription>
            {t('billing.modalDescription', {
              action:
                actionType === 'credits'
                  ? 'purchase credits'
                  : 'upgrade your plan',
              defaultValue:
                'Please provide your billing details to proceed. This information will be used for invoices.',
            })}
          </DialogDescription>
        </DialogHeader>

        {isLoadingUser ? (
          <div className='flex h-40 items-center justify-center'>
            <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 py-4'
            >
              {/* Name / Company Name */}
              <FormField
                control={form.control}
                name='companyName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <Building2 className='h-4 w-4' />
                      {t('billing.fields.companyName', 'Name / Company Name')}{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'billing.placeholders.companyName',
                          'Your name or company name'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tax ID */}
              <FormField
                control={form.control}
                name='taxId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <Hash className='h-4 w-4' />
                      {t('billing.fields.taxId', 'Tax ID / VAT Number')}{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='e.g., GB123456789, EU123456789, 12-3456789'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t(
                        'billing.fields.taxIdDescription',
                        'VAT, GST, EIN, CPF, CNPJ or other tax identification number'
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country */}
              <FormField
                control={form.control}
                name='country'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <Globe className='h-4 w-4' />
                      {t('billing.fields.country', 'Country')}{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'billing.placeholders.country',
                              'Select your country'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Street Address */}
              <FormField
                control={form.control}
                name='addressStreet'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='flex items-center gap-2'>
                      <MapPin className='h-4 w-4' />
                      {t('billing.fields.addressStreet', 'Street Address')}{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='123 Main St, Suite 100' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City and State - Two columns */}
              <div className='grid grid-cols-2 gap-3'>
                <FormField
                  control={form.control}
                  name='addressCity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('billing.fields.addressCity', 'City')}{' '}
                        <span className='text-destructive'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='New York' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='addressState'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('billing.fields.addressState', 'State / Province')}{' '}
                        <span className='text-destructive'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder='NY' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Postcode */}
              <FormField
                control={form.control}
                name='addressPostalCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('billing.fields.addressPostalCode', 'Postcode / ZIP')}{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='10001' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Info text */}
              <p className='text-muted-foreground text-xs'>
                <span className='text-destructive'>*</span>{' '}
                {t(
                  'billing.requiredFieldsInfo',
                  'All marked fields are required for invoice generation.'
                )}
              </p>

              <DialogFooter className='gap-2 sm:gap-0'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={onClose}
                  disabled={updateProfileMutation.isPending}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type='submit'
                  disabled={updateProfileMutation.isPending || !isValid}
                  className='gap-2'
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      {t('common.saving', 'Saving...')}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='h-4 w-4' />
                      {t('billing.saveAndContinue', 'Save & Continue')}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
