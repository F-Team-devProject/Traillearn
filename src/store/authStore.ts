import { create } from 'zustand'
import { User } from '@/types'
import { authService } from '@/lib/authService'
import { seedDemoData } from '@/lib/localStorage'
import { config } from '@/lib/config'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string, userData: {
    firstName: string
    lastName: string
    role: 'admin' | 'mentor' | 'student'
    countryCode?: string
  }) => Promise<{ success: boolean; error?: string }>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  getCurrentUser: () => Promise<void>
  createAdmin: (email: string, password: string, userData: {
    firstName: string
    lastName: string
  }) => Promise<{ success: boolean; error?: string }>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  signUp: async (email, password, userData) => {
    set({ isLoading: true })
    try {
      const { user, error } = await authService.signUp(email, password, userData)
      
      if (error) {
        set({ isLoading: false })
        return { success: false, error }
      }

      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      })
      
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true })
    try {
      const { user, error } = await authService.signIn(email, password)
      
      if (error) {
        set({ isLoading: false })
        return { success: false, error }
      }

      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      })
      
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  signOut: async () => {
    set({ isLoading: true })
    try {
      await authService.signOut()
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false })
      console.error('Sign out error:', error)
    }
  },

  getCurrentUser: async () => {
    set({ isLoading: true })
    try {
      const { user, error } = await authService.getCurrentUser()
      
      set({ 
        user, 
        isAuthenticated: !!user, 
        isLoading: false 
      })
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      })
      console.error('Get current user error:', error)
    }
  },

  createAdmin: async (email, password, userData) => {
    set({ isLoading: true })
    try {
      const { user, error } = await authService.createAdmin(email, password, userData)
      
      if (error) {
        set({ isLoading: false })
        return { success: false, error }
      }

      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      })
      
      return { success: true }
    } catch (error) {
      set({ isLoading: false })
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  // Initialiser les données de démonstration (seulement en mode dev)
  initDemoData: () => {
    if (config.DEV_MODE && !config.useSupabase()) {
      seedDemoData()
    }
  }
}))
