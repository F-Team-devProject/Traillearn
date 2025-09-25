'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bell,
  ArrowLeft,
  CheckCircle,
  Calendar,
  MessageCircle,
  User,
  Clock,
  X
} from 'lucide-react'

interface Notification {
  id: string
  type: 'session' | 'message' | 'system' | 'booking'
  title: string
  message: string
  created_at: string
  read: boolean
  action_url?: string
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    loadNotifications()
  }, [isAuthenticated])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      // Simuler des notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'session',
          title: 'Nouvelle session réservée',
          message: 'Votre session de mathématiques avec Dr. Martin est confirmée pour demain à 14h.',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          action_url: '/student/dashboard'
        },
        {
          id: '2',
          type: 'message',
          title: 'Nouveau message',
          message: 'Vous avez reçu un message de votre mentor Sarah Johnson.',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          read: false,
          action_url: '/messages'
        },
        {
          id: '3',
          type: 'booking',
          title: 'Demande de réservation',
          message: 'Un étudiant souhaite réserver une session avec vous pour la physique.',
          created_at: new Date(Date.now() - 10800000).toISOString(),
          read: true,
          action_url: '/mentor/dashboard'
        },
        {
          id: '4',
          type: 'system',
          title: 'Bienvenue sur Traillearn !',
          message: 'Votre compte a été créé avec succès. Explorez nos fonctionnalités.',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          read: true
        }
      ]
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session':
        return <Calendar className="h-5 w-5 text-blue-500" />
      case 'message':
        return <MessageCircle className="h-5 w-5 text-green-500" />
      case 'booking':
        return <User className="h-5 w-5 text-purple-500" />
      case 'system':
        return <CheckCircle className="h-5 w-5 text-orange-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'session':
        return 'border-l-blue-500 bg-blue-50'
      case 'message':
        return 'border-l-green-500 bg-green-50'
      case 'booking':
        return 'border-l-purple-500 bg-purple-50'
      case 'system':
        return 'border-l-orange-500 bg-orange-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Bell className="h-6 w-6 mr-2" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount}
                    </Badge>
                  )}
                </h1>
                <p className="text-gray-600">Restez informé de vos activités</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  Tout marquer comme lu
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push('/nav')}>
                Navigation
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune notification
              </h3>
              <p className="text-gray-600">
                Vous n'avez pas encore de notifications
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`border-l-4 transition-all hover:shadow-md ${
                  notification.read ? 'opacity-75' : ''
                } ${getNotificationColor(notification.type)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-700 text-sm mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(notification.created_at).toLocaleString('fr-FR')}
                          </div>
                          {notification.action_url && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                markAsRead(notification.id)
                                router.push(notification.action_url!)
                              }}
                            >
                              Voir
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


