import { z } from 'zod/v4'

/**
 * Billing Information Entity
 * Schema and types for billing address and company information
 */

// ============================================================================
// Schemas (Runtime Validation)
// ============================================================================

/**
 * Schema for billing information form with i18n support
 * Factory function that accepts a translation function
 */
export function createBillingInfoSchema(
  t: (key: string, defaultValue: string) => string
) {
  return z.object({
    companyName: z
      .string()
      .min(
        2,
        t('billing.validation.companyNameRequired', 'Company name or full name is required')
      )
      .max(255),
    taxId: z
      .string()
      .min(3, t('billing.validation.taxIdRequired', 'Tax ID / VAT number is required'))
      .max(100),
    country: z
      .string()
      .min(2, t('billing.validation.countryRequired', 'Country is required')),
    addressStreet: z
      .string()
      .min(5, t('billing.validation.addressStreetRequired', 'Street address is required'))
      .max(255),
    addressCity: z
      .string()
      .min(2, t('billing.validation.addressCityRequired', 'City is required'))
      .max(100),
    addressState: z
      .string()
      .min(2, t('billing.validation.addressStateRequired', 'State or province is required'))
      .max(100),
    addressPostalCode: z
      .string()
      .min(3, t('billing.validation.addressPostalCodeRequired', 'Postcode / ZIP is required'))
      .max(20),
  })
}

// ============================================================================
// Inferred Types
// ============================================================================

export type BillingInfo = z.infer<ReturnType<typeof createBillingInfoSchema>>

// ============================================================================
// Default Values
// ============================================================================

export const billingInfoDefaultValues: BillingInfo = {
  companyName: '',
  taxId: '',
  country: '',
  addressStreet: '',
  addressCity: '',
  addressState: '',
  addressPostalCode: '',
}
