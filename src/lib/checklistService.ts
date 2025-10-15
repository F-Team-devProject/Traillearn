import { supabase } from './supabase'

export interface ChecklistItem {
  id: string
  title: string
  description: string
  category: 'visa' | 'insurance' | 'housing' | 'banking' | 'health' | 'education' | 'work' | 'taxes' | 'other'
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedTime: string // "2-3 weeks", "1 month", etc.
  cost?: number
  currency?: string
  documents: string[]
  tips: string[]
  warnings: string[]
  links: Array<{
    title: string
    url: string
    description?: string
  }>
  isRequired: boolean
  order: number
  created_at: string
  updated_at: string
}

export interface DestinationChecklist {
  id: string
  country: string
  city?: string
  region?: string
  description: string
  items: ChecklistItem[]
  tips: string[]
  warnings: string[]
  usefulContacts: Array<{
    name: string
    type: 'embassy' | 'consulate' | 'government' | 'service' | 'emergency'
    phone?: string
    email?: string
    address?: string
    website?: string
    description?: string
  }>
  emergencyNumbers: Array<{
    number: string
    service: string
    description?: string
  }>
  localInfo: {
    currency: string
    language: string[]
    timezone: string
    climate: string
    bestTimeToVisit: string
    culturalNotes: string[]
  }
  created_at: string
  updated_at: string
}

export interface UserChecklistProgress {
  userId: string
  checklistId: string
  completedItems: string[]
  inProgressItems: string[]
  notes: Record<string, string>
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export const checklistService = {
  // Récupérer toutes les destinations disponibles
  async getDestinations(): Promise<{ 
    destinations: Array<{ id: string, country: string, city?: string, region?: string }>, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('destination_checklists')
        .select('id, country, city, region')
        .order('country', { ascending: true })

      if (error) {
        return { destinations: [], error: error.message }
      }

      return { destinations: data || [], error: null }
    } catch (error) {
      return { destinations: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer une checklist complète pour une destination
  async getDestinationChecklist(destinationId: string): Promise<{ 
    checklist: DestinationChecklist | null, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('destination_checklists')
        .select(`
          *,
          items:checklist_items (
            *
          )
        `)
        .eq('id', destinationId)
        .single()

      if (error) {
        return { checklist: null, error: error.message }
      }

      return { checklist: data, error: null }
    } catch (error) {
      return { checklist: null, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les checklists par pays
  async getChecklistsByCountry(country: string): Promise<{ 
    checklists: DestinationChecklist[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('destination_checklists')
        .select(`
          *,
          items:checklist_items (
            *
          )
        `)
        .ilike('country', `%${country}%`)
        .order('city', { ascending: true })

      if (error) {
        return { checklists: [], error: error.message }
      }

      return { checklists: data || [], error: null }
    } catch (error) {
      return { checklists: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer le progrès d'un utilisateur pour une checklist
  async getUserChecklistProgress(userId: string, checklistId: string): Promise<{ 
    progress: UserChecklistProgress | null, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('user_checklist_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('checklist_id', checklistId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { progress: null, error: error.message }
      }

      return { progress: data || null, error: null }
    } catch (error) {
      return { progress: null, error: 'Une erreur est survenue' }
    }
  },

  // Marquer un item comme complété
  async completeChecklistItem(userId: string, checklistId: string, itemId: string, notes?: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      // Récupérer le progrès existant
      const { progress } = await this.getUserChecklistProgress(userId, checklistId)
      
      let completedItems = progress?.completedItems || []
      let inProgressItems = progress?.inProgressItems || []
      let progressNotes = progress?.notes || {}

      // Ajouter l'item aux complétés s'il n'y est pas déjà
      if (!completedItems.includes(itemId)) {
        completedItems.push(itemId)
      }

      // Retirer de la liste "en cours" s'il y était
      inProgressItems = inProgressItems.filter(id => id !== itemId)

      // Ajouter les notes si fournies
      if (notes) {
        progressNotes[itemId] = notes
      }

      // Créer ou mettre à jour le progrès
      const progressData = {
        user_id: userId,
        checklist_id: checklistId,
        completed_items: completedItems,
        in_progress_items: inProgressItems,
        notes: progressNotes,
        updated_at: new Date().toISOString()
      }

      if (progress) {
        // Mettre à jour le progrès existant
        const { error } = await supabase
          .from('user_checklist_progress')
          .update(progressData)
          .eq('user_id', userId)
          .eq('checklist_id', checklistId)

        if (error) {
          return { success: false, error: error.message }
        }
      } else {
        // Créer un nouveau progrès
        const { error } = await supabase
          .from('user_checklist_progress')
          .insert({
            ...progressData,
            created_at: new Date().toISOString()
          })

        if (error) {
          return { success: false, error: error.message }
        }
      }

      // Ajouter des points à l'utilisateur
      const { data: currentUser } = await supabase
        .from('users')
        .select('points')
        .eq('id', userId)
        .single()

      if (currentUser) {
        await supabase
          .from('users')
          .update({
            points: (currentUser.points || 0) + 10,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        // Enregistrer l'ajout de points dans l'historique
        await supabase
          .from('user_points_history')
          .insert({
            user_id: userId,
            points: 10,
            reason: 'Étape de checklist complétée',
            created_at: new Date().toISOString()
          })
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Marquer un item comme en cours
  async startChecklistItem(userId: string, checklistId: string, itemId: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      // Récupérer le progrès existant
      const { progress } = await this.getUserChecklistProgress(userId, checklistId)
      
      let inProgressItems = progress?.inProgressItems || []

      // Ajouter l'item aux "en cours" s'il n'y est pas déjà
      if (!inProgressItems.includes(itemId)) {
        inProgressItems.push(itemId)
      }

      // Créer ou mettre à jour le progrès
      const progressData = {
        user_id: userId,
        checklist_id: checklistId,
        in_progress_items: inProgressItems,
        updated_at: new Date().toISOString()
      }

      if (progress) {
        // Mettre à jour le progrès existant
        const { error } = await supabase
          .from('user_checklist_progress')
          .update(progressData)
          .eq('user_id', userId)
          .eq('checklist_id', checklistId)

        if (error) {
          return { success: false, error: error.message }
        }
      } else {
        // Créer un nouveau progrès
        const { error } = await supabase
          .from('user_checklist_progress')
          .insert({
            ...progressData,
            completed_items: [],
            notes: {},
            created_at: new Date().toISOString()
          })

        if (error) {
          return { success: false, error: error.message }
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Ajouter des notes à un item
  async addItemNotes(userId: string, checklistId: string, itemId: string, notes: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      // Récupérer le progrès existant
      const { progress } = await this.getUserChecklistProgress(userId, checklistId)
      
      let progressNotes = progress?.notes || {}
      progressNotes[itemId] = notes

      // Créer ou mettre à jour le progrès
      const progressData = {
        user_id: userId,
        checklist_id: checklistId,
        notes: progressNotes,
        updated_at: new Date().toISOString()
      }

      if (progress) {
        // Mettre à jour le progrès existant
        const { error } = await supabase
          .from('user_checklist_progress')
          .update(progressData)
          .eq('user_id', userId)
          .eq('checklist_id', checklistId)

        if (error) {
          return { success: false, error: error.message }
        }
      } else {
        // Créer un nouveau progrès
        const { error } = await supabase
          .from('user_checklist_progress')
          .insert({
            ...progressData,
            completed_items: [],
            in_progress_items: [],
            created_at: new Date().toISOString()
          })

        if (error) {
          return { success: false, error: error.message }
        }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer toutes les checklists d'un utilisateur avec leur progrès
  async getUserChecklists(userId: string): Promise<{ 
    checklists: Array<{
      checklist: DestinationChecklist
      progress: UserChecklistProgress | null
    }>, 
    error: string | null 
  }> {
    try {
      // Récupérer toutes les checklists
      const { data: allChecklists, error: checklistsError } = await supabase
        .from('destination_checklists')
        .select(`
          *,
          items:checklist_items (
            *
          )
        `)
        .order('country', { ascending: true })

      if (checklistsError) {
        return { checklists: [], error: checklistsError.message }
      }

      // Récupérer les progrès de l'utilisateur
      const { data: userProgress, error: progressError } = await supabase
        .from('user_checklist_progress')
        .select('*')
        .eq('user_id', userId)

      if (progressError) {
        return { checklists: [], error: progressError.message }
      }

      // Combiner les données
      const checklistsWithProgress = (allChecklists || []).map(checklist => ({
        checklist,
        progress: (userProgress || []).find(p => p.checklist_id === checklist.id) || null
      }))

      return { checklists: checklistsWithProgress, error: null }
    } catch (error) {
      return { checklists: [], error: 'Une erreur est survenue' }
    }
  },

  // Créer une nouvelle checklist (admin)
  async createChecklist(checklist: Omit<DestinationChecklist, 'id' | 'created_at' | 'updated_at'>): Promise<{ 
    success: boolean, 
    checklistId?: string, 
    error?: string 
  }> {
    try {
      const { data, error } = await supabase
        .from('destination_checklists')
        .insert({
          ...checklist,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, checklistId: data.id }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Mettre à jour une checklist (admin)
  async updateChecklist(checklistId: string, updates: Partial<DestinationChecklist>): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('destination_checklists')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', checklistId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Ajouter un item à une checklist (admin)
  async addChecklistItem(checklistId: string, item: Omit<ChecklistItem, 'id' | 'created_at' | 'updated_at'>): Promise<{ 
    success: boolean, 
    itemId?: string, 
    error?: string 
  }> {
    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert({
          ...item,
          checklist_id: checklistId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, itemId: data.id }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Mettre à jour un item de checklist (admin)
  async updateChecklistItem(itemId: string, updates: Partial<ChecklistItem>): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('checklist_items')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
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

  // Supprimer un item de checklist (admin)
  async deleteChecklistItem(itemId: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('checklist_items')
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

  // Récupérer les statistiques des checklists
  async getChecklistStats(): Promise<{ 
    stats: {
      totalDestinations: number
      totalItems: number
      averageCompletionRate: number
      popularDestinations: Array<{
        destination: string
        usersCount: number
        completionRate: number
      }>
    }, 
    error: string | null 
  }> {
    try {
      // Compter les destinations
      const { count: destinationsCount, error: destinationsError } = await supabase
        .from('destination_checklists')
        .select('*', { count: 'exact', head: true })

      if (destinationsError) {
        return { 
          stats: {
            totalDestinations: 0,
            totalItems: 0,
            averageCompletionRate: 0,
            popularDestinations: []
          }, 
          error: destinationsError.message 
        }
      }

      // Compter les items
      const { count: itemsCount, error: itemsError } = await supabase
        .from('checklist_items')
        .select('*', { count: 'exact', head: true })

      if (itemsError) {
        return { 
          stats: {
            totalDestinations: 0,
            totalItems: 0,
            averageCompletionRate: 0,
            popularDestinations: []
          }, 
          error: itemsError.message 
        }
      }

      // Calculer le taux de completion moyen
      const { data: allProgress, error: progressError } = await supabase
        .from('user_checklist_progress')
        .select('completed_items')

      if (progressError) {
        return { 
          stats: {
            totalDestinations: 0,
            totalItems: 0,
            averageCompletionRate: 0,
            popularDestinations: []
          }, 
          error: progressError.message 
        }
      }

      const totalProgress = allProgress?.length || 0
      const totalCompleted = allProgress?.reduce((sum, p) => sum + (p.completed_items?.length || 0), 0) || 0
      const averageCompletionRate = totalProgress > 0 ? (totalCompleted / totalProgress) * 100 : 0

      // Destinations populaires (simulation)
      const popularDestinations = [
        { destination: 'France - Paris', usersCount: 45, completionRate: 78 },
        { destination: 'Canada - Toronto', usersCount: 32, completionRate: 82 },
        { destination: 'Allemagne - Berlin', usersCount: 28, completionRate: 75 },
        { destination: 'États-Unis - New York', usersCount: 25, completionRate: 80 }
      ]

      return {
        stats: {
          totalDestinations: destinationsCount || 0,
          totalItems: itemsCount || 0,
          averageCompletionRate: Math.round(averageCompletionRate * 10) / 10,
          popularDestinations
        },
        error: null
      }
    } catch (error) {
      return { 
        stats: {
          totalDestinations: 0,
          totalItems: 0,
          averageCompletionRate: 0,
          popularDestinations: []
        }, 
        error: 'Une erreur est survenue' 
      }
    }
  }
}
