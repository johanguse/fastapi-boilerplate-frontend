/**
 * Tax Information Form (Reusable)
 *
 * Shared form for collecting tax information from users.
 * Used in both TaxInfoModal (before purchase) and TaxInfoSection (profile settings).
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { api } from '@/lib/api'
import type {
  BrazilianCity,
  BrazilianState,
  TaxInfoFormData,
  UserTaxInfo,
  UserTaxInfoCreate,
} from '@/shared/entities/fiscal'
import { createTaxInfoSchema } from '@/shared/entities/fiscal'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TaxInfoFormProps {
  /** Pre-populated data (for editing existing tax info). */
  initialData?: UserTaxInfo | null
  /** Callback fired on successful save. */
  onSuccess?: () => void
  /** Optional label for the submit button. Falls back to Save / Update. */
  submitLabel?: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TaxInfoForm({
  initialData,
  onSuccess,
  submitLabel,
}: TaxInfoFormProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // Local state for cascading selects
  const [selectedState, setSelectedState] = useState(initialData?.state ?? '')

  const schema = createTaxInfoSchema(t)

  const form = useForm<TaxInfoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      country: initialData?.country ?? 'BR',
      fullName: initialData?.fullName ?? '',
      cpfCnpj: initialData?.cpfCnpj ?? '',
      nif: initialData?.nif ?? '',
      address: initialData?.address ?? '',
      number: initialData?.number ?? '',
      complement: initialData?.complement ?? '',
      neighborhood: initialData?.neighborhood ?? '',
      city: initialData?.city ?? '',
      cityCode: initialData?.cityCode ?? '',
      state: initialData?.state ?? '',
      postalCode: initialData?.postalCode ?? '',
    },
    mode: 'onChange',
  })

  const country = form.watch('country')
  const isBrazilian = country === 'BR'

  // Keep selectedState in sync when form state changes
  useEffect(() => {
    const sub = form.watch((value, { name }) => {
      if (name === 'state' && value.state) {
        setSelectedState(value.state)
      }
    })
    return () => sub.unsubscribe()
  }, [form])

  // -----------------------------------------------------------------------
  // Queries: Brazilian states & cities
  // -----------------------------------------------------------------------

  const { data: states } = useQuery<BrazilianState[]>({
    queryKey: ['brazilian-states'],
    queryFn: async () => {
      const res = await api.get<BrazilianState[]>(
        '/api/v1/fiscal/brazilian-states'
      )
      return res.data
    },
    enabled: isBrazilian,
  })

  const { data: cities } = useQuery<BrazilianCity[]>({
    queryKey: ['brazilian-cities', selectedState],
    queryFn: async () => {
      const res = await api.get<BrazilianCity[]>(
        `/api/v1/fiscal/brazilian-cities/${selectedState}`
      )
      return res.data
    },
    enabled: isBrazilian && !!selectedState,
  })

  // -----------------------------------------------------------------------
  // Mutation
  // -----------------------------------------------------------------------

  const isEditing = !!initialData

  const saveMutation = useMutation({
    mutationFn: async (data: TaxInfoFormData) => {
      const payload: UserTaxInfoCreate = {
        country: data.country,
        fullName: data.fullName.trim(),
        cpfCnpj: data.cpfCnpj?.trim() || undefined,
        nif: data.nif?.trim() || undefined,
        address: data.address?.trim() || undefined,
        number: data.number?.trim() || undefined,
        complement: data.complement?.trim() || undefined,
        neighborhood: data.neighborhood?.trim() || undefined,
        city: data.city?.trim() || undefined,
        cityCode: data.cityCode || undefined,
        state: data.state || undefined,
        postalCode: data.postalCode?.trim() || undefined,
      }

      if (isEditing) {
        const res = await api.put('/api/v1/fiscal/tax-info', payload)
        return res.data
      }
      const res = await api.post('/api/v1/fiscal/tax-info', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-info'] })
      toast.success(
        t('fiscal.form.saveSuccess', 'Tax information saved successfully')
      )
      onSuccess?.()
    },
    onError: () => {
      toast.error(
        t(
          'fiscal.form.saveError',
          'Failed to save tax information. Please try again.'
        )
      )
    },
  })

  // -----------------------------------------------------------------------
  // Validate CPF/CNPJ on blur
  // -----------------------------------------------------------------------

  const handleValidateDocument = async (value: string) => {
    if (!value || !isBrazilian) return
    try {
      const res = await api.get<{ valid: boolean; message?: string }>(
        `/api/v1/fiscal/validate-cpf-cnpj/${encodeURIComponent(value)}`
      )
      if (!res.data.valid) {
        form.setError('cpfCnpj', {
          message:
            res.data.message ??
            t('fiscal.validation.invalidDocument', 'Invalid CPF or CNPJ'),
        })
      }
    } catch {
      // Silently fail – server-side validation will catch it
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const defaultSubmitLabel = isEditing
    ? t('fiscal.form.update', 'Update')
    : t('fiscal.form.save', 'Save')

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => saveMutation.mutate(data))}
        className='space-y-4'
      >
        {/* Country */}
        <FormField
          control={form.control}
          name='country'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('fiscal.fields.country', 'Country')}{' '}
                <span className='text-destructive'>*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'fiscal.fields.countryPlaceholder',
                        'Select your country'
                      )}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='BR'>🇧🇷 Brazil</SelectItem>
                  <SelectItem value='US'>🇺🇸 United States</SelectItem>
                  <SelectItem value='GB'>🇬🇧 United Kingdom</SelectItem>
                  <SelectItem value='DE'>🇩🇪 Germany</SelectItem>
                  <SelectItem value='FR'>🇫🇷 France</SelectItem>
                  <SelectItem value='PT'>🇵🇹 Portugal</SelectItem>
                  <SelectItem value='ES'>🇪🇸 Spain</SelectItem>
                  <SelectItem value='CA'>🇨🇦 Canada</SelectItem>
                  <SelectItem value='MX'>🇲🇽 Mexico</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Full Name */}
        <FormField
          control={form.control}
          name='fullName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('fiscal.fields.fullName', 'Full Name')}{' '}
                <span className='text-destructive'>*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t(
                    'fiscal.fields.fullNamePlaceholder',
                    'Your full legal name'
                  )}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ---- Brazilian-specific fields ---- */}
        {isBrazilian ? (
          <>
            {/* CPF / CNPJ */}
            <FormField
              control={form.control}
              name='cpfCnpj'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    CPF / CNPJ <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='000.000.000-00 or 00.000.000/0000-00'
                      maxLength={18}
                      {...field}
                      onBlur={(e) => {
                        field.onBlur()
                        handleValidateDocument(e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'fiscal.fields.cpfCnpjHint',
                      'CPF for individuals, CNPJ for companies'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CEP + State */}
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='postalCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('fiscal.fields.cep', 'CEP')}{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='00000-000' maxLength={9} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='state'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('fiscal.fields.state', 'State')}{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'fiscal.fields.statePlaceholder',
                              'Select state'
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {states?.map((s) => (
                          <SelectItem key={s.code} value={s.code}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* City */}
            <FormField
              control={form.control}
              name='cityCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('fiscal.fields.city', 'City')}{' '}
                    <span className='text-destructive'>*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      const city = cities?.find(
                        (c) => c.id.toString() === value
                      )
                      if (city) form.setValue('city', city.name)
                    }}
                    value={field.value}
                    disabled={!selectedState}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t(
                            'fiscal.fields.cityPlaceholder',
                            'Select city'
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cities?.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Street + Number */}
            <div className='grid grid-cols-3 gap-3'>
              <div className='col-span-2'>
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t('fiscal.fields.street', 'Street')}{' '}
                        <span className='text-destructive'>*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            'fiscal.fields.streetPlaceholder',
                            'Street name'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('fiscal.fields.number', 'Number')}{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='123' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Complement + Neighborhood */}
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='complement'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('fiscal.fields.complement', 'Complement')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'fiscal.fields.complementPlaceholder',
                          'Apt, Suite, etc.'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='neighborhood'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('fiscal.fields.neighborhood', 'Neighborhood')}{' '}
                      <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t(
                          'fiscal.fields.neighborhoodPlaceholder',
                          'Bairro'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        ) : (
          /* ---- International fields ---- */
          <FormField
            control={form.control}
            name='nif'
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t('fiscal.fields.taxId', 'Tax ID (NIF)')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      'fiscal.fields.taxIdPlaceholder',
                      'Your tax identification number'
                    )}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t(
                    'fiscal.fields.taxIdHint',
                    'Optional \u2013 leave blank if you do not have a tax ID'
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Submit */}
        <div className='pt-4'>
          <Button
            type='submit'
            disabled={saveMutation.isPending}
            className='gap-2'
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                {t('fiscal.form.saving', 'Saving...')}
              </>
            ) : (
              <>
                <CheckCircle2 className='h-4 w-4' />
                {submitLabel ?? defaultSubmitLabel}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
