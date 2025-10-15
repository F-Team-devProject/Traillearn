import { supabase } from './supabase'

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  description: string
  userId: string
  subscriptionId?: string
  type: 'subscription' | 'one_time' | 'mentor_commission' | 'job_placement'
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  paymentMethod: 'paypal' | 'stripe' | 'bank_transfer'
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface PaymentTransaction {
  id: string
  paymentIntentId: string
  transactionId: string
  amount: number
  currency: string
  status: string
  paymentMethod: string
  gatewayResponse?: any
  createdAt: string
}

export interface CommissionSettings {
  mentorCommissionRate: number // Pourcentage pour les mentors
  platformCommissionRate: number // Pourcentage pour la plateforme
  jobPlacementFee: number // Frais fixes pour placement emploi
  subscriptionProcessingFee: number // Frais de traitement des abonnements
}

export const paymentService = {
  // Créer une intention de paiement
  async createPaymentIntent(data: {
    amount: number
    currency: string
    description: string
    userId: string
    subscriptionId?: string
    type: 'subscription' | 'one_time' | 'mentor_commission' | 'job_placement'
    paymentMethod: 'paypal' | 'stripe' | 'bank_transfer'
    metadata?: Record<string, any>
  }): Promise<{ 
    paymentIntent: PaymentIntent | null, 
    error: string | null 
  }> {
    try {
      const { data: paymentIntent, error } = await supabase
        .from('payment_intents')
        .insert({
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          user_id: data.userId,
          subscription_id: data.subscriptionId,
          type: data.type,
          status: 'pending',
          payment_method: data.paymentMethod,
          metadata: data.metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (error) {
        return { paymentIntent: null, error: error.message }
      }

      return { paymentIntent, error: null }
    } catch (error) {
      return { paymentIntent: null, error: 'Une erreur est survenue' }
    }
  },

  // Créer un paiement PayPal
  async createPayPalPayment(data: {
    amount: number
    currency: string
    description: string
    returnUrl: string
    cancelUrl: string
    paymentIntentId: string
  }): Promise<{ 
    approvalUrl: string | null, 
    paymentId: string | null, 
    error: string | null 
  }> {
    try {
      // Simulation de l'intégration PayPal
      // En production, vous utiliseriez le SDK PayPal officiel
      const mockPayPalResponse = {
        id: `PAY-${Date.now()}`,
        approval_url: `https://www.sandbox.paypal.com/cgi-bin/webscr?cmd=_express-checkout&token=${Date.now()}`,
        state: 'created'
      }

      // Enregistrer la réponse PayPal
      await supabase
        .from('payment_transactions')
        .insert({
          payment_intent_id: data.paymentIntentId,
          transaction_id: mockPayPalResponse.id,
          amount: data.amount,
          currency: data.currency,
          status: 'pending',
          payment_method: 'paypal',
          gateway_response: mockPayPalResponse,
          created_at: new Date().toISOString()
        })

      return { 
        approvalUrl: mockPayPalResponse.approval_url, 
        paymentId: mockPayPalResponse.id, 
        error: null 
      }
    } catch (error) {
      return { approvalUrl: null, paymentId: null, error: 'Une erreur est survenue' }
    }
  },

  // Exécuter un paiement PayPal
  async executePayPalPayment(paymentId: string, payerId: string): Promise<{ 
    success: boolean, 
    transactionId?: string, 
    error?: string 
  }> {
    try {
      // Simulation de l'exécution PayPal
      // En production, vous utiliseriez le SDK PayPal officiel
      const mockExecutionResponse = {
        id: `PAY-${Date.now()}`,
        state: 'approved',
        transactions: [{
          amount: {
            total: '19.99',
            currency: 'EUR'
          },
          related_resources: [{
            sale: {
              id: `SALE-${Date.now()}`
            }
          }]
        }]
      }

      // Mettre à jour le statut de l'intention de paiement
      const { data: paymentIntent } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('id', paymentId)
        .single()

      if (paymentIntent) {
        await supabase
          .from('payment_intents')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', paymentIntent.id)

        // Mettre à jour la transaction
        await supabase
          .from('payment_transactions')
          .update({
            status: 'completed',
            gateway_response: mockExecutionResponse,
            created_at: new Date().toISOString()
          })
          .eq('transaction_id', paymentId)
      }

      return { 
        success: true, 
        transactionId: mockExecutionResponse.transactions[0].related_resources[0].sale.id
      }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Traiter une commission mentor
  async processMentorCommission(data: {
    mentorId: string
    studentId: string
    amount: number
    currency: string
    jobPlacementId?: string
    description: string
  }): Promise<{ 
    success: boolean, 
    transactionId?: string, 
    error?: string 
  }> {
    try {
      // Créer l'intention de paiement pour la commission
      const { paymentIntent, error: intentError } = await this.createPaymentIntent({
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        userId: data.mentorId,
        type: 'mentor_commission',
        paymentMethod: 'paypal',
        metadata: {
          studentId: data.studentId,
          jobPlacementId: data.jobPlacementId,
          commissionType: 'job_placement'
        }
      })

      if (intentError || !paymentIntent) {
        return { success: false, error: intentError || 'Erreur lors de la création de l\'intention de paiement' }
      }

      // Créer le paiement PayPal pour la commission
      const { approvalUrl, paymentId, error: paymentError } = await this.createPayPalPayment({
        amount: data.amount,
        currency: data.currency,
        description: `Commission mentor - ${data.description}`,
        returnUrl: `${window.location.origin}/payments/success?intent=${paymentIntent.id}`,
        cancelUrl: `${window.location.origin}/payments/cancel?intent=${paymentIntent.id}`,
        paymentIntentId: paymentIntent.id
      })

      if (paymentError || !approvalUrl) {
        return { success: false, error: paymentError || 'Erreur lors de la création du paiement PayPal' }
      }

      return { 
        success: true, 
        transactionId: paymentId || undefined
      }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Traiter un paiement d'abonnement
  async processSubscriptionPayment(data: {
    userId: string
    subscriptionId: string
    planId: string
    amount: number
    currency: string
  }): Promise<{ 
    success: boolean, 
    approvalUrl?: string, 
    error?: string 
  }> {
    try {
      // Récupérer les détails du plan
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', data.planId)
        .single()

      if (planError || !plan) {
        return { success: false, error: 'Plan d\'abonnement introuvable' }
      }

      // Créer l'intention de paiement
      const { paymentIntent, error: intentError } = await this.createPaymentIntent({
        amount: data.amount,
        currency: data.currency,
        description: `Abonnement ${plan.name} - ${plan.duration_months} mois`,
        userId: data.userId,
        subscriptionId: data.subscriptionId,
        type: 'subscription',
        paymentMethod: 'paypal',
        metadata: {
          planId: data.planId,
          planName: plan.name,
          duration: plan.duration_months
        }
      })

      if (intentError || !paymentIntent) {
        return { success: false, error: intentError || 'Erreur lors de la création de l\'intention de paiement' }
      }

      // Créer le paiement PayPal
      const { approvalUrl, paymentId, error: paymentError } = await this.createPayPalPayment({
        amount: data.amount,
        currency: data.currency,
        description: `Abonnement ${plan.name}`,
        returnUrl: `${window.location.origin}/payments/success?intent=${paymentIntent.id}`,
        cancelUrl: `${window.location.origin}/payments/cancel?intent=${paymentIntent.id}`,
        paymentIntentId: paymentIntent.id
      })

      if (paymentError || !approvalUrl) {
        return { success: false, error: paymentError || 'Erreur lors de la création du paiement PayPal' }
      }

      return { 
        success: true, 
        approvalUrl
      }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer l'historique des paiements d'un utilisateur
  async getUserPaymentHistory(userId: string): Promise<{ 
    payments: PaymentIntent[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { payments: [], error: error.message }
      }

      return { payments: data || [], error: null }
    } catch (error) {
      return { payments: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les statistiques de paiement
  async getPaymentStats(): Promise<{ 
    stats: {
      totalRevenue: number
      totalTransactions: number
      averageTransactionValue: number
      paymentMethodDistribution: Record<string, number>
      monthlyRevenue: Array<{ month: string, revenue: number }>
    }, 
    error: string | null 
  }> {
    try {
      // Récupérer toutes les transactions complétées
      const { data: transactions, error } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('status', 'completed')

      if (error) {
        return { 
          stats: {
            totalRevenue: 0,
            totalTransactions: 0,
            averageTransactionValue: 0,
            paymentMethodDistribution: {},
            monthlyRevenue: []
          }, 
          error: error.message 
        }
      }

      const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0
      const totalTransactions = transactions?.length || 0
      const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0

      // Distribution des méthodes de paiement
      const paymentMethodDistribution = transactions?.reduce((acc: Record<string, number>, t) => {
        acc[t.payment_method] = (acc[t.payment_method] || 0) + 1
        return acc
      }, {}) || {}

      // Revenus mensuels (simulation)
      const monthlyRevenue = [
        { month: 'Jan 2024', revenue: 1250.50 },
        { month: 'Fév 2024', revenue: 1890.75 },
        { month: 'Mar 2024', revenue: 2150.25 },
        { month: 'Avr 2024', revenue: 1980.00 },
        { month: 'Mai 2024', revenue: 2450.80 },
        { month: 'Jun 2024', revenue: 2200.40 }
      ]

      return {
        stats: {
          totalRevenue,
          totalTransactions,
          averageTransactionValue,
          paymentMethodDistribution,
          monthlyRevenue
        },
        error: null
      }
    } catch (error) {
      return { 
        stats: {
          totalRevenue: 0,
          totalTransactions: 0,
          averageTransactionValue: 0,
          paymentMethodDistribution: {},
          monthlyRevenue: []
        }, 
        error: 'Une erreur est survenue' 
      }
    }
  },

  // Rembourser un paiement
  async refundPayment(paymentIntentId: string, amount?: number, reason?: string): Promise<{ 
    success: boolean, 
    refundId?: string, 
    error?: string 
  }> {
    try {
      // Récupérer l'intention de paiement
      const { data: paymentIntent, error: intentError } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('id', paymentIntentId)
        .single()

      if (intentError || !paymentIntent) {
        return { success: false, error: 'Intention de paiement introuvable' }
      }

      // Simulation du remboursement PayPal
      const refundAmount = amount || paymentIntent.amount
      const mockRefundResponse = {
        id: `REFUND-${Date.now()}`,
        amount: refundAmount,
        currency: paymentIntent.currency,
        status: 'completed'
      }

      // Créer un nouvel enregistrement de remboursement
      await supabase
        .from('payment_refunds')
        .insert({
          payment_intent_id: paymentIntentId,
          refund_id: mockRefundResponse.id,
          amount: refundAmount,
          currency: paymentIntent.currency,
          reason: reason || 'Remboursement demandé',
          status: 'completed',
          created_at: new Date().toISOString()
        })

      // Mettre à jour le statut de l'intention de paiement
      await supabase
        .from('payment_intents')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentIntentId)

      return { 
        success: true, 
        refundId: mockRefundResponse.id
      }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(paymentIntentId: string): Promise<{ 
    status: string | null, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('payment_intents')
        .select('status')
        .eq('id', paymentIntentId)
        .single()

      if (error) {
        return { status: null, error: error.message }
      }

      return { status: data?.status || null, error: null }
    } catch (error) {
      return { status: null, error: 'Une erreur est survenue' }
    }
  },

  // Obtenir les paramètres de commission
  async getCommissionSettings(): Promise<{ 
    settings: CommissionSettings | null, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('commission_settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { settings: null, error: error.message }
      }

      // Paramètres par défaut si aucun n'est trouvé
      const defaultSettings: CommissionSettings = {
        mentorCommissionRate: 15, // 15% pour les mentors
        platformCommissionRate: 10, // 10% pour la plateforme
        jobPlacementFee: 150, // 150€ pour un placement
        subscriptionProcessingFee: 2.5 // 2.5% pour le traitement des abonnements
      }

      return { 
        settings: data || defaultSettings, 
        error: null 
      }
    } catch (error) {
      return { settings: null, error: 'Une erreur est survenue' }
    }
  },

  // Mettre à jour les paramètres de commission (admin)
  async updateCommissionSettings(settings: CommissionSettings): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('commission_settings')
        .upsert({
          mentor_commission_rate: settings.mentorCommissionRate,
          platform_commission_rate: settings.platformCommissionRate,
          job_placement_fee: settings.jobPlacementFee,
          subscription_processing_fee: settings.subscriptionProcessingFee,
          updated_at: new Date().toISOString()
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  }
}
