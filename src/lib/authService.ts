import { User, UserRole } from '@/types'
import { config } from './config'
import { localAuthAPI } from './localStorage'
import { authService as supabaseAuthService } from './auth'

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
    if (config.useSupabase()) {
      return await supabaseAuthService.signUp(email, password, userData)
    } else {
      return localAuthAPI.signUp(email, password, userData)
    }
  },

  // Connexion
  async signIn(email: string, password: string): Promise<AuthResponse> {
    if (config.useSupabase()) {
      return await supabaseAuthService.signIn(email, password)
    } else {
      return localAuthAPI.signIn(email, password)
    }
  },

  // Déconnexion
  async signOut(): Promise<{ error: string | null }> {
    if (config.useSupabase()) {
      return await supabaseAuthService.signOut()
    } else {
      localAuthAPI.signOut()
      return { error: null }
    }
  },

  // Récupérer l'utilisateur actuel
  async getCurrentUser(): Promise<AuthResponse> {
    if (config.useSupabase()) {
      return await supabaseAuthService.getCurrentUser()
    } else {
      const user = localAuthAPI.getCurrentUser()
      return { user, error: user ? null : 'No user found' }
    }
  },

  // Créer un admin (fonction spéciale)
  async createAdmin(email: string, password: string, userData: {
    firstName: string
    lastName: string
  }): Promise<AuthResponse> {
    if (config.useSupabase()) {
      return await supabaseAuthService.createAdmin(email, password, userData)
    } else {
      return localAuthAPI.signUp(email, password, { ...userData, role: 'admin' })
    }
  }
}


