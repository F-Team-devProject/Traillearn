'use client'

import { useState, useEffect } from 'react'
import { notificationService } from '@/lib/notificationService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Settings,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Filter,
  Search,
  Send,
  Trash2
} from 'lucide-react'

interface NotificationStats {
  totalNotifications: number
  sentNotifications: number
  failedNotifications: number
  pendingNotifications: number
  averageDeliveryTime: number
  deliveryRate: number
}

interface QueueItem {
  id: string
  userId: string
  type: 'email' | 'sms' | 'push'
  title: string
  content: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  status: 'pending' | 'processing' | 'sent' | 'failed'
  retryCount: number
  maxRetries: number
  createdAt: string
}

export default function AdminNotificationsPage() {
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchStats()
    fetchQueue()
  }, [])

  const fetchStats = async () => {
    try {
      const { stats: notificationStats, error } = await notificationService.getNotificationStats()
      if (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
        // Utiliser des données mock
        setStats({
          totalNotifications: 1542,
          sentNotifications: 1456,
          failedNotifications: 23,
          pendingNotifications: 63,
          averageDeliveryTime: 2.3,
          deliveryRate: 94.4
        })
      } else {
        setStats(notificationStats)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
  }

  const fetchQueue = async () => {
    try {
      // Simulation de données pour la démonstration
      const mockQueue: QueueItem[] = [
        {
          id: '1',
          userId: 'user1',
          type: 'email',
          title: 'Deadline Bourse - Bourse Eiffel',
          content: 'Il reste 3 jour(s) pour candidater à la bourse "Bourse Eiffel".',
          priority: 'high',
          category: 'deadline',
          status: 'pending',
          retryCount: 0,
          maxRetries: 3,
          createdAt: '2024-01-12T10:00:00Z'
        },
        {
          id: '2',
          userId: 'user2',
          type: 'push',
          title: 'Nouvelle demande de mentorat',
          content: 'Jean Dupont a reçu votre demande de mentorat.',
          priority: 'medium',
          category: 'mentor',
          status: 'processing',
          retryCount: 0,
          maxRetries: 3,
          createdAt: '2024-01-12T09:45:00Z'
        },
        {
          id: '3',
          userId: 'user3',
          type: 'sms',
          title: 'URGENT: Bourse',
          content: 'Deadline demain: Bourse Chevening',
          priority: 'urgent',
          category: 'deadline',
          status: 'failed',
          retryCount: 2,
          maxRetries: 3,
          createdAt: '2024-01-12T08:30:00Z'
        },
        {
          id: '4',
          userId: 'user4',
          type: 'email',
          title: 'Rappel Événement - Webinaire IA',
          content: 'L\'événement "Webinaire IA" commence demain à 14:00.',
          priority: 'medium',
          category: 'event',
          status: 'sent',
          retryCount: 0,
          maxRetries: 3,
          createdAt: '2024-01-12T07:15:00Z'
        }
      ]
      setQueue(mockQueue)
    } catch (error) {
      console.error('Erreur lors du chargement de la queue:', error)
    }
  }

  const handleProcessQueue = async () => {
    setIsProcessing(true)
    try {
      const { processed, error } = await notificationService.processNotificationQueue()
      if (error) {
        alert(`Erreur: ${error}`)
      } else {
        alert(`${processed} notifications traitées avec succès.`)
        fetchQueue()
        fetchStats()
      }
    } catch (error) {
      console.error('Erreur lors du traitement de la queue:', error)
      alert('Une erreur est survenue.')
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredQueue = queue.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesType = typeFilter === 'all' || item.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Envoyé</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />En cours</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Échoué</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          Gestion des Notifications
        </h1>
        <p className="text-gray-600 mt-2">
          Surveillez et gérez toutes les notifications de la plateforme
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="queue">Queue de Traitement</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalNotifications.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% depuis le mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Envoyées</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.sentNotifications.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.deliveryRate}% de taux de livraison
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En Attente</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingNotifications}</div>
                  <p className="text-xs text-muted-foreground">
                    Dans la queue de traitement
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Échouées</CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.failedNotifications}</div>
                  <p className="text-xs text-muted-foreground">
                    Nécessitent une attention
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance des Notifications</CardTitle>
                <CardDescription>
                  Métriques de livraison par type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span>Email</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">96.2%</div>
                      <div className="text-sm text-gray-600">Taux de livraison</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      <span>SMS</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">98.7%</div>
                      <div className="text-sm text-gray-600">Taux de livraison</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-purple-500" />
                      <span>Push</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">94.1%</div>
                      <div className="text-sm text-gray-600">Taux de livraison</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temps de Livraison</CardTitle>
                <CardDescription>
                  Temps moyen de traitement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Email</span>
                    <Badge variant="outline">2.1 min</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>SMS</span>
                    <Badge variant="outline">0.8 min</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Push</span>
                    <Badge variant="outline">0.3 min</Badge>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Moyenne globale</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {stats?.averageDeliveryTime || 0} min
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Actions Rapides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={handleProcessQueue}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isProcessing ? 'Traitement en cours...' : 'Traiter la Queue'}
                </Button>
                <Button variant="outline" onClick={fetchQueue} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
                <Button variant="outline" className="flex-1">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Rapport Détaillé
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Queue de Traitement</CardTitle>
              <CardDescription>
                Surveillez et gérez les notifications en attente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Rechercher dans la queue..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="processing">En cours</option>
                    <option value="sent">Envoyé</option>
                    <option value="failed">Échoué</option>
                  </select>
                </div>
                <div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">Tous les types</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="push">Push</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredQueue.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(item.type)}
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-gray-600">Utilisateur: {item.userId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.status)}
                        {getPriorityBadge(item.priority)}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3">{item.content}</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>
                        <p className="capitalize">{item.type}</p>
                      </div>
                      <div>
                        <span className="font-medium">Catégorie:</span>
                        <p className="capitalize">{item.category}</p>
                      </div>
                      <div>
                        <span className="font-medium">Tentatives:</span>
                        <p>{item.retryCount}/{item.maxRetries}</p>
                      </div>
                      <div>
                        <span className="font-medium">Créé le:</span>
                        <p>{formatDate(item.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Queue ID: {item.id}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {item.status === 'failed' && (
                          <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Relancer
                          </Button>
                        )}
                        {item.status === 'pending' && (
                          <Button variant="outline" size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Traiter
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredQueue.length === 0 && (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Queue vide</h3>
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'Aucune notification ne correspond à vos critères de recherche.'
                        : 'Aucune notification en attente de traitement.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres du Système
              </CardTitle>
              <CardDescription>
                Configurez les paramètres globaux de notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Taille maximale de la queue</label>
                  <input
                    type="number"
                    defaultValue="10000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre max de tentatives</label>
                  <input
                    type="number"
                    defaultValue="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Délai entre tentatives (minutes)</label>
                  <input
                    type="number"
                    defaultValue="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Taille du batch de traitement</label>
                  <input
                    type="number"
                    defaultValue="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Sauvegarder les Paramètres
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration des Services</CardTitle>
              <CardDescription>
                Paramètres des fournisseurs de services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Service Email (SendGrid)</label>
                  <input
                    type="text"
                    placeholder="Clé API SendGrid"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Service SMS (Twilio)</label>
                  <input
                    type="text"
                    placeholder="SID Twilio"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Service Push (Firebase)</label>
                  <input
                    type="text"
                    placeholder="Clé API Firebase"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <Button>
                <Send className="h-4 w-4 mr-2" />
                Tester les Services
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
