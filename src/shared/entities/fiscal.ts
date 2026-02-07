import { z } from 'zod/v4'

/**
 * Fiscal / NFS-e Entity
 * Combined schema and types for tax information and invoices
 */

// ============================================================================
// Schemas (Runtime Validation)
// ============================================================================

/**
 * Schema for tax information form
 * Supports both Brazilian (CPF/CNPJ, CEP, IBGE city) and international (NIF) flows
 */
export function createTaxInfoSchema(
  t: (key: string, defaultValue: string) => string
) {
  return z
    .object({
      country: z
        .string()
        .min(1, t('fiscal.validation.countryRequired', 'Country is required')),
      fullName: z
        .string()
        .min(1, t('fiscal.validation.nameRequired', 'Full name is required')),
      cpfCnpj: z.string().optional(),
      nif: z.string().optional(),
      address: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      cityCode: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.country === 'BR') {
        if (!data.cpfCnpj) {
          ctx.addIssue({
            code: 'custom',
            message: t(
              'fiscal.validation.cpfCnpjRequired',
              'CPF/CNPJ is required'
            ),
            path: ['cpfCnpj'],
          })
        }
        if (!data.address) {
          ctx.addIssue({
            code: 'custom',
            message: t(
              'fiscal.validation.addressRequired',
              'Address is required'
            ),
            path: ['address'],
          })
        }
        if (!data.cityCode) {
          ctx.addIssue({
            code: 'custom',
            message: t('fiscal.validation.cityRequired', 'City is required'),
            path: ['cityCode'],
          })
        }
        if (!data.state) {
          ctx.addIssue({
            code: 'custom',
            message: t('fiscal.validation.stateRequired', 'State is required'),
            path: ['state'],
          })
        }
        if (!data.postalCode) {
          ctx.addIssue({
            code: 'custom',
            message: t('fiscal.validation.cepRequired', 'CEP is required'),
            path: ['postalCode'],
          })
        }
      }
    })
}

/**
 * User tax information schema (for API responses)
 */
export const UserTaxInfoSchema = z.object({
  id: z.number(),
  userId: z.number(),
  country: z.string(),
  isBrazilian: z.boolean(),
  fullName: z.string(),
  cpfCnpj: z.string().optional(),
  nif: z.string().optional(),
  nifExemptionCode: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  cityCode: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

/**
 * Schema for creating user tax information
 */
export const UserTaxInfoCreateSchema = z.object({
  country: z.string(),
  fullName: z.string(),
  cpfCnpj: z.string().optional(),
  nif: z.string().optional(),
  nifExemptionCode: z.string().optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  cityCode: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
})

/**
 * NFS-e invoice schema
 */
export const NFSeSchema = z.object({
  id: z.number(),
  userId: z.number(),
  fiscalNacionalId: z.string().optional(),
  fiscalNacionalReference: z.string(),
  stripeInvoiceId: z.string().optional(),
  stripePaymentIntentId: z.string().optional(),
  stripeChargeId: z.string().optional(),
  transactionType: z.enum(['subscription', 'credit_purchase']),
  nfseNumber: z.string().optional(),
  status: z.enum(['processing', 'authorized', 'error', 'cancelled']),
  serviceDescription: z.string(),
  productName: z.string().optional(),
  valueBrl: z.number(),
  valueUsd: z.number().optional(),
  originalAmount: z.number().optional(),
  originalCurrency: z.string().optional(),
  exchangeRate: z.number().optional(),
  issRate: z.number(),
  issValue: z.number(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerCountry: z.string(),
  customerDocument: z.string().optional(),
  pdfUrl: z.string().optional(),
  xmlUrl: z.string().optional(),
  errorMessage: z.string().optional(),
  issuedAt: z.string().optional(),
  cancelledAt: z.string().optional(),
  cancellationReason: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

/**
 * Brazilian state schema
 */
export const BrazilianStateSchema = z.object({
  code: z.string(),
  name: z.string(),
})

/**
 * Brazilian city schema
 */
export const BrazilianCitySchema = z.object({
  id: z.number(),
  name: z.string(),
})

/**
 * CPF/CNPJ validation result schema
 */
export const CPFCNPJValidationResultSchema = z.object({
  valid: z.boolean(),
  type: z.enum(['CPF', 'CNPJ']).optional(),
  formatted: z.string().optional(),
  message: z.string().optional(),
})

// ============================================================================
// Inferred Types
// ============================================================================

export type TaxInfoFormData = z.infer<ReturnType<typeof createTaxInfoSchema>>
export type UserTaxInfo = z.infer<typeof UserTaxInfoSchema>
export type UserTaxInfoCreate = z.infer<typeof UserTaxInfoCreateSchema>
export type NFSe = z.infer<typeof NFSeSchema>
export type BrazilianState = z.infer<typeof BrazilianStateSchema>
export type BrazilianCity = z.infer<typeof BrazilianCitySchema>
export type CPFCNPJValidationResult = z.infer<
  typeof CPFCNPJValidationResultSchema
>
