import { supabase } from './supabase'
import { ScholarshipExtended, ScholarshipFavorite, ScholarshipAlert } from '@/types'

export interface ScholarshipFilters {
  countries?: string[]
  levels?: string[]
  fields?: string[]
  languages?: string[]
  minAmount?: number
  maxAmount?: number
  deadlineBefore?: string
  searchTerm?: string
}

export const scholarshipService = {
  // Récupérer toutes les bourses avec filtres
  async getScholarships(filters?: ScholarshipFilters): Promise<{ 
    scholarships: ScholarshipExtended[], 
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('scholarships')
        .select('*')
        .eq('is_active', true)

      if (filters) {
        if (filters.countries && filters.countries.length > 0) {
          query = query.in('country', filters.countries)
        }

        if (filters.levels && filters.levels.length > 0) {
          query = query.in('level', filters.levels)
        }

        if (filters.minAmount) {
          query = query.gte('amount', filters.minAmount)
        }

        if (filters.maxAmount) {
          query = query.lte('amount', filters.maxAmount)
        }

        if (filters.deadlineBefore) {
          query = query.lte('deadline', filters.deadlineBefore)
        }

        if (filters.searchTerm) {
          query = query.or(`title.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`)
        }
      }

      const { data, error } = await query.order('deadline', { ascending: true })

      if (error) {
        return { scholarships: [], error: error.message }
      }

      return { scholarships: data || [], error: null }
    } catch (error) {
      return { scholarships: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer une bourse par ID
  async getScholarshipById(id: string): Promise<{ 
    scholarship: ScholarshipExtended | null, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        return { scholarship: null, error: error.message }
      }

      return { scholarship: data, error: null }
    } catch (error) {
      return { scholarship: null, error: 'Une erreur est survenue' }
    }
  },

  // Ajouter une bourse aux favoris
  async addToFavorites(userId: string, scholarshipId: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      // Vérifier si la bourse existe déjà dans les favoris
      const { data: existing } = await supabase
        .from('scholarship_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('scholarship_id', scholarshipId)
        .single()

      if (existing) {
        return { success: false, error: 'Cette bourse est déjà dans vos favoris' }
      }

      const { error } = await supabase
        .from('scholarship_favorites')
        .insert({
          user_id: userId,
          scholarship_id: scholarshipId
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Supprimer une bourse des favoris
  async removeFromFavorites(userId: string, scholarshipId: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('scholarship_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('scholarship_id', scholarshipId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les favoris d'un utilisateur
  async getFavorites(userId: string): Promise<{ 
    favorites: ScholarshipFavorite[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('scholarship_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { favorites: [], error: error.message }
      }

      return { favorites: data || [], error: null }
    } catch (error) {
      return { favorites: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les bourses favorites avec détails
  async getFavoriteScholarships(userId: string): Promise<{ 
    scholarships: ScholarshipExtended[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('scholarship_favorites')
        .select(`
          *,
          scholarships (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { scholarships: [], error: error.message }
      }

      const scholarships = data?.map(item => item.scholarships).filter(Boolean) || []
      return { scholarships, error: null }
    } catch (error) {
      return { scholarships: [], error: 'Une erreur est survenue' }
    }
  },

  // Créer une alerte de bourse
  async createAlert(userId: string, alertData: {
    name: string
    filters: ScholarshipFilters
  }): Promise<{ 
    alert: ScholarshipAlert | null, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('scholarship_alerts')
        .insert({
          user_id: userId,
          name: alertData.name,
          filters: alertData.filters,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        return { alert: null, error: error.message }
      }

      return { alert: data, error: null }
    } catch (error) {
      return { alert: null, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les alertes d'un utilisateur
  async getAlerts(userId: string): Promise<{ 
    alerts: ScholarshipAlert[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('scholarship_alerts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { alerts: [], error: error.message }
      }

      return { alerts: data || [], error: null }
    } catch (error) {
      return { alerts: [], error: 'Une erreur est survenue' }
    }
  },

  // Mettre à jour une alerte
  async updateAlert(alertId: string, updates: Partial<ScholarshipAlert>): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('scholarship_alerts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Supprimer une alerte
  async deleteAlert(alertId: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('scholarship_alerts')
        .delete()
        .eq('id', alertId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Vérifier les alertes et envoyer des notifications
  async checkAlertsAndNotify(): Promise<{ 
    notificationsSent: number, 
    error: string | null 
  }> {
    try {
      // Récupérer toutes les alertes actives
      const { data: alerts, error: alertsError } = await supabase
        .from('scholarship_alerts')
        .select('*')
        .eq('is_active', true)

      if (alertsError) {
        return { notificationsSent: 0, error: alertsError.message }
      }

      let notificationsSent = 0

      for (const alert of alerts || []) {
        // Récupérer les bourses correspondant aux critères de l'alerte
        const { scholarships } = await this.getScholarships(alert.filters)
        
        // Filtrer les bourses qui n'ont pas encore été notifiées
        const newScholarships = scholarships.filter(scholarship => {
          // Vérifier si cette bourse a déjà été notifiée pour cette alerte
          // (nécessiterait une table de suivi des notifications)
          return true // Pour l'instant, on notifie toutes les bourses
        })

        if (newScholarships.length > 0) {
          // Envoyer une notification (email/SMS)
          // Cette fonctionnalité nécessiterait l'intégration d'un service de notification
          console.log(`Notification envoyée pour ${newScholarships.length} nouvelles bourses`)
          notificationsSent++
        }

        // Mettre à jour la date de dernière vérification
        await this.updateAlert(alert.id, {
          last_triggered: new Date().toISOString()
        })
      }

      return { notificationsSent, error: null }
    } catch (error) {
      return { notificationsSent: 0, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les statistiques des bourses
  async getScholarshipStats(): Promise<{ 
    stats: {
      total: number
      byCountry: Record<string, number>
      byLevel: Record<string, number>
      totalAmount: number
      averageAmount: number
    }, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('is_active', true)

      if (error) {
        return { stats: { total: 0, byCountry: {}, byLevel: {}, totalAmount: 0, averageAmount: 0 }, error: error.message }
      }

      const scholarships = data || []
      const stats = {
        total: scholarships.length,
        byCountry: scholarships.reduce((acc, scholarship) => {
          acc[scholarship.country] = (acc[scholarship.country] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        byLevel: scholarships.reduce((acc, scholarship) => {
          acc[scholarship.level] = (acc[scholarship.level] || 0) + 1
          return acc
        }, {} as Record<string, number>),
        totalAmount: scholarships.reduce((sum, scholarship) => sum + scholarship.amount, 0),
        averageAmount: scholarships.length > 0 ? 
          scholarships.reduce((sum, scholarship) => sum + scholarship.amount, 0) / scholarships.length : 0
      }

      return { stats, error: null }
    } catch (error) {
      return { stats: { total: 0, byCountry: {}, byLevel: {}, totalAmount: 0, averageAmount: 0 }, error: 'Une erreur est survenue' }
    }
  }
}
