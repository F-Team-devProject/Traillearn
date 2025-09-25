import { supabase } from './supabase'
import { User, UserRole } from '@/types'

export interface AuthResponse {
  user: User | null
  error: string | null
}

export const authService = {
  // Inscription avec rôle
  async signUp(email: string, password: string, userData: {
    firstName: string
    lastName: string
    role: UserRole
    countryCode?: string
  }): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            country_code: userData.countryCode
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
            bio: '',
            current_education_level: userData.role === 'student' ? 'high_school' : undefined,
            career_goals: [],
            interests: [],
            languages: [],
            skills: [],
            experience: []
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }

        // Si c'est un mentor, créer l'entrée mentor
        if (userData.role === 'mentor') {
          const { error: mentorError } = await supabase
            .from('mentors')
            .insert({
              user_id: data.user.id,
              expertise_areas: [],
              experience_years: 0,
              rating: 0,
              studentsCount: 0,
              is_verified: false
            })

          if (mentorError) {
            console.error('Error creating mentor profile:', mentorError)
          }
        }

        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            country_code: userData.countryCode,
            profile_completed: false,
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


