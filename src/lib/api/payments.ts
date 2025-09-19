const API_BASE_URL = 'http://localhost:8001/api/v1'

export interface Plan {
  id: string
  name: string
  price: number
  currency: string
  interval: string
  interval_count: number
  max_projects: number
  features: string[]
}

export interface Subscription {
  id: string
  plan_name: string
  status: string
  billing_cycle: string
  max_projects: number
}

export interface PaymentMethod {
  id: number
  type: string
  last_four: string
  brand: string
  exp_month: number
  exp_year: number
  is_default: boolean
  created_at: string
}

export interface Payment {
  id: number
  stripe_payment_intent_id: string
  amount: number
  currency: string
  status: string
  description: string
  failure_reason?: string
  created_at: string
}

export interface Invoice {
  id: number
  stripe_invoice_id: string
  invoice_number: string
  amount_paid: number
  amount_due: number
  currency: string
  status: string
  invoice_pdf?: string
  hosted_invoice_url?: string
  due_date?: string
  paid_at?: string
  created_at: string
}

export interface UsageRecord {
  id: number
  metric: string
  quantity: number
  timestamp: string
}

export interface CreateCheckoutRequest {
  price_id: string
  success_url?: string
  cancel_url?: string
}

export interface CheckoutResponse {
  checkout_url: string
}

class PaymentsAPI {
  private getAuthToken(): string {
    // TODO: Get actual auth token from your auth system
    return 'your-auth-token'
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAuthToken()}`,
        ...options.headers,
      },
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  // Plans
  async getPlans(): Promise<{ items: Plan[] }> {
    return this.request('/payments/plans')
  }

  // Subscriptions
  async getSubscription(teamId: number): Promise<Subscription | null> {
    return this.request(`/payments/${teamId}/subscription`)
  }

  async createCheckout(
    teamId: number,
    request: CreateCheckoutRequest
  ): Promise<CheckoutResponse> {
    return this.request(`/payments/${teamId}/checkout`, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async cancelSubscription(
    teamId: number,
    atPeriodEnd: boolean = true
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/payments/${teamId}/cancel?at_period_end=${atPeriodEnd}`, {
      method: 'POST',
    })
  }

  // Payment Methods
  async addPaymentMethod(
    teamId: number,
    paymentMethodId: string
  ): Promise<PaymentMethod> {
    return this.request(`/payments/${teamId}/payment-methods`, {
      method: 'POST',
      body: JSON.stringify({ payment_method_id: paymentMethodId }),
    })
  }

  // Payment History
  async getPayments(
    teamId: number,
    skip: number = 0,
    limit: number = 50
  ): Promise<Payment[]> {
    return this.request(`/payments/${teamId}/payments?skip=${skip}&limit=${limit}`)
  }

  // Invoices
  async getInvoices(
    teamId: number,
    skip: number = 0,
    limit: number = 50
  ): Promise<Invoice[]> {
    return this.request(`/payments/${teamId}/invoices?skip=${skip}&limit=${limit}`)
  }

  // Usage Tracking
  async recordUsage(
    teamId: number,
    metric: string,
    quantity: number
  ): Promise<UsageRecord> {
    return this.request(`/payments/${teamId}/usage`, {
      method: 'POST',
      body: JSON.stringify({ metric, quantity }),
    })
  }
}

export const paymentsAPI = new PaymentsAPI()