/**
 * Purchase Guard Component
 *
 * Wraps purchase buttons and checks for tax information before proceeding.
 * If tax info is missing, displays TaxInfoModal to collect it first.
 */

import { useState } from 'react'
import { useTaxInfo } from '../hooks/useTaxInfo'
import { TaxInfoModal } from './TaxInfoModal'

interface PurchaseGuardProps {
  children: (props: {
    onPurchaseClick: () => void
    isChecking: boolean
  }) => React.ReactNode
  onProceedToCheckout: () => void
}

export function PurchaseGuard({
  children,
  onProceedToCheckout,
}: PurchaseGuardProps) {
  const { hasTaxInfo, isLoading, refetch } = useTaxInfo()
  const [showTaxModal, setShowTaxModal] = useState(false)

  const handlePurchaseClick = async () => {
    // Still loading - do nothing
    if (isLoading) {
      return
    }

    // No tax info - show modal
    if (!hasTaxInfo) {
      setShowTaxModal(true)
      return
    }

    // Has tax info - proceed to checkout
    onProceedToCheckout()
  }

  const handleTaxInfoSuccess = () => {
    setShowTaxModal(false)
    // Refresh tax info
    refetch()
    // Proceed to checkout
    onProceedToCheckout()
  }

  return (
    <>
      {children({
        onPurchaseClick: handlePurchaseClick,
        isChecking: isLoading,
      })}

      <TaxInfoModal
        open={showTaxModal}
        onClose={() => setShowTaxModal(false)}
        onSuccess={handleTaxInfoSuccess}
      />
    </>
  )
}

/**
 * Usage Example:
 *
 * <PurchaseGuard onProceedToCheckout={handleStripeCheckout}>
 *   {({ onPurchaseClick, isChecking }) => (
 *     <Button onClick={onPurchaseClick} disabled={isChecking}>
 *       {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 *       Buy Credits
 *     </Button>
 *   )}
 * </PurchaseGuard>
 */
