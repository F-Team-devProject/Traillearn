'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { notificationService } from '@/lib/notificationService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackToDashboardButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Settings, 
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Star,
  Calendar,
  CreditCard,
  User,
  FileText,
  Briefcase,
  Globe,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Trash2,
  RefreshCw
} from 'lucide-react'

interface Notification {
  id: string
  type: 'email' | 'sms' | 'push'
  title: string
  content: string
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'scholarship' | 'event' | 'deadline' | 'mentor' | 'payment' | 'system' | 'forum' | 'job'
  created_at: string
  read_at?: string
  metadata?: any
}

interface NotificationPreferences {
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

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [activeTab, setActiveTab] = useState('notifications')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      fetchPreferences()
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { notifications: userNotifications, error } = await notificationService.getUserNotifications(user.id)
      if (error) {
        console.error('Erreur lors du chargement des notifications:', error)
        // Simulation de données pour la démonstration
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'email',
            title: 'Deadline Bourse - Bourse Eiffel',
            content: 'Il reste 3 jour(s) pour candidater à la bourse "Bourse Eiffel". Deadline: 15/02/2024.',
            status: 'read',
            priority: 'high',
            category: 'deadline',
            created_at: '2024-01-12T10:00:00Z',
            read_at: '2024-01-12T10:05:00Z',
            metadata: { scholarshipName: 'Bourse Eiffel', daysLeft: 3 }
          },
          {
            id: '2',
            type: 'push',
            title: 'Nouvelle demande de mentorat',
            content: 'Jean Dupont a reçu votre demande de mentorat.',
            status: 'read',
            priority: 'medium',
            category: 'mentor',
            created_at: '2024-01-11T14:30:00Z',
            read_at: '2024-01-11T14:35:00Z',
            metadata: { mentorName: 'Jean Dupont' }
          },
          {
            id: '3',
            type: 'email',
            title: 'Rappel Événement - Webinaire IA',
            content: 'L\'événement "Webinaire IA" commence demain à 14:00.',
            status: 'pending',
            priority: 'medium',
            category: 'event',
            created_at: '2024-01-10T09:00:00Z',
            metadata: { eventName: 'Webinaire IA', reminderType: '24h' }
          },
          {
            id: '4',
            type: 'email',
            title: 'Paiement réussi',
            content: 'Votre paiement de 19.99 EUR pour "Abonnement Pro" a été traité avec succès.',
            status: 'read',
            priority: 'medium',
            category: 'payment',
            created_at: '2024-01-09T16:45:00Z',
            read_at: '2024-01-09T16:50:00Z',
            metadata: { amount: 19.99, currency: 'EUR', description: 'Abonnement Pro' }
          },
          {
            id: '5',
            type: 'sms',
            title: 'URGENT: Bourse',
            content: 'Deadline demain: Bourse Chevening',
            status: 'sent',
            priority: 'urgent',
            category: 'deadline',
            created_at: '2024-01-08T18:00:00Z',
            metadata: { scholarshipName: 'Bourse Chevening', daysLeft: 1 }
          }
        ]
        setNotifications(mockNotifications)
      } else {
        setNotifications(userNotifications)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPreferences = async () => {
    if (!user) return

    try {
      const { preferences: userPreferences, error } = await notificationService.getUserPreferences(user.id)
      if (error) {
        console.error('Erreur lors du chargement des préférences:', error)
      } else {
        setPreferences(userPreferences)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { success, error } = await notificationService.markAsRead(notificationId)
      if (error) {
        alert(`Erreur: ${error}`)
      } else if (success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, status: 'read', read_at: new Date().toISOString() }
              : notif
          )
        )
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      const { success, error } = await notificationService.markAllAsRead(user.id)
      if (error) {
        alert(`Erreur: ${error}`)
      } else if (success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.status === 'pending' 
              ? { ...notif, status: 'read', read_at: new Date().toISOString() }
              : notif
          )
        )
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error)
    }
  }

  const handleUpdatePreferences = async () => {
    if (!user || !preferences) return

    try {
      const { success, error } = await notificationService.updateUserPreferences(user.id, preferences)
      if (error) {
        alert(`Erreur: ${error}`)
      } else if (success) {
        alert('Préférences mises à jour avec succès !')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800">Urgent</Badge>
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">Élevé</Badge>
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800">Moyen</Badge>
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Faible</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'scholarship':
        return <Star className="h-4 w-4 text-yellow-600" />
      case 'event':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'deadline':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'mentor':
        return <User className="h-4 w-4 text-green-600" />
      case 'payment':
        return <CreditCard className="h-4 w-4 text-purple-600" />
      case 'system':
        return <Settings className="h-4 w-4 text-gray-600" />
      case 'forum':
        return <MessageSquare className="h-4 w-4 text-orange-600" />
      case 'job':
        return <Briefcase className="h-4 w-4 text-indigo-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case 'push':
        return <Smartphone className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const unreadCount = notifications.filter(n => n.status === 'pending').length

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Bell className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour accéder à vos notifications.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600" />
              🔔 Notifications
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
              )}
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez vos notifications et préférences de communication
            </p>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Mes Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Settings className="h-4 w-4 mr-2" />
            Préférences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Notifications Récentes</CardTitle>
                  <CardDescription>
                    Vos dernières notifications et mises à jour
                  </CardDescription>
                </div>
                {unreadCount > 0 && (
                  <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Tout marquer comme lu
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`border rounded-lg p-4 transition-colors ${
                      notification.status === 'pending' 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getCategoryIcon(notification.category)}
                          {getTypeIcon(notification.type)}
                          <h3 className="font-semibold">{notification.title}</h3>
                          {notification.status === 'pending' && (
                            <Badge className="bg-blue-100 text-blue-800">Non lu</Badge>
                          )}
                          {getPriorityBadge(notification.priority)}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{notification.content}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(notification.status)}
                            <span className="capitalize">{notification.status}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(notification.created_at)}
                          </div>
                          {notification.read_at && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              Lu le {formatDate(notification.read_at)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        {notification.status === 'pending' && (
                          <Button 
                            onClick={() => handleMarkAsRead(notification.id)}
                            size="sm"
                            variant="outline"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marquer comme lu
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
                    <p className="text-gray-600">
                      Vous n'avez pas encore de notifications.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          {preferences && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Notifications Email
                  </CardTitle>
                  <CardDescription>
                    Configurez vos préférences de notifications par email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-enabled">Notifications email</Label>
                      <p className="text-sm text-gray-600">Activer/désactiver toutes les notifications email</p>
                    </div>
                    <Switch
                      id="email-enabled"
                      checked={preferences.email.enabled}
                      onCheckedChange={(checked: boolean) => 
                        setPreferences({
                          ...preferences,
                          email: { ...preferences.email, enabled: checked }
                        })
                      }
                    />
                  </div>

                  {preferences.email.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="scholarship-alerts">Alertes bourses</Label>
                        <Switch
                          id="scholarship-alerts"
                          checked={preferences.email.scholarshipAlerts}
                          onCheckedChange={(checked: boolean) => 
                            setPreferences({
                              ...preferences,
                              email: { ...preferences.email, scholarshipAlerts: checked }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="event-reminders">Rappels événements</Label>
                        <Switch
                          id="event-reminders"
                          checked={preferences.email.eventReminders}
                          onCheckedChange={(checked: boolean) => 
                            setPreferences({
                              ...preferences,
                              email: { ...preferences.email, eventReminders: checked }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="deadline-alerts">Alertes deadlines</Label>
                        <Switch
                          id="deadline-alerts"
                          checked={preferences.email.deadlineAlerts}
                          onCheckedChange={(checked: boolean) => 
                            setPreferences({
                              ...preferences,
                              email: { ...preferences.email, deadlineAlerts: checked }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="mentor-updates">Mises à jour mentor</Label>
                        <Switch
                          id="mentor-updates"
                          checked={preferences.email.mentorUpdates}
                          onCheckedChange={(checked: boolean) => 
                            setPreferences({
                              ...preferences,
                              email: { ...preferences.email, mentorUpdates: checked }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="payment-notifications">Notifications paiement</Label>
                        <Switch
                          id="payment-notifications"
                          checked={preferences.email.paymentNotifications}
                          onCheckedChange={(checked: boolean) => 
                            setPreferences({
                              ...preferences,
                              email: { ...preferences.email, paymentNotifications: checked }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="system-updates">Mises à jour système</Label>
                        <Switch
                          id="system-updates"
                          checked={preferences.email.systemUpdates}
                          onCheckedChange={(checked: boolean) => 
                            setPreferences({
                              ...preferences,
                              email: { ...preferences.email, systemUpdates: checked }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="forum-updates">Mises à jour forum</Label>
                        <Switch
                          id="forum-updates"
                          checked={preferences.email.forumUpdates}
                          onCheckedChange={(checked: boolean) => 
                            setPreferences({
                              ...preferences,
                              email: { ...preferences.email, forumUpdates: checked }
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="job-alerts">Alertes emploi</Label>
                        <Switch
                          id="job-alerts"
                          checked={preferences.email.jobAlerts}
                          onCheckedChange={(checked: boolean) => 
                            setPreferences({
                              ...preferences,
                              email: { ...preferences.email, jobAlerts: checked }
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Notifications SMS
                  </CardTitle>
                  <CardDescription>
                    Configurez vos préférences de notifications par SMS
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-enabled">Notifications SMS</Label>
                      <p className="text-sm text-gray-600">Activer/désactiver toutes les notifications SMS</p>
                    </div>
                    <Switch
                      id="sms-enabled"
                      checked={preferences.sms.enabled}
                      onCheckedChange={(checked: boolean) => 
                        setPreferences({
                          ...preferences,
                          sms: { ...preferences.sms, enabled: checked }
                        })
                      }
                    />
                  </div>

                  {preferences.sms.enabled && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="urgent-only">Urgences uniquement</Label>
                        <Switch
                          id="urgent-only"
                          checked={preferences.sms.urgentOnly}
                          onCheckedChange={(checked: boolean) => 
                            setPreferences({
                              ...preferences,
                              sms: { ...preferences.sms, urgentOnly: checked }
                            })
                          }
                        />
                      </div>

                      {!preferences.sms.urgentOnly && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="sms-deadlines">Deadlines bourses</Label>
                            <Switch
                              id="sms-deadlines"
                              checked={preferences.sms.scholarshipDeadlines}
                              onCheckedChange={(checked: boolean) => 
                                setPreferences({
                                  ...preferences,
                                  sms: { ...preferences.sms, scholarshipDeadlines: checked }
                                })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="sms-events">Rappels événements</Label>
                            <Switch
                              id="sms-events"
                              checked={preferences.sms.eventReminders}
                              onCheckedChange={(checked: boolean) => 
                                setPreferences({
                                  ...preferences,
                                  sms: { ...preferences.sms, eventReminders: checked }
                                })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="sms-payments">Alertes paiement</Label>
                            <Switch
                              id="sms-payments"
                              checked={preferences.sms.paymentAlerts}
                              onCheckedChange={(checked: boolean) => 
                                setPreferences({
                                  ...preferences,
                                  sms: { ...preferences.sms, paymentAlerts: checked }
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Notifications Push
                  </CardTitle>
                  <CardDescription>
                    Configurez vos préférences de notifications push
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-enabled">Notifications push</Label>
                      <p className="text-sm text-gray-600">Activer/désactiver toutes les notifications push</p>
                    </div>
                    <Switch
                      id="push-enabled"
                      checked={preferences.push.enabled}
                      onCheckedChange={(checked: boolean) => 
                        setPreferences({
                          ...preferences,
                          push: { ...preferences.push, enabled: checked }
                        })
                      }
                    />
                  </div>

                  {preferences.push.enabled && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="all-push">Toutes les notifications</Label>
                        <Switch
                          id="all-push"
                          checked={preferences.push.allNotifications}
                          onCheckedChange={(checked: boolean) => 
                            setPreferences({
                              ...preferences,
                              push: { ...preferences.push, allNotifications: checked }
                            })
                          }
                        />
                      </div>

                      {!preferences.push.allNotifications && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="mentor-messages">Messages mentor</Label>
                            <Switch
                              id="mentor-messages"
                              checked={preferences.push.mentorMessages}
                              onCheckedChange={(checked: boolean) => 
                                setPreferences({
                                  ...preferences,
                                  push: { ...preferences.push, mentorMessages: checked }
                                })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="forum-replies">Réponses forum</Label>
                            <Switch
                              id="forum-replies"
                              checked={preferences.push.forumReplies}
                              onCheckedChange={(checked: boolean) => 
                                setPreferences({
                                  ...preferences,
                                  push: { ...preferences.push, forumReplies: checked }
                                })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="event-updates">Mises à jour événements</Label>
                            <Switch
                              id="event-updates"
                              checked={preferences.push.eventUpdates}
                              onCheckedChange={(checked: boolean) => 
                                setPreferences({
                                  ...preferences,
                                  push: { ...preferences.push, eventUpdates: checked }
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Paramètres Généraux
                  </CardTitle>
                  <CardDescription>
                    Configurez la fréquence et les heures silencieuses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="frequency">Fréquence des notifications</Label>
                    <Select
                      value={preferences.frequency}
                      onValueChange={(value: 'immediate' | 'daily' | 'weekly' | 'never') => 
                        setPreferences({ ...preferences, frequency: value })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immédiat</SelectItem>
                        <SelectItem value="daily">Quotidien</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="never">Jamais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="quiet-hours">Heures silencieuses</Label>
                      <p className="text-sm text-gray-600">Désactiver les notifications pendant certaines heures</p>
                    </div>
                    <Switch
                      id="quiet-hours"
                      checked={preferences.quietHours.enabled}
                      onCheckedChange={(checked: boolean) => 
                        setPreferences({
                          ...preferences,
                          quietHours: { ...preferences.quietHours, enabled: checked }
                        })
                      }
                    />
                  </div>

                  {preferences.quietHours.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="start-time">Début</Label>
                        <input
                          id="start-time"
                          type="time"
                          value={preferences.quietHours.startTime}
                          onChange={(e) => 
                            setPreferences({
                              ...preferences,
                              quietHours: { ...preferences.quietHours, startTime: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-time">Fin</Label>
                        <input
                          id="end-time"
                          type="time"
                          value={preferences.quietHours.endTime}
                          onChange={(e) => 
                            setPreferences({
                              ...preferences,
                              quietHours: { ...preferences.quietHours, endTime: e.target.value }
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="timezone">Fuseau horaire</Label>
                        <Select
                          value={preferences.quietHours.timezone}
                          onValueChange={(value) => 
                            setPreferences({
                              ...preferences,
                              quietHours: { ...preferences.quietHours, timezone: value }
                            })
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                            <SelectItem value="America/New_York">America/New_York</SelectItem>
                            <SelectItem value="America/Toronto">America/Toronto</SelectItem>
                            <SelectItem value="Europe/London">Europe/London</SelectItem>
                            <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleUpdatePreferences} className="px-8">
                  <Settings className="h-4 w-4 mr-2" />
                  Sauvegarder les Préférences
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}