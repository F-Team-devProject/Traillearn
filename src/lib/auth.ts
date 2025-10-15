import { supabase } from './supabase'
import { User, UserRole, UserLevel, SubscriptionType } from '@/types'

export interface AuthResponse {
  user: User | null
  error: string | null
}

export const authService = {
  // Inscription avec rôle (par défaut visiteur)
  async signUp(email: string, password: string, userData: {
    firstName: string
    lastName: string
    role?: UserRole
    countryCode?: string
    phone?: string
    referralCode?: string
  }): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role || 'visitor',
            country_code: userData.countryCode,
            phone: userData.phone,
            referred_by: userData.referralCode
          }
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        // Générer un code de parrainage unique
        const referralCode = `USER-${data.user.id.substring(0, 8).toUpperCase()}`

        // Créer le profil utilisateur avec les nouvelles propriétés
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            bio: '',
            career_goals: [],
            interests: [],
            languages: [],
            skills: [],
            experience: []
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }

        // Créer l'entrée utilisateur avec les nouvelles propriétés
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role || 'visitor',
            is_student: false,
            is_mentor: false,
            student_status: 'inactive',
            mentor_status: 'inactive',
            points: 0,
            level: 'bronze',
            referral_code: referralCode,
            referred_by: userData.referralCode || null,
            subscription_type: 'free',
            phone: userData.phone,
            country_code: userData.countryCode,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isActive: true
          })

        if (userError) {
          console.error('Error creating user entry:', userError)
        }

        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: `${userData.firstName} ${userData.lastName}`,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role || 'visitor',
            is_student: false,
            is_mentor: false,
            student_status: 'inactive',
            mentor_status: 'inactive',
            points: 0,
            level: 'bronze',
            referral_code: referralCode,
            referred_by: userData.referralCode || undefined,
            subscription_type: 'free',
            phone: userData.phone,
            country_code: userData.countryCode,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isActive: true
          },
          error: null
        }
      }

      return { user: null, error: 'No user data returned' }
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' }
    }
  },

  // Connexion
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        // Récupérer les données utilisateur complètes
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (userError) {
          return { user: null, error: 'Failed to fetch user data' }
        }

        return { user: userData, error: null }
      }

      return { user: null, error: 'No user data returned' }
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' }
    }
  },

  // Déconnexion
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error?.message || null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  },

  // Récupérer l'utilisateur actuel
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        return { user: null, error: error?.message || 'No user found' }
      }

      // Récupérer les données utilisateur complètes
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userError) {
        return { user: null, error: 'Failed to fetch user data' }
      }

      return { user: userData, error: null }
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' }
    }
  },

  // Activer le statut étudiant pour un visiteur
  async activateStudentRole(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_student: true,
          student_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Demander le statut mentor
  async requestMentorRole(userId: string, mentorData: {
    specialties: string[]
    experience: string
    education: string
    languages: string[]
    timezone: string
    countries_served: string[]
    capacity_per_month: number
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Mettre à jour le statut mentor en attente
      const { error: userError } = await supabase
        .from('users')
        .update({
          is_mentor: true,
          mentor_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (userError) {
        return { success: false, error: userError.message }
      }

      // Créer le profil mentor
      const { error: mentorError } = await supabase
        .from('mentors')
        .insert({
          user_id: userId,
          specialties: mentorData.specialties,
          experience: mentorData.experience,
          education: mentorData.education,
          languages: mentorData.languages,
          timezone: mentorData.timezone,
          countries_served: mentorData.countries_served,
          capacity_per_month: mentorData.capacity_per_month,
          is_verified: false,
          interview_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (mentorError) {
        return { success: false, error: mentorError.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Valider un mentor (admin seulement)
  async validateMentor(userId: string, approved: boolean, notes?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          mentor_status: approved ? 'approved' : 'rejected',
          mentor_validation_date: new Date().toISOString(),
          mentor_validation_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      if (approved) {
        // Mettre à jour le profil mentor
        const { error: mentorError } = await supabase
          .from('mentors')
          .update({
            is_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        if (mentorError) {
          return { success: false, error: mentorError.message }
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Créer un admin (fonction spéciale)
  async createAdmin(email: string, password: string, userData: {
    firstName: string
    lastName: string
  }): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: 'admin'
          }
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        // Créer le profil utilisateur
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
            bio: 'Administrateur de la plateforme Traillearn',
            career_goals: [],
            interests: [],
            languages: [],
            skills: [],
            experience: []
          })

        if (profileError) {
          console.error('Error creating admin profile:', profileError)
        }

        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: 'admin',
            profile_completed: true,
            email_verified: false,
            two_factor_enabled: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          error: null
        }
      }

      return { user: null, error: 'No user data returned' }
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' }
    }
  }
}


