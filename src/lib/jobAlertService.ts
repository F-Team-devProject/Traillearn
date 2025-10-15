import { supabase } from './supabase'
import { JobAlert } from '@/types'

export interface JobAlertRequest {
  userId: string
  country: string
  domain: string
  jobType: 'full_time' | 'part_time' | 'internship' | 'contract'
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive'
  salaryRange?: {
    min: number
    max: number
    currency: string
  }
  location?: string
  remote?: boolean
  notes?: string
}

export interface JobApplication {
  id: string
  alertId: string
  userId: string
  mentorId: string
  jobTitle: string
  company: string
  status: 'applied' | 'interview_scheduled' | 'interview_completed' | 'offer_received' | 'hired' | 'rejected'
  applicationDate: string
  interviewDate?: string
  offerDate?: string
  salary?: number
  currency?: string
  mentorCommission?: number
  platformCommission?: number
  notes?: string
}

export const jobAlertService = {
  // Créer une alerte emploi
  async createJobAlert(request: JobAlertRequest): Promise<{ 
    alert: JobAlert | null, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('job_alerts')
        .insert({
          user_id: request.userId,
          country: request.country,
          domain: request.domain,
          job_type: request.jobType,
          experience_level: request.experienceLevel,
          salary_range: request.salaryRange,
          location: request.location,
          remote: request.remote || false,
          notes: request.notes,
          status: 'active',
          created_at: new Date().toISOString()
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
  async getUserJobAlerts(userId: string): Promise<{ 
    alerts: JobAlert[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('job_alerts')
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

  // Récupérer les alertes disponibles pour les mentors
  async getAvailableJobAlerts(mentorId: string, filters?: {
    domain?: string
    country?: string
    experienceLevel?: string
  }): Promise<{ 
    alerts: JobAlert[], 
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('job_alerts')
        .select(`
          *,
          user:users!job_alerts_user_id_fkey (
            first_name,
            last_name,
            email,
            profile_picture
          )
        `)
        .eq('status', 'active')
        .neq('user_id', mentorId) // Exclure les propres alertes du mentor

      if (filters?.domain) {
        query = query.eq('domain', filters.domain)
      }
      if (filters?.country) {
        query = query.eq('country', filters.country)
      }
      if (filters?.experienceLevel) {
        query = query.eq('experience_level', filters.experienceLevel)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        return { alerts: [], error: error.message }
      }

      return { alerts: data || [], error: null }
    } catch (error) {
      return { alerts: [], error: 'Une erreur est survenue' }
    }
  },

  // Assigner un mentor à une alerte
  async assignMentorToAlert(alertId: string, mentorId: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('job_alerts')
        .update({
          assigned_mentor_id: mentorId,
          status: 'assigned',
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

  // Mettre à jour le statut d'une alerte
  async updateAlertStatus(alertId: string, status: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('job_alerts')
        .update({
          status,
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
  async deleteJobAlert(alertId: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('job_alerts')
        .update({
          status: 'deleted',
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

  // Créer une candidature à un emploi
  async createJobApplication(application: Omit<JobApplication, 'id'>): Promise<{ 
    success: boolean, 
    application?: JobApplication, 
    error?: string 
  }> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert(application)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, application: data }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Mettre à jour le statut d'une candidature
  async updateApplicationStatus(applicationId: string, status: string, updates?: {
    interviewDate?: string
    offerDate?: string
    salary?: number
    currency?: string
    notes?: string
  }): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (updates) {
        Object.assign(updateData, updates)
      }

      // Si l'utilisateur est embauché, calculer les commissions
      if (status === 'hired' && updates?.salary) {
        const commissionRate = 0.1 // 10% de commission
        const mentorRate = 0.7 // 70% pour le mentor
        const platformRate = 0.3 // 30% pour la plateforme
        
        const totalCommission = updates.salary * commissionRate
        updateData.mentor_commission = totalCommission * mentorRate
        updateData.platform_commission = totalCommission * platformRate
      }

      const { error } = await supabase
        .from('job_applications')
        .update(updateData)
        .eq('id', applicationId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les candidatures d'un utilisateur
  async getUserApplications(userId: string): Promise<{ 
    applications: JobApplication[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          alert:job_alerts!job_applications_alert_id_fkey (
            domain,
            country
          ),
          mentor:mentors!job_applications_mentor_id_fkey (
            name,
            users (
              first_name,
              last_name
            )
          )
        `)
        .eq('user_id', userId)
        .order('application_date', { ascending: false })

      if (error) {
        return { applications: [], error: error.message }
      }

      return { applications: data || [], error: null }
    } catch (error) {
      return { applications: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les candidatures gérées par un mentor
  async getMentorApplications(mentorId: string): Promise<{ 
    applications: JobApplication[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          alert:job_alerts!job_applications_alert_id_fkey (
            domain,
            country,
            user_id
          ),
          user:users!job_alerts_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .eq('mentor_id', mentorId)
        .order('application_date', { ascending: false })

      if (error) {
        return { applications: [], error: error.message }
      }

      return { applications: data || [], error: null }
    } catch (error) {
      return { applications: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les statistiques d'un mentor
  async getMentorJobStats(mentorId: string): Promise<{ 
    stats: {
      totalApplications: number
      hiredApplications: number
      totalCommission: number
      successRate: number
    }, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('status, mentor_commission')
        .eq('mentor_id', mentorId)

      if (error) {
        return { 
          stats: { totalApplications: 0, hiredApplications: 0, totalCommission: 0, successRate: 0 }, 
          error: error.message 
        }
      }

      const totalApplications = data?.length || 0
      const hiredApplications = data?.filter(app => app.status === 'hired').length || 0
      const totalCommission = data?.reduce((sum, app) => sum + (app.mentor_commission || 0), 0) || 0
      const successRate = totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0

      return {
        stats: {
          totalApplications,
          hiredApplications,
          totalCommission,
          successRate
        },
        error: null
      }
    } catch (error) {
      return { 
        stats: { totalApplications: 0, hiredApplications: 0, totalCommission: 0, successRate: 0 }, 
        error: 'Une erreur est survenue' 
      }
    }
  },

  // Récupérer les domaines populaires
  async getPopularDomains(): Promise<{ 
    domains: Array<{ domain: string, count: number }>, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('job_alerts')
        .select('domain')
        .eq('status', 'active')

      if (error) {
        return { domains: [], error: error.message }
      }

      const domainCounts = data?.reduce((acc: Record<string, number>, alert) => {
        acc[alert.domain] = (acc[alert.domain] || 0) + 1
        return acc
      }, {}) || {}

      const domains = Object.entries(domainCounts)
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return { domains, error: null }
    } catch (error) {
      return { domains: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les pays populaires
  async getPopularCountries(): Promise<{ 
    countries: Array<{ country: string, count: number }>, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('job_alerts')
        .select('country')
        .eq('status', 'active')

      if (error) {
        return { countries: [], error: error.message }
      }

      const countryCounts = data?.reduce((acc: Record<string, number>, alert) => {
        acc[alert.country] = (acc[alert.country] || 0) + 1
        return acc
      }, {}) || {}

      const countries = Object.entries(countryCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      return { countries, error: null }
    } catch (error) {
      return { countries: [], error: 'Une erreur est survenue' }
    }
  },

  // Rechercher des alertes avec filtres
  async searchJobAlerts(filters: {
    domain?: string
    country?: string
    experienceLevel?: string
    jobType?: string
    remote?: boolean
    limit?: number
  }): Promise<{ 
    alerts: JobAlert[], 
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('job_alerts')
        .select(`
          *,
          user:users!job_alerts_user_id_fkey (
            first_name,
            last_name,
            profile_picture
          )
        `)
        .eq('status', 'active')

      if (filters.domain) {
        query = query.eq('domain', filters.domain)
      }
      if (filters.country) {
        query = query.eq('country', filters.country)
      }
      if (filters.experienceLevel) {
        query = query.eq('experience_level', filters.experienceLevel)
      }
      if (filters.jobType) {
        query = query.eq('job_type', filters.jobType)
      }
      if (filters.remote !== undefined) {
        query = query.eq('remote', filters.remote)
      }

      query = query.order('created_at', { ascending: false })

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        return { alerts: [], error: error.message }
      }

      return { alerts: data || [], error: null }
    } catch (error) {
      return { alerts: [], error: 'Une erreur est survenue' }
    }
  }
}
