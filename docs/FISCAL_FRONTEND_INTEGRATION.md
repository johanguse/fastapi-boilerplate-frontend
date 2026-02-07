# Frontend Fiscal Integration Guide

This guide explains how to integrate the Fiscal Nacional NFS-e system into your frontend application.

## Components Created

### 1. **TaxInfoModal** (`components/TaxInfoModal.tsx`)

Modal dialog for collecting user tax information before purchases.

**Features:**

- Country selector with flag emojis
- Conditional rendering for Brazilian vs International forms
- Brazilian form: CPF/CNPJ, full address with IBGE integration
- International form: NIF (optional)
- Real-time CPF/CNPJ validation
- State/City dropdowns populated from IBGE API

### 2. **PurchaseGuard** (`components/PurchaseGuard.tsx`)

Render prop component that wraps purchase buttons and handles tax info validation.

**Features:**

- Checks if user has tax info before proceeding to checkout
- Shows TaxInfoModal if tax info is missing
- Calls checkout callback after tax info is collected
- Provides loading state for seamless UX

### 3. **BillingHistoryPage** (`pages/BillingHistory.tsx`)

Full page component displaying NFS-e billing history.

**Features:**

- Data table with all invoice details
- Status badges (Processing, Authorized, Error, Cancelled)
- Download buttons for PDF and XML files
- Empty state for no invoices
- Error display with details
- Currency formatting (BRL + original currency)

### 4. **useTaxInfo** (`hooks/useTaxInfo.ts`)

React Query hook for fetching user's tax information.

**Returns:**

- `taxInfo`: UserTaxInfo object or null
- `hasTaxInfo`: boolean indicating if tax info exists
- `isLoading`: loading state
- `error`: error object if request failed
- `refetch`: function to manually refetch

## Integration Steps

### Step 1: Add Billing History to Router

```tsx
// src/routes/billing/history.tsx
import { createFileRoute } from "@tanstack/react-router";
import { BillingHistoryPage } from "@/features/fiscal";

export const Route = createFileRoute("/billing/history")({
  component: BillingHistoryPage,
});
```

### Step 2: Wrap Purchase Buttons with PurchaseGuard

**Before:**

```tsx
<Button onClick={handleStripeCheckout}>
  Buy Credits
</Button>
```

**After:**

```tsx
import { PurchaseGuard } from "@/features/fiscal";

<PurchaseGuard onProceedToCheckout={handleStripeCheckout}>
  {({ onPurchaseClick, isChecking }) => (
    <Button onClick={onPurchaseClick} disabled={isChecking}>
      {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Buy Credits
    </Button>
  )}
</PurchaseGuard>
```

### Step 3: Add Billing History Link to Navigation

```tsx
// In your navigation component
<nav>
  <Link to="/billing/history">
    <FileText className="mr-2 h-4 w-4" />
    Billing History
  </Link>
</nav>
```

### Step 4: Update Purchase Flow in Subscriptions

```tsx
// src/features/subscriptions/components/SubscriptionCard.tsx
import { PurchaseGuard } from "@/features/fiscal";

function SubscriptionCard({ plan }) {
  const handleStripeCheckout = async () => {
    // Your existing Stripe checkout logic
    const session = await createCheckoutSession(plan.id);
    window.location.href = session.url;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">${plan.price}/mo</p>
      </CardContent>
      <CardFooter>
        <PurchaseGuard onProceedToCheckout={handleStripeCheckout}>
          {({ onPurchaseClick, isChecking }) => (
            <Button onClick={onPurchaseClick} disabled={isChecking}>
              {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Subscribe
            </Button>
          )}
        </PurchaseGuard>
      </CardFooter>
    </Card>
  );
}
```

### Step 5: Update Credit Purchase Modal

```tsx
// src/features/credits/components/BuyCreditModal.tsx
import { PurchaseGuard } from "@/features/fiscal";

function BuyCreditModal({ open, onClose }) {
  const [selectedAmount, setSelectedAmount] = useState(100);

  const handleStripeCheckout = async () => {
    const session = await createCreditCheckoutSession(selectedAmount);
    window.location.href = session.url;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy Credits</DialogTitle>
        </DialogHeader>
        
        {/* Amount selector */}
        <CreditAmountSelector value={selectedAmount} onChange={setSelectedAmount} />

        <DialogFooter>
          <PurchaseGuard onProceedToCheckout={handleStripeCheckout}>
            {({ onPurchaseClick, isChecking }) => (
              <Button onClick={onPurchaseClick} disabled={isChecking}>
                {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Buy {selectedAmount} Credits
              </Button>
            )}
          </PurchaseGuard>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## API Endpoints Required

The frontend expects these backend endpoints to be available:

### Tax Information

- `GET /api/v1/fiscal/tax-info` - Get user's tax info (404 if none)
- `POST /api/v1/fiscal/tax-info` - Create tax info
- `GET /api/v1/fiscal/validate-cpf-cnpj/{document}` - Validate CPF/CNPJ

### Brazilian Data (IBGE API)

- `GET /api/v1/fiscal/brazilian-states` - List Brazilian states
- `GET /api/v1/fiscal/brazilian-cities/{state_code}` - List cities by state

### NFS-e History

- `GET /api/v1/fiscal/nfse` - List user's NFS-e records

## Translations (i18n)

Add these translations to your i18n files:

```json
{
  "Billing History": "Histórico de Faturamento",
  "Tax Invoices (NFS-e)": "Notas Fiscais (NFS-e)",
  "Download PDF": "Baixar PDF",
  "Download XML": "Baixar XML",
  "Processing": "Processando",
  "Authorized": "Autorizada",
  "Error": "Erro",
  "Cancelled": "Cancelada",
  "No invoices yet": "Nenhuma nota fiscal ainda",
  "Tax invoices will appear here after your purchases": "As notas fiscais aparecerão aqui após suas compras",
  "Add Tax Information": "Adicionar Informação Fiscal",
  "Enter your tax information": "Digite suas informações fiscais",
  "Country": "País",
  "Brazilian Document (CPF/CNPJ)": "Documento Brasileiro (CPF/CNPJ)",
  "Tax ID (NIF)": "Identificação Fiscal (NIF)",
  "Postal Code (CEP)": "CEP",
  "State": "Estado",
  "City": "Cidade",
  "Address": "Endereço",
  "Number": "Número",
  "Complement": "Complemento",
  "Neighborhood": "Bairro",
  "Full Name": "Nome Completo",
  "Save": "Salvar",
  "Cancel": "Cancelar"
}
```

## Testing Checklist

- [ ] Test TaxInfoModal opens when clicking purchase without tax info
- [ ] Test Brazilian form requires all address fields
- [ ] Test CPF/CNPJ validation API call
- [ ] Test state/city dropdowns populate correctly from IBGE
- [ ] Test international form only requires name and country
- [ ] Test TaxInfoModal closes and proceeds to checkout after saving
- [ ] Test subsequent purchases skip modal (tax info already exists)
- [ ] Test BillingHistoryPage displays NFS-e records
- [ ] Test download buttons work for authorized invoices
- [ ] Test status badges display correctly
- [ ] Test empty state shows when no invoices
- [ ] Test currency formatting (BRL + original currency)
- [ ] Test loading states for all components
- [ ] Test error states and error messages

## Common Issues

### Modal doesn't appear on purchase

- Verify `useTaxInfo` hook is returning correct data
- Check network tab for `/api/v1/fiscal/tax-info` request
- Ensure PurchaseGuard is wrapping the purchase button correctly

### Brazilian cities not loading

- Verify state is selected first (cities depend on state)
- Check `/api/v1/fiscal/brazilian-cities/{state_code}` endpoint
- Ensure IBGE API integration is working in backend

### Downloads not working

- Check that NFS-e status is "authorized"
- Verify pdfUrl and xmlUrl are set in database
- Ensure webhook from Fiscal Nacional is updating these fields

### Currency conversion issues

- Verify Stripe webhook is triggering NFS-e generation
- Check backend logs for currency conversion errors
- Ensure PTAX API is accessible (fallback for non-Stripe transactions)

## Next Steps

1. **Generate API Client**: Run `npm run openapi-ts` to generate TypeScript client with fiscal endpoints
2. **Test Flow**: Create a test purchase and verify:
   - Tax info modal appears
   - Form validation works
   - Purchase completes after tax info is saved
   - NFS-e appears in billing history
3. **Configure Webhooks**: In Fiscal Nacional dashboard, set webhook URL to your backend
4. **Production Setup**: Update FISCAL_NACIONAL_CONFIG with real company details
5. **Monitor**: Watch webhook logs and NFS-e generation for any issues

## Support

For issues or questions:

- Backend implementation: See `backend/docs/FISCAL_IMPLEMENTATION_STATUS.md`
- API documentation: Check FastAPI Swagger UI at `/docs`
- Currency conversion: Review `backend/src/services/currency_conversion.py`
- Webhook handling: See `backend/src/fiscal/webhooks.py`
