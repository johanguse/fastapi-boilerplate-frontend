/**
 * Fiscal Feature Module
 *
 * Exports all fiscal-related components, hooks, and types
 */

// Types
export type {
  BrazilianCity,
  BrazilianState,
  CPFCNPJValidationResult,
  NFSe,
  UserTaxInfo,
  UserTaxInfoCreate,
} from '@/shared/entities/fiscal'
export { PurchaseGuard } from './components/PurchaseGuard'
// Components
export { TaxInfoForm } from './components/TaxInfoForm'
export { TaxInfoModal } from './components/TaxInfoModal'
// Hooks
export { useTaxInfo } from './hooks/useTaxInfo'
// Pages
export { BillingHistoryPage } from './pages/BillingHistory'
