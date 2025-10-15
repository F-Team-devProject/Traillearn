import { supabase } from './supabase'
import { MentoringSessionExtended, SessionChecklistItem, FeedbackRating } from '@/types'

export interface SessionRequest {
  mentorId: string
  studentId: string
  subject: string
  sessionType: 'academic' | 'career' | 'integration' | 'job_preparation'
  preferredDate: string
  preferredTime: string
  duration: number
  objectives: string[]
  notes?: string
}

export interface SessionUpdate {
  status?: 'scheduled' | 'completed' | 'cancelled' | 'in_progress'
  objectives?: string[]
  outcomes?: string[]
  notes?: string
  follow_up_required?: boolean
  follow_up_date?: string
}

export const mentoringService = {
  // Créer une demande de session
  async createSessionRequest(request: SessionRequest): Promise<{ 
    session: MentoringSessionExtended | null, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('mentoring_sessions')
        .insert({
          mentor_id: request.mentorId,
          student_id: request.studentId,
          subject: request.subject,
          session_type: request.sessionType,
          date: request.preferredDate,
          time: request.preferredTime,
          duration: request.duration,
          status: 'scheduled',
          objectives: request.objectives,
          notes: request.notes,
          outcomes: [],
          checklist_items: [],
          follow_up_required: false
        })
        .select()
        .single()

      if (error) {
        return { session: null, error: error.message }
      }

      // Créer les items de checklist par défaut selon le type de session
      await this.createDefaultChecklistItems(data.id, request.sessionType)

      return { session: data, error: null }
    } catch (error) {
      return { session: null, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les sessions d'un mentor
  async getMentorSessions(mentorId: string): Promise<{ 
    sessions: MentoringSessionExtended[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('mentoring_sessions')
        .select(`
          *,
          student:students!mentoring_sessions_student_id_fkey (
            user_id,
            users (
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('mentor_id', mentorId)
        .order('date', { ascending: true })

      if (error) {
        return { sessions: [], error: error.message }
      }

      return { sessions: data || [], error: null }
    } catch (error) {
      return { sessions: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les sessions d'un étudiant
  async getStudentSessions(studentId: string): Promise<{ 
    sessions: MentoringSessionExtended[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('mentoring_sessions')
        .select(`
          *,
          mentor:mentors!mentoring_sessions_mentor_id_fkey (
            user_id,
            name,
            expertise,
            users (
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('student_id', studentId)
        .order('date', { ascending: true })

      if (error) {
        return { sessions: [], error: error.message }
      }

      return { sessions: data || [], error: null }
    } catch (error) {
      return { sessions: [], error: 'Une erreur est survenue' }
    }
  },

  // Mettre à jour une session
  async updateSession(sessionId: string, updates: SessionUpdate): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('mentoring_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les items de checklist d'une session
  async getSessionChecklistItems(sessionId: string): Promise<{ 
    items: SessionChecklistItem[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('session_checklist_items')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) {
        return { items: [], error: error.message }
      }

      return { items: data || [], error: null }
    } catch (error) {
      return { items: [], error: 'Une erreur est survenue' }
    }
  },

  // Mettre à jour un item de checklist
  async updateChecklistItem(itemId: string, updates: Partial<SessionChecklistItem>): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('session_checklist_items')
        .update({
          ...updates,
          completed_date: updates.is_completed ? new Date().toISOString() : null
        })
        .eq('id', itemId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Ajouter un item de checklist
  async addChecklistItem(sessionId: string, item: Omit<SessionChecklistItem, 'id' | 'session_id'>): Promise<{ 
    item: SessionChecklistItem | null, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('session_checklist_items')
        .insert({
          session_id: sessionId,
          ...item
        })
        .select()
        .single()

      if (error) {
        return { item: null, error: error.message }
      }

      return { item: data, error: null }
    } catch (error) {
      return { item: null, error: 'Une erreur est survenue' }
    }
  },

  // Supprimer un item de checklist
  async deleteChecklistItem(itemId: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('session_checklist_items')
        .delete()
        .eq('id', itemId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Créer les items de checklist par défaut selon le type de session
  async createDefaultChecklistItems(sessionId: string, sessionType: string): Promise<void> {
    const defaultItems = this.getDefaultChecklistItems(sessionType)
    
    for (const item of defaultItems) {
      await supabase
        .from('session_checklist_items')
        .insert({
          session_id: sessionId,
          title: item.title,
          description: item.description,
          is_completed: false,
          completed_by: 'mentor'
        })
    }
  },

  // Obtenir les items de checklist par défaut
  getDefaultChecklistItems(sessionType: string): Array<{title: string, description: string}> {
    const checklists = {
      academic: [
        { title: 'Évaluation des besoins académiques', description: 'Identifier les domaines d\'amélioration et les objectifs d\'apprentissage' },
        { title: 'Plan de révision', description: 'Établir un planning de révision personnalisé' },
        { title: 'Techniques d\'apprentissage', description: 'Partager des méthodes d\'étude efficaces' },
        { title: 'Ressources pédagogiques', description: 'Recommander des livres, cours ou outils adaptés' },
        { title: 'Objectifs à court terme', description: 'Définir les prochaines étapes à suivre' }
      ],
      career: [
        { title: 'Évaluation du profil professionnel', description: 'Analyser les compétences et expériences actuelles' },
        { title: 'Définition des objectifs de carrière', description: 'Clarifier les aspirations professionnelles' },
        { title: 'Plan de développement', description: 'Créer une roadmap de progression' },
        { title: 'Réseautage', description: 'Stratégies pour élargir le réseau professionnel' },
        { title: 'Préparation aux entretiens', description: 'Techniques et conseils pour les entretiens' }
      ],
      integration: [
        { title: 'Évaluation des besoins d\'intégration', description: 'Identifier les défis d\'adaptation' },
        { title: 'Informations culturelles', description: 'Partager des connaissances sur la culture locale' },
        { title: 'Ressources locales', description: 'Connexions avec la communauté locale' },
        { title: 'Conseils pratiques', description: 'Transport, logement, services essentiels' },
        { title: 'Plan de suivi', description: 'Établir un suivi régulier de l\'intégration' }
      ],
      job_preparation: [
        { title: 'Analyse du CV', description: 'Révision et amélioration du curriculum vitae' },
        { title: 'Préparation aux entretiens', description: 'Simulation d\'entretiens et feedback' },
        { title: 'Recherche d\'emploi', description: 'Stratégies et plateformes de recherche' },
        { title: 'Réseautage professionnel', description: 'Techniques de networking et LinkedIn' },
        { title: 'Suivi des candidatures', description: 'Organisation et suivi des démarches' }
      ]
    }

    return checklists[sessionType as keyof typeof checklists] || []
  },

  // Ajouter un feedback à une session
  async addSessionFeedback(sessionId: string, feedback: {
    rating: number
    comment: string
    categories: {
      communication: number
      expertise: number
      helpfulness: number
      punctuality: number
    }
    fromUserId: string
    toUserId: string
  }): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      // Ajouter le feedback
      const { error: feedbackError } = await supabase
        .from('feedback_ratings')
        .insert({
          from_user_id: feedback.fromUserId,
          to_user_id: feedback.toUserId,
          type: 'mentor_rating',
          rating: feedback.rating,
          comment: feedback.comment,
          categories: feedback.categories,
          is_verified: true
        })

      if (feedbackError) {
        return { success: false, error: feedbackError.message }
      }

      // Mettre à jour la session avec le rating
      const { error: sessionError } = await supabase
        .from('mentoring_sessions')
        .update({
          rating: feedback.rating,
          feedback: feedback.comment
        })
        .eq('id', sessionId)

      if (sessionError) {
        return { success: false, error: sessionError.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les statistiques d'un mentor
  async getMentorStats(mentorId: string): Promise<{ 
    stats: {
      totalSessions: number
      completedSessions: number
      averageRating: number
      totalStudents: number
      completionRate: number
    }, 
    error: string | null 
  }> {
    try {
      const { data: sessions, error: sessionsError } = await supabase
        .from('mentoring_sessions')
        .select('status, rating, student_id')
        .eq('mentor_id', mentorId)

      if (sessionsError) {
        return { 
          stats: { totalSessions: 0, completedSessions: 0, averageRating: 0, totalStudents: 0, completionRate: 0 }, 
          error: sessionsError.message 
        }
      }

      const totalSessions = sessions?.length || 0
      const completedSessions = sessions?.filter(s => s.status === 'completed').length || 0
      const ratings = sessions?.filter(s => s.rating).map(s => s.rating) || []
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0
      const uniqueStudents = new Set(sessions?.map(s => s.student_id)).size
      const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0

      return {
        stats: {
          totalSessions,
          completedSessions,
          averageRating,
          totalStudents: uniqueStudents,
          completionRate
        },
        error: null
      }
    } catch (error) {
      return { 
        stats: { totalSessions: 0, completedSessions: 0, averageRating: 0, totalStudents: 0, completionRate: 0 }, 
        error: 'Une erreur est survenue' 
      }
    }
  },

  // Récupérer les sessions à venir
  async getUpcomingSessions(userId: string, userType: 'mentor' | 'student'): Promise<{ 
    sessions: MentoringSessionExtended[], 
    error: string | null 
  }> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const field = userType === 'mentor' ? 'mentor_id' : 'student_id'
      
      const { data, error } = await supabase
        .from('mentoring_sessions')
        .select('*')
        .eq(field, userId)
        .eq('status', 'scheduled')
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(5)

      if (error) {
        return { sessions: [], error: error.message }
      }

      return { sessions: data || [], error: null }
    } catch (error) {
      return { sessions: [], error: 'Une erreur est survenue' }
    }
  },

  // Annuler une session
  async cancelSession(sessionId: string, reason?: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('mentoring_sessions')
        .update({
          status: 'cancelled',
          notes: reason ? `${reason} (Session annulée)` : 'Session annulée',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  }
}
