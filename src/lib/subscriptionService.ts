import { supabase } from './supabase'
import { SubscriptionType, UserLevel } from '@/types'

export interface SubscriptionPlan {
  id: string
  name: string
  type: SubscriptionType
  description: string
  price: number
  currency: string
  duration_months: number
  features: string[]
  limitations: {
    max_scholarship_alerts?: number
    max_job_alerts?: number
    max_mentoring_sessions?: number
    ai_orientation_access?: boolean
    priority_support?: boolean
    custom_domains?: boolean
    advanced_analytics?: boolean
  }
  is_popular?: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  plan: SubscriptionPlan
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  startDate: string
  endDate: string
  autoRenew: boolean
  paymentMethod?: string
  lastPaymentDate?: string
  nextPaymentDate?: string
  created_at: string
  updated_at: string
}

export interface SubscriptionUpgrade {
  fromPlan: SubscriptionType
  toPlan: SubscriptionType
  proratedAmount: number
  currency: string
  effectiveDate: string
}

export const subscriptionService = {
  // Récupérer tous les plans d'abonnement
  async getSubscriptionPlans(): Promise<{ 
    plans: SubscriptionPlan[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      if (error) {
        return { plans: [], error: error.message }
      }

      return { plans: data || [], error: null }
    } catch (error) {
      return { plans: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer l'abonnement d'un utilisateur
  async getUserSubscription(userId: string): Promise<{ 
    subscription: UserSubscription | null, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans!user_subscriptions_plan_id_fkey (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { subscription: null, error: error.message }
      }

      return { subscription: data || null, error: null }
    } catch (error) {
      return { subscription: null, error: 'Une erreur est survenue' }
    }
  },

  // Créer un nouvel abonnement
  async createSubscription(userId: string, planId: string, paymentData?: {
    paymentMethod: string
    transactionId: string
  }): Promise<{ 
    subscription: UserSubscription | null, 
    error: string | null 
  }> {
    try {
      // Récupérer le plan
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single()

      if (planError || !plan) {
        return { subscription: null, error: 'Plan d\'abonnement introuvable' }
      }

      // Calculer les dates
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + plan.duration_months)

      // Créer l'abonnement
      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          auto_renew: true,
          payment_method: paymentData?.paymentMethod,
          last_payment_date: paymentData ? startDate.toISOString() : null,
          next_payment_date: endDate.toISOString()
        })
        .select(`
          *,
          plan:subscription_plans!user_subscriptions_plan_id_fkey (*)
        `)
        .single()

      if (error) {
        return { subscription: null, error: error.message }
      }

      // Mettre à jour le type d'abonnement de l'utilisateur
      await supabase
        .from('users')
        .update({
          subscription_type: plan.type,
          subscription_expires_at: endDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      return { subscription, error: null }
    } catch (error) {
      return { subscription: null, error: 'Une erreur est survenue' }
    }
  },

  // Mettre à jour un abonnement
  async updateSubscription(subscriptionId: string, updates: {
    status?: string
    autoRenew?: boolean
    endDate?: string
  }): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Annuler un abonnement
  async cancelSubscription(subscriptionId: string, userId: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      // Mettre à jour le statut de l'abonnement
      const { error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          auto_renew: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)

      if (subscriptionError) {
        return { success: false, error: subscriptionError.message }
      }

      // Revenir au plan gratuit
      await supabase
        .from('users')
        .update({
          subscription_type: 'free',
          subscription_expires_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Upgrader un abonnement
  async upgradeSubscription(userId: string, newPlanId: string): Promise<{ 
    upgrade: SubscriptionUpgrade | null, 
    error: string | null 
  }> {
    try {
      // Récupérer l'abonnement actuel
      const { subscription: currentSubscription } = await this.getUserSubscription(userId)
      
      if (!currentSubscription) {
        return { upgrade: null, error: 'Aucun abonnement actif trouvé' }
      }

      // Récupérer le nouveau plan
      const { data: newPlan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', newPlanId)
        .single()

      if (planError || !newPlan) {
        return { upgrade: null, error: 'Nouveau plan introuvable' }
      }

      // Calculer le montant proratisé
      const remainingDays = Math.max(0, 
        Math.ceil((new Date(currentSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      )
      
      const totalDays = Math.ceil((new Date(currentSubscription.endDate).getTime() - new Date(currentSubscription.startDate).getTime()) / (1000 * 60 * 60 * 24))
      const remainingRatio = remainingDays / totalDays
      
      const currentPlanPrice = currentSubscription.plan.price * remainingRatio
      const newPlanPrice = newPlan.price * (newPlan.duration_months / currentSubscription.plan.duration_months)
      const proratedAmount = Math.max(0, newPlanPrice - currentPlanPrice)

      const upgrade: SubscriptionUpgrade = {
        fromPlan: currentSubscription.plan.type,
        toPlan: newPlan.type,
        proratedAmount,
        currency: newPlan.currency,
        effectiveDate: new Date().toISOString()
      }

      return { upgrade, error: null }
    } catch (error) {
      return { upgrade: null, error: 'Une erreur est survenue' }
    }
  },

  // Vérifier les limites d'un utilisateur
  async checkUserLimits(userId: string, feature: string): Promise<{ 
    canUse: boolean, 
    remaining: number, 
    error: string | null 
  }> {
    try {
      const { subscription } = await this.getUserSubscription(userId)
      
      if (!subscription) {
        return { canUse: true, remaining: 999, error: null } // Plan gratuit
      }

      const limits = subscription.plan.limitations
      let limit = 999
      let currentUsage = 0

      switch (feature) {
        case 'scholarship_alerts':
          limit = limits.max_scholarship_alerts || 999
          const { count: scholarshipCount } = await supabase
            .from('scholarship_alerts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true)
          currentUsage = scholarshipCount || 0
          break

        case 'job_alerts':
          limit = limits.max_job_alerts || 999
          const { count: jobCount } = await supabase
            .from('job_alerts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'active')
          currentUsage = jobCount || 0
          break

        case 'mentoring_sessions':
          limit = limits.max_mentoring_sessions || 999
          const { count: sessionCount } = await supabase
            .from('mentoring_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', userId)
            .gte('date', new Date().toISOString())
          currentUsage = sessionCount || 0
          break

        case 'ai_orientation':
          return { 
            canUse: limits.ai_orientation_access !== false, 
            remaining: limits.ai_orientation_access !== false ? 999 : 0, 
            error: null 
          }

        default:
          return { canUse: true, remaining: 999, error: null }
      }

      const canUse = currentUsage < limit
      const remaining = Math.max(0, limit - currentUsage)

      return { canUse, remaining, error: null }
    } catch (error) {
      return { canUse: false, remaining: 0, error: 'Une erreur est survenue' }
    }
  },

  // Calculer les points et niveaux d'utilisateur
  async calculateUserLevel(userId: string): Promise<{ 
    level: UserLevel, 
    points: number, 
    nextLevelPoints: number, 
    error: string | null 
  }> {
    try {
      // Récupérer les points actuels
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single()

      if (userError) {
        return { level: 'bronze', points: 0, nextLevelPoints: 100, error: userError.message }
      }

      const points = user?.points || 0

      // Définir les seuils de niveaux
      const levelThresholds = {
        bronze: 0,
        silver: 500,
        gold: 1500,
        platinum: 5000
      }

      let currentLevel: UserLevel = 'bronze'
      let nextLevelPoints = levelThresholds.silver

      if (points >= levelThresholds.platinum) {
        currentLevel = 'platinum'
        nextLevelPoints = levelThresholds.platinum + 1000
      } else if (points >= levelThresholds.gold) {
        currentLevel = 'gold'
        nextLevelPoints = levelThresholds.platinum
      } else if (points >= levelThresholds.silver) {
        currentLevel = 'silver'
        nextLevelPoints = levelThresholds.gold
      }

      // Mettre à jour le niveau de l'utilisateur si nécessaire
      const { data: currentUser } = await supabase
        .from('users')
        .select('level')
        .eq('id', userId)
        .single()

      if (currentUser?.level !== currentLevel) {
        await supabase
          .from('users')
          .update({
            level: currentLevel,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
      }

      return { level: currentLevel, points, nextLevelPoints, error: null }
    } catch (error) {
      return { level: 'bronze', points: 0, nextLevelPoints: 100, error: 'Une erreur est survenue' }
    }
  },

  // Ajouter des points à un utilisateur
  async addUserPoints(userId: string, points: number, reason: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      // Ajouter les points
      // Récupérer les points actuels et les mettre à jour
      const { data: currentUser } = await supabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single()

      if (!currentUser) {
        return { success: false, error: 'Utilisateur non trouvé' }
      }

      const { error } = await supabase
        .from('users')
        .update({
          points: (currentUser.points || 0) + points,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      // Enregistrer l'action dans l'historique
      await supabase
        .from('user_points_history')
        .insert({
          user_id: userId,
          points,
          reason,
          created_at: new Date().toISOString()
        })

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer l'historique des points
  async getUserPointsHistory(userId: string): Promise<{ 
    history: Array<{
      id: string
      points: number
      reason: string
      created_at: string
    }>, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('user_points_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { history: [], error: error.message }
      }

      return { history: data || [], error: null }
    } catch (error) {
      return { history: [], error: 'Une erreur est survenue' }
    }
  },

  // Obtenir les statistiques d'abonnement
  async getSubscriptionStats(): Promise<{ 
    stats: {
      totalActiveSubscriptions: number
      totalRevenue: number
      popularPlans: Array<{ plan: string, count: number }>
      conversionRate: number
    }, 
    error: string | null 
  }> {
    try {
      const { data: activeSubscriptions, error: activeError } = await supabase
        .from('user_subscriptions')
        .select(`
          id,
          plan:subscription_plans!user_subscriptions_plan_id_fkey (
            name,
            price,
            currency
          )
        `)
        .eq('status', 'active')

      if (activeError) {
        return { 
          stats: { totalActiveSubscriptions: 0, totalRevenue: 0, popularPlans: [], conversionRate: 0 }, 
          error: activeError.message 
        }
      }

      const totalActiveSubscriptions = activeSubscriptions?.length || 0
      const totalRevenue = activeSubscriptions?.reduce((sum, sub) => {
        const plan = Array.isArray(sub.plan) ? sub.plan[0] : sub.plan
        return sum + (plan?.price || 0)
      }, 0) || 0

      // Compter les plans populaires
      const planCounts = activeSubscriptions?.reduce((acc: Record<string, number>, sub) => {
        const plan = Array.isArray(sub.plan) ? sub.plan[0] : sub.plan
        const planName = plan?.name || 'Unknown'
        acc[planName] = (acc[planName] || 0) + 1
        return acc
      }, {}) || {}

      const popularPlans = Object.entries(planCounts)
        .map(([plan, count]) => ({ plan, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Calculer le taux de conversion (simulation)
      const conversionRate = totalActiveSubscriptions > 0 ? 15.5 : 0

      return {
        stats: {
          totalActiveSubscriptions,
          totalRevenue,
          popularPlans,
          conversionRate
        },
        error: null
      }
    } catch (error) {
      return { 
        stats: { totalActiveSubscriptions: 0, totalRevenue: 0, popularPlans: [], conversionRate: 0 }, 
        error: 'Une erreur est survenue' 
      }
    }
  },

  // Vérifier si un abonnement est expiré
  async checkExpiredSubscriptions(): Promise<{ 
    expiredCount: number, 
    error: string | null 
  }> {
    try {
      const now = new Date().toISOString()

      // Récupérer les abonnements expirés
      const { data: expiredSubscriptions, error } = await supabase
        .from('user_subscriptions')
        .select('id, user_id')
        .eq('status', 'active')
        .lt('end_date', now)

      if (error) {
        return { expiredCount: 0, error: error.message }
      }

      const expiredCount = expiredSubscriptions?.length || 0

      // Mettre à jour le statut des abonnements expirés
      if (expiredCount > 0) {
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'expired',
            updated_at: now
          })
          .eq('status', 'active')
          .lt('end_date', now)

        // Revenir au plan gratuit pour les utilisateurs expirés
        const userIds = expiredSubscriptions?.map(sub => sub.user_id) || []
        if (userIds.length > 0) {
          await supabase
            .from('users')
            .update({
              subscription_type: 'free',
              subscription_expires_at: null,
              updated_at: now
            })
            .in('id', userIds)
        }
      }

      return { expiredCount, error: null }
    } catch (error) {
      return { expiredCount: 0, error: 'Une erreur est survenue' }
    }
  }
}
