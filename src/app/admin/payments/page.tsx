'use client'

import { useState, useEffect } from 'react'
import { paymentService } from '@/lib/paymentService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Settings,
  Users,
  Calendar,
  Filter,
  Search,
  BarChart3,
  PieChart
} from 'lucide-react'

interface PaymentStats {
  totalRevenue: number
  totalTransactions: number
  averageTransactionValue: number
  paymentMethodDistribution: Record<string, number>
  monthlyRevenue: Array<{ month: string, revenue: number }>
}

interface CommissionSettings {
  mentorCommissionRate: number
  platformCommissionRate: number
  jobPlacementFee: number
  subscriptionProcessingFee: number
}

export default function AdminPaymentsPage() {
  const [stats, setStats] = useState<PaymentStats | null>(null)
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Simulation de données pour la démonstration
  const mockPayments = [
    {
      id: '1',
      userId: 'user1',
      amount: 19.99,
      currency: 'EUR',
      description: 'Abonnement Pro - 1 mois',
      status: 'completed',
      type: 'subscription',
      paymentMethod: 'paypal',
      createdAt: '2024-01-15T10:00:00Z',
      user: {
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'jean.dupont@example.com'
      }
    },
    {
      id: '2',
      userId: 'user2',
      amount: 150.00,
      currency: 'EUR',
      description: 'Commission mentor - Placement emploi',
      status: 'completed',
      type: 'mentor_commission',
      paymentMethod: 'paypal',
      createdAt: '2024-01-10T14:30:00Z',
      user: {
        first_name: 'Marie',
        last_name: 'Martin',
        email: 'marie.martin@example.com'
      }
    },
    {
      id: '3',
      userId: 'user3',
      amount: 49.99,
      currency: 'EUR',
      description: 'Abonnement Premium - 1 mois',
      status: 'pending',
      type: 'subscription',
      paymentMethod: 'paypal',
      createdAt: '2024-01-20T09:15:00Z',
      user: {
        first_name: 'Pierre',
        last_name: 'Durand',
        email: 'pierre.durand@example.com'
      }
    }
  ]

  useEffect(() => {
    fetchStats()
    fetchCommissionSettings()
  }, [])

  const fetchStats = async () => {
    try {
      const { stats: paymentStats, error } = await paymentService.getPaymentStats()
      if (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
        // Utiliser des données mock
        setStats({
          totalRevenue: 2450.75,
          totalTransactions: 156,
          averageTransactionValue: 15.71,
          paymentMethodDistribution: {
            paypal: 120,
            stripe: 30,
            bank_transfer: 6
          },
          monthlyRevenue: [
            { month: 'Jan 2024', revenue: 1250.50 },
            { month: 'Fév 2024', revenue: 1890.75 },
            { month: 'Mar 2024', revenue: 2150.25 },
            { month: 'Avr 2024', revenue: 1980.00 },
            { month: 'Mai 2024', revenue: 2450.80 },
            { month: 'Jun 2024', revenue: 2200.40 }
          ]
        })
      } else {
        setStats(paymentStats)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error)
    }
  }

  const fetchCommissionSettings = async () => {
    try {
      const { settings, error } = await paymentService.getCommissionSettings()
      if (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
        // Utiliser des paramètres par défaut
        setCommissionSettings({
          mentorCommissionRate: 15,
          platformCommissionRate: 10,
          jobPlacementFee: 150,
          subscriptionProcessingFee: 2.5
        })
      } else {
        setCommissionSettings(settings)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
    }
  }

  const handleUpdateCommissionSettings = async () => {
    if (!commissionSettings) return

    setIsLoading(true)
    try {
      const { success, error } = await paymentService.updateCommissionSettings(commissionSettings)
      if (error) {
        alert(`Erreur: ${error}`)
      } else {
        alert('Paramètres de commission mis à jour avec succès.')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      alert('Une erreur est survenue.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = 
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Complété</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />En attente</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Échoué</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Annulé</Badge>
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="h-3 w-3 mr-1" />Remboursé</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Badge className="bg-purple-100 text-purple-800">Abonnement</Badge>
      case 'mentor_commission':
        return <Badge className="bg-green-100 text-green-800">Commission</Badge>
      case 'job_placement':
        return <Badge className="bg-blue-100 text-blue-800">Placement</Badge>
      case 'one_time':
        return <Badge className="bg-orange-100 text-orange-800">Ponctuel</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
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

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-blue-600" />
          Gestion des Paiements
        </h1>
        <p className="text-gray-600 mt-2">
          Surveillez et gérez tous les paiements de la plateforme
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatAmount(stats.totalRevenue, 'EUR')}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% depuis le mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTransactions}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% depuis le mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valeur Moyenne</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatAmount(stats.averageTransactionValue, 'EUR')}</div>
                  <p className="text-xs text-muted-foreground">
                    +3% depuis le mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94.2%</div>
                  <p className="text-xs text-muted-foreground">
                    +2% depuis le mois dernier
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des Revenus</CardTitle>
                <CardDescription>
                  Revenus mensuels sur 6 mois
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Graphique des revenus</p>
                    <p className="text-sm text-gray-500">Intégration avec une bibliothèque de graphiques</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Méthodes de Paiement</CardTitle>
                <CardDescription>
                  Répartition des transactions par méthode
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <PieChart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Graphique en secteurs</p>
                    <p className="text-sm text-gray-500">Intégration avec une bibliothèque de graphiques</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les Transactions</CardTitle>
              <CardDescription>
                Gérer toutes les transactions de la plateforme
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
                      placeholder="Utilisateur, description ou montant..."
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
                    <option value="completed">Complété</option>
                    <option value="pending">En attente</option>
                    <option value="failed">Échoué</option>
                    <option value="cancelled">Annulé</option>
                    <option value="refunded">Remboursé</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-semibold">{payment.description}</h3>
                          <p className="text-sm text-gray-600">
                            {payment.user.first_name} {payment.user.last_name} - {payment.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(payment.status)}
                        {getTypeBadge(payment.type)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <Label className="font-medium">Montant</Label>
                        <p className="text-lg font-semibold">
                          {formatAmount(payment.amount, payment.currency)}
                        </p>
                      </div>
                      <div>
                        <Label className="font-medium">Méthode</Label>
                        <p className="capitalize">{payment.paymentMethod}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Date</Label>
                        <p>{formatDate(payment.createdAt)}</p>
                      </div>
                      <div>
                        <Label className="font-medium">ID Transaction</Label>
                        <p className="font-mono text-xs">{payment.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Utilisateur: {payment.userId}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Facture
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Rembourser
                        </Button>
                        <Button variant="outline" size="sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredPayments.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune transaction trouvée</h3>
                    <p className="text-gray-600">
                      Aucune transaction ne correspond à vos critères de recherche.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Commissions</CardTitle>
              <CardDescription>
                Suivi des commissions mentors et primes de placement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">2,450€</div>
                  <p className="text-sm text-gray-600">Commissions versées ce mois</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">15</div>
                  <p className="text-sm text-gray-600">Placements réussis</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">163€</div>
                  <p className="text-sm text-gray-600">Commission moyenne</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Commissions Récentes</h3>
                {mockPayments
                  .filter(p => p.type === 'mentor_commission')
                  .map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{payment.description}</h4>
                          <p className="text-sm text-gray-600">
                            {payment.user.first_name} {payment.user.last_name} - {formatDate(payment.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            {formatAmount(payment.amount, payment.currency)}
                          </p>
                          {getStatusBadge(payment.status)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres de Commission
              </CardTitle>
              <CardDescription>
                Configurez les taux de commission et les frais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {commissionSettings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="mentorRate">Taux de Commission Mentor (%)</Label>
                    <Input
                      id="mentorRate"
                      type="number"
                      value={commissionSettings.mentorCommissionRate}
                      onChange={(e) => setCommissionSettings({
                        ...commissionSettings,
                        mentorCommissionRate: parseFloat(e.target.value) || 0
                      })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="platformRate">Taux de Commission Plateforme (%)</Label>
                    <Input
                      id="platformRate"
                      type="number"
                      value={commissionSettings.platformCommissionRate}
                      onChange={(e) => setCommissionSettings({
                        ...commissionSettings,
                        platformCommissionRate: parseFloat(e.target.value) || 0
                      })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="placementFee">Frais de Placement Emploi (€)</Label>
                    <Input
                      id="placementFee"
                      type="number"
                      value={commissionSettings.jobPlacementFee}
                      onChange={(e) => setCommissionSettings({
                        ...commissionSettings,
                        jobPlacementFee: parseFloat(e.target.value) || 0
                      })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="processingFee">Frais de Traitement Abonnements (%)</Label>
                    <Input
                      id="processingFee"
                      type="number"
                      value={commissionSettings.subscriptionProcessingFee}
                      onChange={(e) => setCommissionSettings({
                        ...commissionSettings,
                        subscriptionProcessingFee: parseFloat(e.target.value) || 0
                      })}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  onClick={handleUpdateCommissionSettings}
                  disabled={isLoading}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Mettre à jour les paramètres
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter la configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
