/**
 * Tax Information Modal
 *
 * Displayed before a user's first purchase to collect tax information.
 * Wraps the reusable TaxInfoForm inside a Dialog.
 */

import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TaxInfoForm } from './TaxInfoForm'

interface TaxInfoModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function TaxInfoModal({ open, onClose, onSuccess }: TaxInfoModalProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {t('fiscal.modal.title', 'Tax Information Required')}
          </DialogTitle>
          <DialogDescription>
            {t(
              'fiscal.modal.description',
              'Please provide your tax information to generate tax invoices (NFS-e)'
            )}
          </DialogDescription>
        </DialogHeader>

        <TaxInfoForm
          onSuccess={() => {
            onSuccess()
            onClose()
          }}
          submitLabel={t('fiscal.modal.saveAndContinue', 'Save & Continue')}
        />
      </DialogContent>
    </Dialog>
  )
}
