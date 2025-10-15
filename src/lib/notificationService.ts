import { supabase } from './supabase'

export interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'sms' | 'push'
  subject?: string
  content: string
  variables: string[]
  isActive: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  userId: string
  type: 'email' | 'sms' | 'push'
  title: string
  content: string
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'scholarship' | 'event' | 'deadline' | 'mentor' | 'payment' | 'system' | 'forum' | 'job'
  scheduledAt?: string
  sentAt?: string
  readAt?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface NotificationPreferences {
  userId: string
  email: {
    enabled: boolean
    scholarshipAlerts: boolean
    eventReminders: boolean
    deadlineAlerts: boolean
    mentorUpdates: boolean
    paymentNotifications: boolean
    systemUpdates: boolean
    forumUpdates: boolean
    jobAlerts: boolean
  }
  sms: {
    enabled: boolean
    urgentOnly: boolean
    scholarshipDeadlines: boolean
    eventReminders: boolean
    paymentAlerts: boolean
  }
  push: {
    enabled: boolean
    allNotifications: boolean
    mentorMessages: boolean
    forumReplies: boolean
    eventUpdates: boolean
  }
  frequency: 'immediate' | 'daily' | 'weekly' | 'never'
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
    timezone: string
  }
}

export interface NotificationQueue {
  id: string
  userId: string
  templateId?: string
  type: 'email' | 'sms' | 'push'
  title: string
  content: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  scheduledAt?: string
  metadata?: Record<string, any>
  status: 'pending' | 'processing' | 'sent' | 'failed'
  retryCount: number
  maxRetries: number
  created_at: string
}

export const notificationService = {
  // Créer une notification
  async createNotification(data: {
    userId: string
    type: 'email' | 'sms' | 'push'
    title: string
    content: string
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    category?: 'scholarship' | 'event' | 'deadline' | 'mentor' | 'payment' | 'system' | 'forum' | 'job'
    scheduledAt?: string
    metadata?: Record<string, any>
  }): Promise<{ 
    notification: Notification | null, 
    error: string | null 
  }> {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.userId,
          type: data.type,
          title: data.title,
          content: data.content,
          status: 'pending',
          priority: data.priority || 'medium',
          category: data.category || 'system',
          scheduled_at: data.scheduledAt,
          metadata: data.metadata,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (error) {
        return { notification: null, error: error.message }
      }

      // Ajouter à la queue de traitement
      await this.addToQueue({
        userId: data.userId,
        type: data.type,
        title: data.title,
        content: data.content,
        priority: data.priority || 'medium',
        category: data.category || 'system',
        scheduledAt: data.scheduledAt,
        metadata: data.metadata
      })

      return { notification, error: null }
    } catch (error) {
      return { notification: null, error: 'Une erreur est survenue' }
    }
  },

  // Ajouter une notification à la queue
  async addToQueue(data: {
    userId: string
    templateId?: string
    type: 'email' | 'sms' | 'push'
    title: string
    content: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    category: string
    scheduledAt?: string
    metadata?: Record<string, any>
  }): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      // Vérifier les préférences utilisateur
      const { preferences } = await this.getUserPreferences(data.userId)
      if (!preferences) {
        return { success: false, error: 'Préférences utilisateur non trouvées' }
      }

      // Vérifier si le type de notification est autorisé
      const isAllowed = this.checkNotificationAllowed(preferences, data.type, data.category)
      if (!isAllowed) {
        return { success: true } // Succès silencieux si l'utilisateur a désactivé ce type
      }

      const { error } = await supabase
        .from('notification_queue')
        .insert({
          user_id: data.userId,
          template_id: data.templateId,
          type: data.type,
          title: data.title,
          content: data.content,
          priority: data.priority,
          category: data.category,
          scheduled_at: data.scheduledAt,
          metadata: data.metadata,
          status: 'pending',
          retry_count: 0,
          max_retries: 3,
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

  // Vérifier si une notification est autorisée
  checkNotificationAllowed(preferences: NotificationPreferences, type: string, category: string): boolean {
    if (!preferences) return false

    switch (type) {
      case 'email':
        if (!preferences.email.enabled) return false
        switch (category) {
          case 'scholarship': return preferences.email.scholarshipAlerts
          case 'event': return preferences.email.eventReminders
          case 'deadline': return preferences.email.deadlineAlerts
          case 'mentor': return preferences.email.mentorUpdates
          case 'payment': return preferences.email.paymentNotifications
          case 'system': return preferences.email.systemUpdates
          case 'forum': return preferences.email.forumUpdates
          case 'job': return preferences.email.jobAlerts
          default: return true
        }
      
      case 'sms':
        if (!preferences.sms.enabled) return false
        if (preferences.sms.urgentOnly) {
          return ['deadline', 'payment'].includes(category)
        }
        switch (category) {
          case 'deadline': return preferences.sms.scholarshipDeadlines
          case 'event': return preferences.sms.eventReminders
          case 'payment': return preferences.sms.paymentAlerts
          default: return false
        }
      
      case 'push':
        if (!preferences.push.enabled) return false
        if (preferences.push.allNotifications) return true
        switch (category) {
          case 'mentor': return preferences.push.mentorMessages
          case 'forum': return preferences.push.forumReplies
          case 'event': return preferences.push.eventUpdates
          default: return false
        }
      
      default:
        return false
    }
  },

  // Récupérer les préférences de notification d'un utilisateur
  async getUserPreferences(userId: string): Promise<{ 
    preferences: NotificationPreferences | null, 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { preferences: null, error: error.message }
      }

      // Préférences par défaut si aucune n'est trouvée
      const defaultPreferences: NotificationPreferences = {
        userId,
        email: {
          enabled: true,
          scholarshipAlerts: true,
          eventReminders: true,
          deadlineAlerts: true,
          mentorUpdates: true,
          paymentNotifications: true,
          systemUpdates: true,
          forumUpdates: false,
          jobAlerts: true
        },
        sms: {
          enabled: false,
          urgentOnly: true,
          scholarshipDeadlines: true,
          eventReminders: false,
          paymentAlerts: true
        },
        push: {
          enabled: true,
          allNotifications: true,
          mentorMessages: true,
          forumReplies: true,
          eventUpdates: true
        },
        frequency: 'immediate',
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'Europe/Paris'
        }
      }

      return { preferences: data || defaultPreferences, error: null }
    } catch (error) {
      return { preferences: null, error: 'Une erreur est survenue' }
    }
  },

  // Mettre à jour les préférences de notification
  async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Récupérer les notifications d'un utilisateur
  async getUserNotifications(userId: string, limit = 50): Promise<{ 
    notifications: Notification[], 
    error: string | null 
  }> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        return { notifications: [], error: error.message }
      }

      return { notifications: data || [], error: null }
    } catch (error) {
      return { notifications: [], error: 'Une erreur est survenue' }
    }
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId: string): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'pending')

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Créer une notification de deadline de bourse
  async createScholarshipDeadlineAlert(data: {
    userId: string
    scholarshipName: string
    deadline: string
    daysLeft: number
  }): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      const title = `Deadline Bourse - ${data.scholarshipName}`
      const content = `Il reste ${data.daysLeft} jour(s) pour candidater à la bourse "${data.scholarshipName}". Deadline: ${new Date(data.deadline).toLocaleDateString('fr-FR')}.`

      const { error } = await this.createNotification({
        userId: data.userId,
        type: 'email',
        title,
        content,
        priority: data.daysLeft <= 3 ? 'urgent' : 'high',
        category: 'deadline',
        metadata: {
          scholarshipName: data.scholarshipName,
          deadline: data.deadline,
          daysLeft: data.daysLeft
        }
      })

      if (error) {
        return { success: false, error }
      }

      // Ajouter aussi une notification SMS si urgente
      if (data.daysLeft <= 1) {
        await this.createNotification({
          userId: data.userId,
          type: 'sms',
          title: 'URGENT: Bourse',
          content: `Deadline demain: ${data.scholarshipName}`,
          priority: 'urgent',
          category: 'deadline'
        })
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Créer une notification d'événement
  async createEventNotification(data: {
    userId: string
    eventName: string
    eventDate: string
    reminderType: '24h' | '1h' | 'start'
  }): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      let title = ''
      let content = ''

      switch (data.reminderType) {
        case '24h':
          title = `Rappel Événement - ${data.eventName}`
          content = `L'événement "${data.eventName}" commence demain à ${new Date(data.eventDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`
          break
        case '1h':
          title = `Événement bientôt - ${data.eventName}`
          content = `L'événement "${data.eventName}" commence dans 1 heure.`
          break
        case 'start':
          title = `Événement commencé - ${data.eventName}`
          content = `L'événement "${data.eventName}" vient de commencer. Rejoignez-nous !`
          break
      }

      const { error } = await this.createNotification({
        userId: data.userId,
        type: 'email',
        title,
        content,
        priority: data.reminderType === 'start' ? 'high' : 'medium',
        category: 'event',
        metadata: {
          eventName: data.eventName,
          eventDate: data.eventDate,
          reminderType: data.reminderType
        }
      })

      if (error) {
        return { success: false, error }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Créer une notification de mentor
  async createMentorNotification(data: {
    userId: string
    mentorName: string
    type: 'request' | 'accepted' | 'session_scheduled' | 'message'
    details?: string
  }): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      let title = ''
      let content = ''

      switch (data.type) {
        case 'request':
          title = 'Nouvelle demande de mentorat'
          content = `${data.mentorName} a reçu votre demande de mentorat.`
          break
        case 'accepted':
          title = 'Demande de mentorat acceptée'
          content = `${data.mentorName} a accepté votre demande de mentorat.`
          break
        case 'session_scheduled':
          title = 'Session de mentorat programmée'
          content = `Votre session avec ${data.mentorName} a été programmée.`
          break
        case 'message':
          title = 'Nouveau message mentor'
          content = `Vous avez reçu un message de ${data.mentorName}.`
          break
      }

      if (data.details) {
        content += ` ${data.details}`
      }

      const { error } = await this.createNotification({
        userId: data.userId,
        type: 'push',
        title,
        content,
        priority: 'medium',
        category: 'mentor',
        metadata: {
          mentorName: data.mentorName,
          type: data.type,
          details: data.details
        }
      })

      if (error) {
        return { success: false, error }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Créer une notification de paiement
  async createPaymentNotification(data: {
    userId: string
    type: 'success' | 'failed' | 'refund'
    amount: number
    currency: string
    description: string
  }): Promise<{ 
    success: boolean, 
    error?: string 
  }> {
    try {
      let title = ''
      let content = ''

      switch (data.type) {
        case 'success':
          title = 'Paiement réussi'
          content = `Votre paiement de ${data.amount} ${data.currency} pour "${data.description}" a été traité avec succès.`
          break
        case 'failed':
          title = 'Échec de paiement'
          content = `Votre paiement de ${data.amount} ${data.currency} pour "${data.description}" a échoué.`
          break
        case 'refund':
          title = 'Remboursement effectué'
          content = `Un remboursement de ${data.amount} ${data.currency} a été effectué pour "${data.description}".`
          break
      }

      const { error } = await this.createNotification({
        userId: data.userId,
        type: 'email',
        title,
        content,
        priority: data.type === 'failed' ? 'high' : 'medium',
        category: 'payment',
        metadata: {
          type: data.type,
          amount: data.amount,
          currency: data.currency,
          description: data.description
        }
      })

      if (error) {
        return { success: false, error }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Une erreur est survenue' }
    }
  },

  // Traiter la queue de notifications
  async processNotificationQueue(): Promise<{ 
    processed: number, 
    error: string | null 
  }> {
    try {
      // Récupérer les notifications en attente
      const { data: queue, error: queueError } = await supabase
        .from('notification_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_at', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(100)

      if (queueError) {
        return { processed: 0, error: queueError.message }
      }

      let processed = 0

      for (const item of queue || []) {
        try {
          // Marquer comme en cours de traitement
          await supabase
            .from('notification_queue')
            .update({ status: 'processing' })
            .eq('id', item.id)

          // Simuler l'envoi (en production, vous utiliseriez un service email/SMS réel)
          const success = await this.sendNotification(item)

          if (success) {
            // Mettre à jour le statut
            await supabase
              .from('notification_queue')
              .update({ status: 'sent' })
              .eq('id', item.id)

            await supabase
              .from('notifications')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq('user_id', item.user_id)
              .eq('title', item.title)

            processed++
          } else {
            // Incrémenter le compteur de tentatives
            const newRetryCount = item.retry_count + 1
            const status = newRetryCount >= item.max_retries ? 'failed' : 'pending'

            await supabase
              .from('notification_queue')
              .update({
                status,
                retry_count: newRetryCount
              })
              .eq('id', item.id)
          }
        } catch (error) {
          console.error('Erreur lors du traitement de la notification:', error)
          // Marquer comme échoué
          await supabase
            .from('notification_queue')
            .update({ status: 'failed' })
            .eq('id', item.id)
        }
      }

      return { processed, error: null }
    } catch (error) {
      return { processed: 0, error: 'Une erreur est survenue' }
    }
  },

  // Simuler l'envoi d'une notification
  async sendNotification(queueItem: NotificationQueue): Promise<boolean> {
    // Simulation de l'envoi selon le type
    switch (queueItem.type) {
      case 'email':
        // Simuler l'envoi d'email (en production: SendGrid, Mailgun, etc.)
        console.log(`Email envoyé à ${queueItem.userId}: ${queueItem.title}`)
        return Math.random() > 0.1 // 90% de succès simulé
      
      case 'sms':
        // Simuler l'envoi de SMS (en production: Twilio, etc.)
        console.log(`SMS envoyé à ${queueItem.userId}: ${queueItem.title}`)
        return Math.random() > 0.05 // 95% de succès simulé
      
      case 'push':
        // Simuler l'envoi de push notification
        console.log(`Push envoyé à ${queueItem.userId}: ${queueItem.title}`)
        return Math.random() > 0.02 // 98% de succès simulé
      
      default:
        return false
    }
  },

  // Récupérer les statistiques des notifications
  async getNotificationStats(): Promise<{ 
    stats: {
      totalNotifications: number
      sentNotifications: number
      failedNotifications: number
      pendingNotifications: number
      averageDeliveryTime: number
      deliveryRate: number
    }, 
    error: string | null 
  }> {
    try {
      // Compter toutes les notifications
      const { count: total, error: totalError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })

      if (totalError) {
        return { 
          stats: {
            totalNotifications: 0,
            sentNotifications: 0,
            failedNotifications: 0,
            pendingNotifications: 0,
            averageDeliveryTime: 0,
            deliveryRate: 0
          }, 
          error: totalError.message 
        }
      }

      // Compter les notifications envoyées
      const { count: sent, error: sentError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent')

      // Compter les notifications échouées
      const { count: failed, error: failedError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')

      // Compter les notifications en attente
      const { count: pending, error: pendingError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      const totalNotifications = total || 0
      const sentNotifications = sent || 0
      const failedNotifications = failed || 0
      const pendingNotifications = pending || 0

      const deliveryRate = totalNotifications > 0 ? (sentNotifications / totalNotifications) * 100 : 0
      const averageDeliveryTime = 2.5 // Simulation en minutes

      return {
        stats: {
          totalNotifications,
          sentNotifications,
          failedNotifications,
          pendingNotifications,
          averageDeliveryTime,
          deliveryRate: Math.round(deliveryRate * 10) / 10
        },
        error: null
      }
    } catch (error) {
      return { 
        stats: {
          totalNotifications: 0,
          sentNotifications: 0,
          failedNotifications: 0,
          pendingNotifications: 0,
          averageDeliveryTime: 0,
          deliveryRate: 0
        }, 
        error: 'Une erreur est survenue' 
      }
    }
  }
}
