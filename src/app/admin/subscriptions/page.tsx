'use client'

import { useState, useEffect } from 'react'
import { subscriptionService } from '@/lib/subscriptionService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Crown, 
  Users, 
  TrendingUp, 
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'

interface SubscriptionStats {
  totalActiveSubscriptions: number
  totalRevenue: number
  popularPlans: Array<{ plan: string, count: number }>
  conversionRate: number
}

interface UserSubscription {
  id: string
  userId: string
  planId: string
  plan: {
    id: string
    name: string
    type: string
    price: number
    currency: string
  }
  status: string
  startDate: string
  endDate: string
  autoRenew: boolean
  user: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function AdminSubscriptionsPage() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchSubscriptions()
  }, [])

  const fetchStats = async () => {
    try {
      const { stats: subscriptionStats, error } = await subscriptionService.getSubscriptionStats()
      if (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      } else {
        setStats(subscriptionStats)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
  }

  const fetchSubscriptions = async () => {
    setIsLoading(true)
    try {
      // Simulation de données pour la démonstration
      const mockSubscriptions: UserSubscription[] = [
        {
          id: '1',
          userId: 'user1',
          planId: 'plus',
          plan: {
            id: 'plus',
            name: 'Plus',
            type: 'plus',
            price: 9.99,
            currency: 'EUR'
          },
          status: 'active',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-02-01T00:00:00Z',
          autoRenew: true,
          user: {
            first_name: 'Jean',
            last_name: 'Dupont',
            email: 'jean.dupont@example.com'
          }
        },
        {
          id: '2',
          userId: 'user2',
          planId: 'pro',
          plan: {
            id: 'pro',
            name: 'Pro',
            type: 'pro',
            price: 19.99,
            currency: 'EUR'
          },
          status: 'active',
          startDate: '2024-01-15T00:00:00Z',
          endDate: '2024-02-15T00:00:00Z',
          autoRenew: true,
          user: {
            first_name: 'Marie',
            last_name: 'Martin',
            email: 'marie.martin@example.com'
          }
        },
        {
          id: '3',
          userId: 'user3',
          planId: 'premium',
          plan: {
            id: 'premium',
            name: 'Premium',
            type: 'premium',
            price: 49.99,
            currency: 'EUR'
          },
          status: 'expired',
          startDate: '2023-12-01T00:00:00Z',
          endDate: '2024-01-01T00:00:00Z',
          autoRenew: false,
          user: {
            first_name: 'Pierre',
            last_name: 'Durand',
            email: 'pierre.durand@example.com'
          }
        }
      ]
      
      setSubscriptions(mockSubscriptions)
    } catch (error) {
      console.error('Erreur lors du chargement des abonnements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckExpired = async () => {
    setIsLoading(true)
    try {
      const { expiredCount, error } = await subscriptionService.checkExpiredSubscriptions()
      if (error) {
        alert(`Erreur: ${error}`)
      } else {
        alert(`${expiredCount} abonnement(s) expiré(s) mis à jour.`)
        fetchStats()
        fetchSubscriptions()
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des expirés:', error)
      alert('Une erreur est survenue.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Actif</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Expiré</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="h-3 w-3 mr-1" />Annulé</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />En attente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPlanBadge = (type: string) => {
    switch (type) {
      case 'free':
        return <Badge variant="outline">Gratuit</Badge>
      case 'plus':
        return <Badge className="bg-blue-100 text-blue-800">Plus</Badge>
      case 'pro':
        return <Badge className="bg-purple-100 text-purple-800">Pro</Badge>
      case 'premium':
        return <Badge className="bg-yellow-100 text-yellow-800">Premium</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Crown className="h-8 w-8 text-yellow-600" />
          Gestion des Abonnements
        </h1>
        <p className="text-gray-600 mt-2">
          Surveillez et gérez les abonnements de la plateforme
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalActiveSubscriptions}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% depuis le mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}€</div>
                  <p className="text-xs text-muted-foreground">
                    +8% depuis le mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.conversionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    +2% depuis le mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Plan Populaire</CardTitle>
                  <Crown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.popularPlans.length > 0 ? stats.popularPlans[0].plan : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.popularPlans.length > 0 ? `${stats.popularPlans[0].count} abonnés` : 'Aucune donnée'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plans Populaires</CardTitle>
                <CardDescription>
                  Répartition des abonnements par plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.popularPlans.map((plan, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="font-medium">{plan.plan}</span>
                    <Badge variant="outline">{plan.count} abonnés</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
                <CardDescription>
                  Gestion des abonnements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={handleCheckExpired}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Vérifier les expirés
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter les données
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Rappels de renouvellement
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Abonnements</CardTitle>
              <CardDescription>
                Gérer tous les abonnements des utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="search">Rechercher</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Nom, email ou plan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <select
                    id="status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">Tous</option>
                    <option value="active">Actif</option>
                    <option value="expired">Expiré</option>
                    <option value="cancelled">Annulé</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold">
                            {subscription.user.first_name} {subscription.user.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">{subscription.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(subscription.status)}
                        {getPlanBadge(subscription.plan.type)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="font-medium">Plan</Label>
                        <p>{subscription.plan.name}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Prix</Label>
                        <p>{subscription.plan.price}€/mois</p>
                      </div>
                      <div>
                        <Label className="font-medium">Début</Label>
                        <p>{formatDate(subscription.startDate)}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Fin</Label>
                        <p>{formatDate(subscription.endDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Renouvellement automatique: {subscription.autoRenew ? 'Activé' : 'Désactivé'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Détails
                        </Button>
                        <Button variant="outline" size="sm">
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredSubscriptions.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun abonnement trouvé</h3>
                    <p className="text-gray-600">
                      Aucun abonnement ne correspond à vos critères de recherche.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des Abonnements</CardTitle>
                <CardDescription>
                  Tendance des souscriptions sur 6 mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Graphique d'évolution</p>
                    <p className="text-sm text-gray-500">Intégration avec une bibliothèque de graphiques</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenus par Plan</CardTitle>
                <CardDescription>
                  Répartition des revenus par type d'abonnement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Graphique de revenus</p>
                    <p className="text-sm text-gray-500">Intégration avec une bibliothèque de graphiques</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Métriques Clés</CardTitle>
              <CardDescription>
                Indicateurs de performance des abonnements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">85%</div>
                  <p className="text-sm text-gray-600">Taux de rétention</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">2.3€</div>
                  <p className="text-sm text-gray-600">Revenus moyens par utilisateur</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">12 jours</div>
                  <p className="text-sm text-gray-600">Durée moyenne d'abonnement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
