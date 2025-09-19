export const billingTranslations = {
  'en-US': {
    // Page titles and descriptions
    title: 'Billing & Payments',
    description: 'Manage your subscription, payment methods, and billing history',
    
    // Overview cards
    currentPlan: 'Current Plan',
    nextPayment: 'Next Payment',
    monthlyUsage: 'Monthly Usage',
    status: 'Status',
    
    // Plan names
    plans: {
      free: 'Free',
      starter: 'Starter', 
      pro: 'Pro',
      business: 'Business'
    },
    
    // Status
    active: 'Active',
    inactive: 'Inactive',
    pastDue: 'Past Due',
    canceled: 'Canceled',
    
    // Tabs
    tabs: {
      overview: 'Overview',
      plans: 'Plans & Pricing',
      payments: 'Payment Methods',
      history: 'Payment History',
      invoices: 'Invoices',
      usage: 'Usage'
    },
    
    // Pricing plans
    pricing: {
      title: 'Choose Your Plan',
      description: 'Select the perfect plan for your team\'s needs',
      monthly: 'Monthly',
      yearly: 'Yearly',
      mostPopular: 'Most Popular',
      currentPlan: 'Current Plan',
      subscribeTo: 'Subscribe to',
      freeTrial: 'All plans include a 14-day free trial. Cancel anytime.',
      contactSales: 'Contact our sales team',
      customEnterprise: 'Need a custom enterprise plan?'
    },
    
    // Payment methods
    paymentMethods: {
      title: 'Payment Methods',
      description: 'Manage your payment methods and billing preferences',
      addPaymentMethod: 'Add Payment Method',
      noPaymentMethods: 'No Payment Methods',
      noPaymentMethodsDescription: 'Add a payment method to subscribe to paid plans and make payments.',
      addFirstPaymentMethod: 'Add Your First Payment Method',
      setAsDefault: 'Set as Default',
      remove: 'Remove',
      default: 'Default',
      expires: 'Expires',
      security: {
        title: 'Payment Security',
        description: 'Your payment information is secure and encrypted',
        points: [
          'All payment data is encrypted and secured by Stripe',
          'We never store your complete card numbers',
          'Your billing information is protected by industry-standard security',
          'You can update or remove payment methods at any time'
        ]
      }
    },
    
    // Payment history
    paymentHistory: {
      title: 'Payment History',
      description: 'View all your payments and transaction details',
      export: 'Export',
      noPayments: 'No Payments Yet',
      noPaymentsDescription: 'Your payment history will appear here once you make your first payment.',
      viewDetails: 'View Details',
      receipt: 'Receipt',
      info: {
        title: 'Payment Information',
        description: 'Understanding your payment history',
        points: [
          'Payments are processed automatically on your billing date',
          'Failed payments will be retried automatically',
          'You\'ll receive email receipts for all successful payments',
          'Contact support if you have questions about any payment'
        ]
      }
    },
    
    // Invoice history
    invoiceHistory: {
      title: 'Invoice History',
      description: 'View and download your invoices',
      downloadAll: 'Download All',
      noInvoices: 'No Invoices Yet',
      noInvoicesDescription: 'Your invoices will appear here once you have an active subscription.',
      view: 'View',
      pdf: 'PDF',
      payNow: 'Pay Now',
      due: 'Due',
      paid: 'Paid',
      info: {
        title: 'Invoice Information',
        description: 'Understanding your invoices and billing',
        points: [
          'Invoices are generated automatically for your subscription',
          'Payment is attempted immediately when an invoice is created',
          'You\'ll receive email notifications for all invoices',
          'Invoices include detailed breakdown of charges and taxes',
          'Keep invoices for your records and tax purposes'
        ]
      }
    },
    
    // Usage metrics
    usage: {
      title: 'Usage Metrics',
      description: 'Detailed breakdown of your current month usage',
      overview: 'Usage Overview',
      currentMonth: 'Current month usage',
      apiCalls: 'API Calls',
      tokensUsed: 'Tokens Used',
      storage: 'Storage',
      calls: 'calls',
      tokens: 'tokens',
      thisMonth: 'this month',
      high: 'High',
      warning: 'Warning',
      approaching: 'You\'re approaching your {metric} limit. Consider upgrading your plan.',
      info: {
        title: 'Usage Information',
        points: [
          'Usage metrics are updated in real-time',
          'Limits reset at the beginning of each billing cycle',
          'Overage charges may apply if you exceed your plan limits',
          'Upgrade your plan anytime to increase your limits',
          'Contact support if you have questions about usage tracking'
        ]
      }
    },
    
    // Current subscription
    subscription: {
      title: 'Current Subscription',
      description: 'Manage your subscription and billing preferences',
      freePlan: 'You are currently on the free plan',
      freePlanIncludes: 'Free plan includes:',
      upgradeToPro: 'Upgrade to Pro',
      plan: 'Plan',
      billingCycle: 'Billing Cycle',
      maxProjects: 'Max Projects',
      nextBilling: 'Next Billing',
      changePlan: 'Change Plan',
      cancelSubscription: 'Cancel Subscription',
      canceling: 'Canceling...',
      paymentRequired: 'Payment Required',
      pastDueMessage: 'Your subscription is past due. Please update your payment method.',
      updatePaymentMethod: 'Update Payment Method'
    },
    
    // Common actions
    loading: 'Loading...',
    saving: 'Saving...',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    
    // Error messages
    errors: {
      failedToLoad: 'Failed to load billing information',
      failedToSubscribe: 'Failed to create subscription',
      failedToCancel: 'Failed to cancel subscription',
      failedToAddPaymentMethod: 'Failed to add payment method',
      failedToRemovePaymentMethod: 'Failed to remove payment method',
      stripeError: 'Payment processing error',
      networkError: 'Network error. Please try again.'
    },
    
    // Success messages
    success: {
      subscriptionCreated: 'Subscription created successfully',
      subscriptionCanceled: 'Subscription canceled successfully',
      paymentMethodAdded: 'Payment method added successfully',
      paymentMethodRemoved: 'Payment method removed successfully',
      paymentMethodUpdated: 'Payment method updated successfully'
    }
  },
  
  'es-ES': {
    // Page titles and descriptions
    title: 'Facturación y Pagos',
    description: 'Gestiona tu suscripción, métodos de pago e historial de facturación',
    
    // Overview cards
    currentPlan: 'Plan Actual',
    nextPayment: 'Próximo Pago',
    monthlyUsage: 'Uso Mensual',
    status: 'Estado',
    
    // Plan names
    plans: {
      free: 'Gratuito',
      starter: 'Inicial',
      pro: 'Pro',
      business: 'Empresarial'
    },
    
    // Status
    active: 'Activo',
    inactive: 'Inactivo',
    pastDue: 'Vencido',
    canceled: 'Cancelado',
    
    // Tabs
    tabs: {
      overview: 'Resumen',
      plans: 'Planes y Precios',
      payments: 'Métodos de Pago',
      history: 'Historial de Pagos',
      invoices: 'Facturas',
      usage: 'Uso'
    },
    
    // Pricing plans
    pricing: {
      title: 'Elige Tu Plan',
      description: 'Selecciona el plan perfecto para las necesidades de tu equipo',
      monthly: 'Mensual',
      yearly: 'Anual',
      mostPopular: 'Más Popular',
      currentPlan: 'Plan Actual',
      subscribeTo: 'Suscribirse a',
      freeTrial: 'Todos los planes incluyen una prueba gratuita de 14 días. Cancela en cualquier momento.',
      contactSales: 'Contacta nuestro equipo de ventas',
      customEnterprise: '¿Necesitas un plan empresarial personalizado?'
    },
    
    // Payment methods
    paymentMethods: {
      title: 'Métodos de Pago',
      description: 'Gestiona tus métodos de pago y preferencias de facturación',
      addPaymentMethod: 'Agregar Método de Pago',
      noPaymentMethods: 'Sin Métodos de Pago',
      noPaymentMethodsDescription: 'Agrega un método de pago para suscribirte a planes de pago y realizar pagos.',
      addFirstPaymentMethod: 'Agrega Tu Primer Método de Pago',
      setAsDefault: 'Establecer como Predeterminado',
      remove: 'Eliminar',
      default: 'Predeterminado',
      expires: 'Expira',
      security: {
        title: 'Seguridad de Pagos',
        description: 'Tu información de pago es segura y está encriptada',
        points: [
          'Todos los datos de pago están encriptados y protegidos por Stripe',
          'Nunca almacenamos tus números de tarjeta completos',
          'Tu información de facturación está protegida por seguridad estándar de la industria',
          'Puedes actualizar o eliminar métodos de pago en cualquier momento'
        ]
      }
    },
    
    // Payment history
    paymentHistory: {
      title: 'Historial de Pagos',
      description: 'Ve todos tus pagos y detalles de transacciones',
      export: 'Exportar',
      noPayments: 'Aún Sin Pagos',
      noPaymentsDescription: 'Tu historial de pagos aparecerá aquí una vez que hagas tu primer pago.',
      viewDetails: 'Ver Detalles',
      receipt: 'Recibo',
      info: {
        title: 'Información de Pagos',
        description: 'Entendiendo tu historial de pagos',
        points: [
          'Los pagos se procesan automáticamente en tu fecha de facturación',
          'Los pagos fallidos se reintentarán automáticamente',
          'Recibirás recibos por email para todos los pagos exitosos',
          'Contacta soporte si tienes preguntas sobre algún pago'
        ]
      }
    },
    
    // Invoice history
    invoiceHistory: {
      title: 'Historial de Facturas',
      description: 'Ve y descarga tus facturas',
      downloadAll: 'Descargar Todas',
      noInvoices: 'Aún Sin Facturas',
      noInvoicesDescription: 'Tus facturas aparecerán aquí una vez que tengas una suscripción activa.',
      view: 'Ver',
      pdf: 'PDF',
      payNow: 'Pagar Ahora',
      due: 'Vencida',
      paid: 'Pagada',
      info: {
        title: 'Información de Facturas',
        description: 'Entendiendo tus facturas y facturación',
        points: [
          'Las facturas se generan automáticamente para tu suscripción',
          'El pago se intenta inmediatamente cuando se crea una factura',
          'Recibirás notificaciones por email para todas las facturas',
          'Las facturas incluyen desglose detallado de cargos e impuestos',
          'Guarda las facturas para tus registros y propósitos fiscales'
        ]
      }
    },
    
    // Usage metrics
    usage: {
      title: 'Métricas de Uso',
      description: 'Desglose detallado del uso de tu mes actual',
      overview: 'Resumen de Uso',
      currentMonth: 'Uso del mes actual',
      apiCalls: 'Llamadas API',
      tokensUsed: 'Tokens Usados',
      storage: 'Almacenamiento',
      calls: 'llamadas',
      tokens: 'tokens',
      thisMonth: 'este mes',
      high: 'Alto',
      warning: 'Advertencia',
      approaching: 'Te estás acercando a tu límite de {metric}. Considera actualizar tu plan.',
      info: {
        title: 'Información de Uso',
        points: [
          'Las métricas de uso se actualizan en tiempo real',
          'Los límites se reinician al comienzo de cada ciclo de facturación',
          'Pueden aplicarse cargos por exceso si superas los límites de tu plan',
          'Actualiza tu plan en cualquier momento para aumentar tus límites',
          'Contacta soporte si tienes preguntas sobre el seguimiento de uso'
        ]
      }
    },
    
    // Current subscription
    subscription: {
      title: 'Suscripción Actual',
      description: 'Gestiona tu suscripción y preferencias de facturación',
      freePlan: 'Actualmente estás en el plan gratuito',
      freePlanIncludes: 'El plan gratuito incluye:',
      upgradeToPro: 'Actualizar a Pro',
      plan: 'Plan',
      billingCycle: 'Ciclo de Facturación',
      maxProjects: 'Máx. Proyectos',
      nextBilling: 'Próxima Facturación',
      changePlan: 'Cambiar Plan',
      cancelSubscription: 'Cancelar Suscripción',
      canceling: 'Cancelando...',
      paymentRequired: 'Pago Requerido',
      pastDueMessage: 'Tu suscripción está vencida. Por favor actualiza tu método de pago.',
      updatePaymentMethod: 'Actualizar Método de Pago'
    },
    
    // Add more Spanish translations...
    loading: 'Cargando...',
    saving: 'Guardando...',
    cancel: 'Cancelar',
    save: 'Guardar',
    edit: 'Editar',
    delete: 'Eliminar',
    confirm: 'Confirmar',
    
    // Error messages
    errors: {
      failedToLoad: 'Error al cargar información de facturación',
      failedToSubscribe: 'Error al crear suscripción',
      failedToCancel: 'Error al cancelar suscripción',
      failedToAddPaymentMethod: 'Error al agregar método de pago',
      failedToRemovePaymentMethod: 'Error al eliminar método de pago',
      stripeError: 'Error de procesamiento de pago',
      networkError: 'Error de red. Por favor intenta de nuevo.'
    },
    
    // Success messages
    success: {
      subscriptionCreated: 'Suscripción creada exitosamente',
      subscriptionCanceled: 'Suscripción cancelada exitosamente',
      paymentMethodAdded: 'Método de pago agregado exitosamente',
      paymentMethodRemoved: 'Método de pago eliminado exitosamente',
      paymentMethodUpdated: 'Método de pago actualizado exitosamente'
    }
  },
  
  'fr-FR': {
    // Page titles and descriptions
    title: 'Facturation et Paiements',
    description: 'Gérez votre abonnement, méthodes de paiement et historique de facturation',
    
    // Overview cards
    currentPlan: 'Plan Actuel',
    nextPayment: 'Prochain Paiement',
    monthlyUsage: 'Utilisation Mensuelle',
    status: 'Statut',
    
    // Plan names
    plans: {
      free: 'Gratuit',
      starter: 'Débutant',
      pro: 'Pro',
      business: 'Entreprise'
    },
    
    // Status
    active: 'Actif',
    inactive: 'Inactif',
    pastDue: 'En Retard',
    canceled: 'Annulé',
    
    // Add more French translations...
    loading: 'Chargement...',
    saving: 'Enregistrement...',
    cancel: 'Annuler',
    save: 'Sauvegarder',
    edit: 'Modifier',
    delete: 'Supprimer',
    confirm: 'Confirmer'
  },
  
  'de-DE': {
    // Page titles and descriptions
    title: 'Abrechnung & Zahlungen',
    description: 'Verwalten Sie Ihr Abonnement, Zahlungsmethoden und Abrechnungshistorie',
    
    // Overview cards
    currentPlan: 'Aktueller Plan',
    nextPayment: 'Nächste Zahlung',
    monthlyUsage: 'Monatliche Nutzung',
    status: 'Status',
    
    // Plan names
    plans: {
      free: 'Kostenlos',
      starter: 'Starter',
      pro: 'Pro',
      business: 'Business'
    },
    
    // Status
    active: 'Aktiv',
    inactive: 'Inaktiv',
    pastDue: 'Überfällig',
    canceled: 'Gekündigt',
    
    // Add more German translations...
    loading: 'Laden...',
    saving: 'Speichern...',
    cancel: 'Abbrechen',
    save: 'Speichern',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    confirm: 'Bestätigen'
  },
  
  'pt-BR': {
    // Page titles and descriptions
    title: 'Cobrança e Pagamentos',
    description: 'Gerencie sua assinatura, métodos de pagamento e histórico de cobrança',
    
    // Overview cards
    currentPlan: 'Plano Atual',
    nextPayment: 'Próximo Pagamento',
    monthlyUsage: 'Uso Mensal',
    status: 'Status',
    
    // Plan names
    plans: {
      free: 'Gratuito',
      starter: 'Inicial',
      pro: 'Pro',
      business: 'Empresarial'
    },
    
    // Status
    active: 'Ativo',
    inactive: 'Inativo',
    pastDue: 'Em Atraso',
    canceled: 'Cancelado',
    
    // Add more Portuguese translations...
    loading: 'Carregando...',
    saving: 'Salvando...',
    cancel: 'Cancelar',
    save: 'Salvar',
    edit: 'Editar',
    delete: 'Excluir',
    confirm: 'Confirmar'
  }
} as const

export type BillingTranslations = typeof billingTranslations['en-US']
export type SupportedLanguage = keyof typeof billingTranslations