import { z } from 'zod'

export const billingInfoSchema = z.object({
  companyName: z
    .string()
    .min(2, 'Company name or full name is required')
    .max(255),
  taxId: z.string().min(3, 'Tax ID / VAT number is required').max(100),
  country: z.string().min(2, 'Country is required'),
  addressStreet: z.string().min(5, 'Street address is required').max(255),
  addressCity: z.string().min(2, 'City is required').max(100),
  addressState: z.string().min(2, 'State or province is required').max(100),
  addressPostalCode: z.string().min(3, 'Postcode / ZIP is required').max(20),
})

export type BillingInfoFormData = z.infer<typeof billingInfoSchema>

export const billingInfoDefaultValues: BillingInfoFormData = {
  companyName: '',
  taxId: '',
  country: '',
  addressStreet: '',
  addressCity: '',
  addressState: '',
  addressPostalCode: '',
}
