import { supabase } from './supabase'
import { EventExtended, EventRegistration } from '@/types'

export interface EventFilters {
  category?: string
  country?: string
  type?: 'webinar' | 'bootcamp' | 'conference' | 'workshop'
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  search?: string
  dateFrom?: string
  dateTo?: string
}

export interface CreateEventData {
  title: string
  description: string
  category: string
  type: 'webinar' | 'bootcamp' | 'conference' | 'workshop'
  startDate: string
  endDate: string
  timezone: string
  location?: string
  country?: string
  isOnline: boolean
  maxParticipants?: number
  registrationDeadline?: string
  price?: number
  currency?: string
  organizerId: string
  tags: string[]
  requirements?: string[]
  agenda?: string[]
  speakers?: Array<{
    name: string
    title: string
    company?: string
    bio?: string
    photo?: string
  }>
}

export interface EventRegistrationData {
  eventId: string
  userId: string
  registrationDate: string
  status: 'registered' | 'waitlisted' | 'cancelled'
  notes?: string
  questions?: Array<{
    question: string
    answer: string
  }>
}

export const eventService = {
  // Créer un nouvel événement
  async createEvent(data: CreateEventData): Promise<{ 
    event: EventExtended | null, 
    error: string | null 
  }> {
    try {
      const { data: event, error } = await supabase
        .from('events')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          type: data.type,
          start_date: data.startDate,
          end_date: data.endDate,
          timezone: data.timezone,
          location: data.location,
          country: data.country,
          is_online: data.isOnline,
          max_participants: data.maxParticipants,
          registration_deadline: data.registrationDeadline,
          price: data.price,
          currency: data.currency,
          organizer_id: data.organizerId,
          tags: data.tags,
          requirements: data.requirements,
          agenda: data.agenda,
          speakers: data.speakers,
          status: 'upcoming',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return { event: null, error: error.message }
      }

      return { event, error: null }
    } catch (error) {
      return { event: null, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les événements avec filtres
  async getEvents(filters: EventFilters = {}): Promise<{ 
    events: EventExtended[], 
    error: string | null 
  }> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          organizer:users!events_organizer_id_fkey (
            first_name,
            last_name,
            profile_picture
          )
        `)

      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.country) {
        query = query.eq('country', filters.country)
      }
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      if (filters.status) {
        const now = new Date().toISOString()
        switch (filters.status) {
          case 'upcoming':
            query = query.gt('start_date', now)
            break
          case 'ongoing':
            query = query.lte('start_date', now).gte('end_date', now)
            break
          case 'completed':
            query = query.lt('end_date', now)
            break
        }
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      if (filters.dateFrom) {
        query = query.gte('start_date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('start_date', filters.dateTo)
      }

      const { data, error } = await query
        .order('start_date', { ascending: true })

      if (error) {
        return { events: [], error: error.message }
      }

      return { events: data || [], error: null }
    } catch (error) {
      return { events: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer un événement par ID
  async getEventById(eventId: string): Promise<{ 
    event: EventExtended | null, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:users!events_organizer_id_fkey (
            first_name,
            last_name,
            profile_picture
          )
        `)
        .eq('id', eventId)
        .single()

      if (error) {
        return { event: null, error: error.message }
      }

      return { event: data, error: null }
    } catch (error) {
      return { event: null, error: 'Une erreur est survenue' }
    }
  },

  // S'inscrire à un événement
  async registerForEvent(data: EventRegistrationData): Promise<{ 
    registration: EventRegistration | null, 
    error: string | null 
  }> {
    try {
      // Vérifier si l'événement existe et a de la place
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('max_participants, registration_deadline')
        .eq('id', data.eventId)
        .single()

      if (eventError) {
        return { registration: null, error: 'Événement introuvable' }
      }

      // Vérifier la date limite d'inscription
      if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
        return { registration: null, error: 'La date limite d\'inscription est dépassée' }
      }

      // Vérifier si l'utilisateur est déjà inscrit
      const { data: existingRegistration } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', data.eventId)
        .eq('user_id', data.userId)
        .single()

      if (existingRegistration) {
        return { registration: null, error: 'Vous êtes déjà inscrit à cet événement' }
      }

      // Compter les inscriptions actuelles
      const { count: currentRegistrations } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', data.eventId)
        .eq('status', 'registered')

      // Déterminer le statut d'inscription
      let registrationStatus = 'registered'
      if (event.max_participants && currentRegistrations && currentRegistrations >= event.max_participants) {
        registrationStatus = 'waitlisted'
      }

      const { data: registration, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: data.eventId,
          user_id: data.userId,
          registration_date: data.registrationDate,
          status: registrationStatus,
          notes: data.notes,
          questions: data.questions
        })
        .select()
        .single()

      if (error) {
        return { registration: null, error: error.message }
      }

      return { registration, error: null }
    } catch (error) {
      return { registration: null, error: 'Une erreur est survenue' }
    }
  },

  // Annuler une inscription
  async cancelRegistration(registrationId: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', registrationId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les inscriptions d'un utilisateur
  async getUserRegistrations(userId: string): Promise<{ 
    registrations: EventRegistration[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:events!event_registrations_event_id_fkey (
            title,
            description,
            start_date,
            end_date,
            type,
            location,
            is_online,
            organizer:users!events_organizer_id_fkey (
              first_name,
              last_name
            )
          )
        `)
        .eq('user_id', userId)
        .order('registration_date', { ascending: false })

      if (error) {
        return { registrations: [], error: error.message }
      }

      return { registrations: data || [], error: null }
    } catch (error) {
      return { registrations: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les participants d'un événement
  async getEventParticipants(eventId: string): Promise<{ 
    participants: Array<{
      id: string
      user_id: string
      status: string
      registration_date: string
      notes?: string
      user: {
        first_name: string
        last_name: string
        email: string
        profile_picture?: string
      }
    }>, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          id,
          user_id,
          status,
          registration_date,
          notes,
          user:users!event_registrations_user_id_fkey (
            first_name,
            last_name,
            email,
            profile_picture
          )
        `)
        .eq('event_id', eventId)
        .order('registration_date', { ascending: true })

      if (error) {
        return { participants: [], error: error.message }
      }

      // Transformer les données pour s'assurer que user est un objet et non un tableau
      const participants = (data || []).map(item => ({
        ...item,
        user: Array.isArray(item.user) ? item.user[0] : item.user
      }))

      return { participants, error: null }
    } catch (error) {
      return { participants: [], error: 'Une erreur est survenue' }
    }
  },

  // Mettre à jour le statut d'un événement
  async updateEventStatus(eventId: string, status: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les événements à venir d'un utilisateur
  async getUpcomingUserEvents(userId: string): Promise<{ 
    events: EventExtended[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          event:events!event_registrations_event_id_fkey (
            *,
            organizer:users!events_organizer_id_fkey (
              first_name,
              last_name,
              profile_picture
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'registered')
        .gt('event.start_date', new Date().toISOString())
        .order('event.start_date', { ascending: true })

      if (error) {
        return { events: [], error: error.message }
      }

      const events = data?.map(reg => reg.event).filter(Boolean) as unknown as EventExtended[] || []
      return { events, error: null }
    } catch (error) {
      return { events: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les rappels d'événements (pour les notifications)
  async getEventReminders(): Promise<{ 
    reminders: Array<{
      event: EventExtended
      registration: EventRegistration
      user: {
        id: string
        email: string
        first_name: string
        last_name: string
      }
    }>, 
    error: string | null 
  }> {
    try {
      const now = new Date()
      const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

      // Rappels 24h avant
      const { data: dayReminders, error: dayError } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:events!event_registrations_event_id_fkey (
            *,
            organizer:users!events_organizer_id_fkey (
              first_name,
              last_name
            )
          ),
          user:users!event_registrations_user_id_fkey (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('status', 'registered')
        .gte('event.start_date', oneDayFromNow.toISOString())
        .lte('event.start_date', new Date(oneDayFromNow.getTime() + 60 * 60 * 1000).toISOString())

      // Rappels 1h avant
      const { data: hourReminders, error: hourError } = await supabase
        .from('event_registrations')
        .select(`
          *,
          event:events!event_registrations_event_id_fkey (
            *,
            organizer:users!events_organizer_id_fkey (
              first_name,
              last_name
            )
          ),
          user:users!event_registrations_user_id_fkey (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('status', 'registered')
        .gte('event.start_date', oneHourFromNow.toISOString())
        .lte('event.start_date', new Date(oneHourFromNow.getTime() + 60 * 60 * 1000).toISOString())

      if (dayError || hourError) {
        return { reminders: [], error: dayError?.message || hourError?.message || null }
      }

      const reminders = [
        ...(dayReminders || []),
        ...(hourReminders || [])
      ].map(reminder => ({
        event: reminder.event,
        registration: reminder,
        user: reminder.user
      }))

      return { reminders, error: null }
    } catch (error) {
      return { reminders: [], error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les statistiques d'un événement
  async getEventStats(eventId: string): Promise<{ 
    stats: {
      totalRegistrations: number
      confirmedRegistrations: number
      waitlistedRegistrations: number
      attendanceRate: number
    }, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('status')
        .eq('event_id', eventId)

      if (error) {
        return { 
          stats: { totalRegistrations: 0, confirmedRegistrations: 0, waitlistedRegistrations: 0, attendanceRate: 0 }, 
          error: error.message
        }
      }

      const totalRegistrations = data?.length || 0
      const confirmedRegistrations = data?.filter(r => r.status === 'registered').length || 0
      const waitlistedRegistrations = data?.filter(r => r.status === 'waitlisted').length || 0
      const attendanceRate = totalRegistrations > 0 ? (confirmedRegistrations / totalRegistrations) * 100 : 0

      return {
        stats: {
          totalRegistrations,
          confirmedRegistrations,
          waitlistedRegistrations,
          attendanceRate
        },
        error: null
      }
    } catch (error) {
      return { 
        stats: { totalRegistrations: 0, confirmedRegistrations: 0, waitlistedRegistrations: 0, attendanceRate: 0 }, 
        error: 'Une erreur est survenue' 
      }
    }
  },

  // Rechercher des événements
  async searchEvents(query: string, filters: EventFilters = {}): Promise<{ 
    events: EventExtended[], 
    error: string | null 
  }> {
    try {
      let searchQuery = supabase
        .from('events')
        .select(`
          *,
          organizer:users!events_organizer_id_fkey (
            first_name,
            last_name,
            profile_picture
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)

      // Appliquer les filtres supplémentaires
      if (filters.category) {
        searchQuery = searchQuery.eq('category', filters.category)
      }
      if (filters.type) {
        searchQuery = searchQuery.eq('type', filters.type)
      }
      if (filters.country) {
        searchQuery = searchQuery.eq('country', filters.country)
      }

      const { data, error } = await searchQuery
        .order('start_date', { ascending: true })

      if (error) {
        return { events: [], error: error.message }
      }

      return { events: data || [], error: null }
    } catch (error) {
      return { events: [], error: 'Une erreur est survenue' }
    }
  }
}
