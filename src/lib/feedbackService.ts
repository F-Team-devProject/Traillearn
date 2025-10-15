import { supabase } from './supabase'
import { FeedbackRating } from '@/types'

export interface FeedbackStats {
  averageRating: number
  totalRatings: number
  ratingDistribution: {
    [key: number]: number
  }
  recentFeedback: FeedbackRating[]
}

export interface FeedbackSummary {
  mentorId: string
  mentorName: string
  averageRating: number
  totalRatings: number
  recentFeedback: Array<{
    id: string
    rating: number
    comment: string
    createdAt: string
    studentName: string
  }>
}

export const feedbackService = {
  // Soumettre un feedback pour un mentor
  async submitMentorFeedback(data: {
    mentorId: string
    studentId: string
    sessionId?: string
    rating: number
    comment: string
    categories: {
      communication: number
      expertise: number
      punctuality: number
      helpfulness: number
    }
  }): Promise<{ 
    success: boolean, 
    feedbackId?: string, 
    error?: string 
  }> {
    try {
      // Vérifier si l'utilisateur a déjà laissé un feedback pour ce mentor/session
      const { data: existingFeedback, error: checkError } = await supabase
        .from('feedback_ratings')
        .select('id')
        .eq('mentor_id', data.mentorId)
        .eq('student_id', data.studentId)
        .eq('session_id', data.sessionId || null)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { success: false, error: checkError.message }
      }

      if (existingFeedback) {
        return { success: false, error: 'Vous avez déjà laissé un feedback pour cette session.' }
      }

      // Créer le feedback
      const { data: feedback, error } = await supabase
        .from('feedback_ratings')
        .insert({
          mentor_id: data.mentorId,
          student_id: data.studentId,
          session_id: data.sessionId,
          rating: data.rating,
          comment: data.comment,
          categories: data.categories,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Ajouter des points à l'étudiant pour avoir laissé un feedback
      const { data: currentUser } = await supabase
        .from('users')
        .select('points')
        .eq('id', data.studentId)
        .single()

      if (currentUser) {
        const { error: pointsError } = await supabase
          .from('users')
          .update({
            points: (currentUser.points || 0) + 25,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.studentId)

        if (pointsError) {
          console.error('Erreur lors de l\'ajout de points:', pointsError)
        }

        // Enregistrer l'ajout de points dans l'historique
        await supabase
          .from('user_points_history')
          .insert({
            user_id: data.studentId,
            points: 25,
            reason: 'Feedback mentor laissé',
            created_at: new Date().toISOString()
          })
      }

      return { success: true, feedbackId: feedback.id }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Soumettre un feedback pour la plateforme
  async submitPlatformFeedback(data: {
    userId: string
    rating: number
    comment: string
    category: 'general' | 'features' | 'support' | 'bugs' | 'suggestions'
  }): Promise<{ 
    success: boolean, 
    feedbackId?: string, 
    error?: string 
  }> {
    try {
      const { data: feedback, error } = await supabase
        .from('platform_feedback')
        .insert({
          user_id: data.userId,
          rating: data.rating,
          comment: data.comment,
          category: data.category,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // Ajouter des points à l'utilisateur
      const { data: currentUser } = await supabase
        .from('users')
        .select('points')
        .eq('id', data.userId)
        .single()

      if (currentUser) {
        const { error: pointsError } = await supabase
          .from('users')
          .update({
            points: (currentUser.points || 0) + 15,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.userId)

        if (pointsError) {
          console.error('Erreur lors de l\'ajout de points:', pointsError)
        }

        // Enregistrer l'ajout de points dans l'historique
        await supabase
          .from('user_points_history')
          .insert({
            user_id: data.userId,
            points: 15,
            reason: 'Feedback plateforme laissé',
            created_at: new Date().toISOString()
          })
      }

      return { success: true, feedbackId: feedback.id }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les feedbacks d'un mentor
  async getMentorFeedback(mentorId: string): Promise<{ 
    stats: FeedbackStats | null, 
    feedbacks: FeedbackRating[], 
    error: string | null 
  }> {
    try {
      const { data: feedbacks, error } = await supabase
        .from('feedback_ratings')
        .select(`
          *,
          student:users!feedback_ratings_student_id_fkey (
            first_name,
            last_name,
            profile_picture
          )
        `)
        .eq('mentor_id', mentorId)
        .order('created_at', { ascending: false })

      if (error) {
        return { stats: null, feedbacks: [], error: error.message }
      }

      // Calculer les statistiques
      const totalRatings = feedbacks?.length || 0
      const averageRating = totalRatings > 0 
        ? feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / totalRatings 
        : 0

      // Distribution des notes
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      feedbacks?.forEach(feedback => {
        ratingDistribution[feedback.rating as keyof typeof ratingDistribution]++
      })

      const stats: FeedbackStats = {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings,
        ratingDistribution,
        recentFeedback: feedbacks?.slice(0, 5) || []
      }

      return { stats, feedbacks: feedbacks || [], error: null }
    } catch (error) {
      return { stats: null, feedbacks: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les feedbacks de la plateforme
  async getPlatformFeedback(): Promise<{ 
    feedbacks: Array<{
      id: string
      rating: number
      comment: string
      category: string
      created_at: string
      user: {
        first_name: string
        last_name: string
        email: string
      }
    }>, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('platform_feedback')
        .select(`
          *,
          user:users!platform_feedback_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        return { feedbacks: [], error: error.message }
      }

      return { feedbacks: data || [], error: null }
    } catch (error) {
      return { feedbacks: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les statistiques globales de feedback
  async getGlobalFeedbackStats(): Promise<{ 
    stats: {
      totalMentorFeedbacks: number
      totalPlatformFeedbacks: number
      averageMentorRating: number
      averagePlatformRating: number
      topRatedMentors: Array<{
        mentorId: string
        mentorName: string
        averageRating: number
        totalRatings: number
      }>
    }, 
    error: string | null 
  }> {
    try {
      // Statistiques des feedbacks mentors
      const { data: mentorFeedbacks, error: mentorError } = await supabase
        .from('feedback_ratings')
        .select(`
          mentor_id,
          rating,
          mentor:users!feedback_ratings_mentor_id_fkey (
            first_name,
            last_name
          )
        `)

      if (mentorError) {
        return { 
          stats: {
            totalMentorFeedbacks: 0,
            totalPlatformFeedbacks: 0,
            averageMentorRating: 0,
            averagePlatformRating: 0,
            topRatedMentors: []
          }, 
          error: mentorError.message 
        }
      }

      // Statistiques des feedbacks plateforme
      const { data: platformFeedbacks, error: platformError } = await supabase
        .from('platform_feedback')
        .select('rating')

      if (platformError) {
        return { 
          stats: {
            totalMentorFeedbacks: 0,
            totalPlatformFeedbacks: 0,
            averageMentorRating: 0,
            averagePlatformRating: 0,
            topRatedMentors: []
          }, 
          error: platformError.message 
        }
      }

      const totalMentorFeedbacks = mentorFeedbacks?.length || 0
      const totalPlatformFeedbacks = platformFeedbacks?.length || 0

      const averageMentorRating = totalMentorFeedbacks > 0
        ? mentorFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / totalMentorFeedbacks
        : 0

      const averagePlatformRating = totalPlatformFeedbacks > 0
        ? platformFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / totalPlatformFeedbacks
        : 0

      // Calculer les mentors les mieux notés
      const mentorStats: Record<string, { ratings: number[], name: string, totalRatings: number }> = {}
      
      mentorFeedbacks?.forEach(feedback => {
        const mentorId = feedback.mentor_id
        const mentor = Array.isArray(feedback.mentor) ? feedback.mentor[0] : feedback.mentor
        const mentorName = `${mentor?.first_name || 'Unknown'} ${mentor?.last_name || 'User'}`
        
        if (!mentorStats[mentorId]) {
          mentorStats[mentorId] = { ratings: [], name: mentorName, totalRatings: 0 }
        }
        
        mentorStats[mentorId].ratings.push(feedback.rating)
        mentorStats[mentorId].totalRatings++
      })

      const topRatedMentors = Object.entries(mentorStats)
        .map(([mentorId, stats]) => ({
          mentorId,
          mentorName: stats.name,
          averageRating: stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length,
          totalRatings: stats.totalRatings
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 10)

      return {
        stats: {
          totalMentorFeedbacks,
          totalPlatformFeedbacks,
          averageMentorRating: Math.round(averageMentorRating * 10) / 10,
          averagePlatformRating: Math.round(averagePlatformRating * 10) / 10,
          topRatedMentors
        },
        error: null
      }
    } catch (error) {
      return { 
        stats: {
          totalMentorFeedbacks: 0,
          totalPlatformFeedbacks: 0,
          averageMentorRating: 0,
          averagePlatformRating: 0,
          topRatedMentors: []
        }, 
        error: 'Une erreur est survenue' 
      }
    }
  },

  // Signaler un feedback inapproprié
  async reportFeedback(feedbackId: string, userId: string, reason: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('feedback_reports')
        .insert({
          feedback_id: feedbackId,
          reported_by: userId,
          reason,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Modérer un feedback (admin)
  async moderateFeedback(feedbackId: string, action: 'approve' | 'reject' | 'delete', adminId: string, reason?: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('feedback_ratings')
          .delete()
          .eq('id', feedbackId)

        if (error) {
          return { success: false, error: error.message }
        }
      } else {
        const { error } = await supabase
          .from('feedback_ratings')
          .update({
            status: action === 'approve' ? 'approved' : 'rejected',
            moderation_reason: reason,
            moderated_by: adminId,
            moderated_at: new Date().toISOString()
          })
          .eq('id', feedbackId)

        if (error) {
          return { success: false, error: error.message }
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les feedbacks signalés
  async getReportedFeedback(): Promise<{ 
    reports: Array<{
      id: string
      feedback_id: string
      reason: string
      status: string
      created_at: string
      reported_by: string
      reporter: {
        first_name: string
        last_name: string
      }
      feedback: {
        id: string
        rating: number
        comment: string
        mentor_id: string
        student_id: string
        mentor: {
          first_name: string
          last_name: string
        }
        student: {
          first_name: string
          last_name: string
        }
      }
    }>, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('feedback_reports')
        .select(`
          *,
          reporter:users!feedback_reports_reported_by_fkey (
            first_name,
            last_name
          ),
          feedback:feedback_ratings!feedback_reports_feedback_id_fkey (
            id,
            rating,
            comment,
            mentor_id,
            student_id,
            mentor:users!feedback_ratings_mentor_id_fkey (
              first_name,
              last_name
            ),
            student:users!feedback_ratings_student_id_fkey (
              first_name,
              last_name
            )
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        return { reports: [], error: error.message }
      }

      return { reports: data || [], error: null }
    } catch (error) {
      return { reports: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer l'historique des feedbacks d'un utilisateur
  async getUserFeedbackHistory(userId: string): Promise<{ 
    mentorFeedbacks: FeedbackRating[], 
    platformFeedbacks: Array<{
      id: string
      rating: number
      comment: string
      category: string
      created_at: string
    }>, 
    error: string | null 
  }> {
    try {
      // Feedbacks laissés pour des mentors
      const { data: mentorFeedbacks, error: mentorError } = await supabase
        .from('feedback_ratings')
        .select(`
          *,
          mentor:users!feedback_ratings_mentor_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('student_id', userId)
        .order('created_at', { ascending: false })

      if (mentorError) {
        return { mentorFeedbacks: [], platformFeedbacks: [], error: mentorError.message }
      }

      // Feedbacks laissés pour la plateforme
      const { data: platformFeedbacks, error: platformError } = await supabase
        .from('platform_feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (platformError) {
        return { mentorFeedbacks: [], platformFeedbacks: [], error: platformError.message }
      }

      return { 
        mentorFeedbacks: mentorFeedbacks || [], 
        platformFeedbacks: platformFeedbacks || [], 
        error: null 
      }
    } catch (error) {
      return { mentorFeedbacks: [], platformFeedbacks: [], error: 'Une erreur est survenue' }
    }
  }
}
