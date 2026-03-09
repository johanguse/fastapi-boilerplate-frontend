/**
 * Billing History (NFS-e Invoices)
 *
 * Displays a table of NFS-e tax invoices with status badges
 * and download links for PDF/XML.
 */

import { useQuery } from '@tanstack/react-query'
import {
  Download,
  ExternalLink,
  FileText,
  Loader2,
  ReceiptText,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { api } from '@/lib/api'
import type { NFSe } from '@/shared/entities/fiscal'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function statusVariant(
  status: NFSe['status']
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'authorized':
      return 'default'
    case 'processing':
      return 'secondary'
    case 'error':
      return 'destructive'
    case 'cancelled':
      return 'outline'
    default:
      return 'secondary'
  }
}

function formatCurrency(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value)
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(dateStr))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BillingHistoryPage() {
  const { t } = useTranslation()

  const {
    data: invoices,
    isLoading,
    error,
  } = useQuery<NFSe[]>({
    queryKey: ['nfse-invoices'],
    queryFn: async () => {
      const res = await api.get<NFSe[]>('/api/v1/fiscal/nfse')
      return res.data
    },
  })

  const handleDownload = async (url: string, filename: string) => {
    try {
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      toast.error(t('fiscal.billing.downloadError', 'Failed to download file'))
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          <span className='ml-2 text-muted-foreground'>
            {t('fiscal.billing.loading', 'Loading invoices...')}
          </span>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-destructive'>
          {t(
            'fiscal.billing.loadError',
            'Failed to load invoices. Please try again.'
          )}
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (!invoices || invoices.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center gap-2 py-12'>
          <ReceiptText className='h-10 w-10 text-muted-foreground' />
          <p className='text-muted-foreground'>
            {t(
              'fiscal.billing.empty',
              'No invoices yet. Invoices will appear here after your first purchase.'
            )}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <FileText className='h-5 w-5' />
          {t('fiscal.billing.title', 'Tax Invoices (NFS-e)')}
        </CardTitle>
        <CardDescription>
          {t(
            'fiscal.billing.description',
            'Your Brazilian tax invoices for all transactions'
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('fiscal.billing.colNumber', 'Number')}</TableHead>
                <TableHead>{t('fiscal.billing.colDate', 'Date')}</TableHead>
                <TableHead>
                  {t('fiscal.billing.colDescription', 'Description')}
                </TableHead>
                <TableHead className='text-right'>
                  {t('fiscal.billing.colValue', 'Value')}
                </TableHead>
                <TableHead>{t('fiscal.billing.colStatus', 'Status')}</TableHead>
                <TableHead className='text-right'>
                  {t('fiscal.billing.colActions', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  {/* Number */}
                  <TableCell className='font-medium'>
                    {invoice.nfseNumber ?? '—'}
                  </TableCell>

                  {/* Date */}
                  <TableCell className='whitespace-nowrap text-muted-foregroundted-fosm'>
                    {invoice.issuedAt
                      ? formatDate(invoice.issuedAt)
                      : formatDate(invoice.createdAt)}
                  </TableCell>

                  {/* Description */}
                  <TableCell className='max-w-[220px] truncate text-sm'>
                    {invoice.serviceDescription}
                  </TableCell>

                  {/* Value */}
                  <TableCell className='text-right font-mono text-sm'>
                    {formatCurrency(invoice.valueBrl)}
                    {invoice.valueUsd && (
                      <span className='ml-1 text-muted-foreground text-xs'>
                        ({formatCurrency(invoice.valueUsd, 'USD')})
                      </span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={statusVariant(invoice.status)}>
                      {t(
                        `fiscal.status.${invoice.status}`,
                        invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)
                      )}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className='text-right'>
                    <div className='flex items-center justify-end gap-1'>
                      {invoice.pdfUrl && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          title={t(
                            'fiscal.billing.downloadPdf',
                            'Download PDF'
                          )}
                          onClick={() =>
                            handleDownload(
                              invoice.pdfUrl!,
                              `nfse-${invoice.nfseNumber ?? invoice.id}.pdf`
                            )
                          }
                        >
                          <Download className='h-4 w-4' />
                        </Button>
                      )}
                      {invoice.xmlUrl && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          title={t(
                            'fiscal.billing.downloadXml',
                            'Download XML'
                          )}
                          onClick={() =>
                            handleDownload(
                              invoice.xmlUrl!,
                              `nfse-${invoice.nfseNumber ?? invoice.id}.xml`
                            )
                          }
                        >
                          <ExternalLink className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
