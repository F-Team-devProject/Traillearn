'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
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
  ExternalLink,
  Calendar,
  Filter,
  Search
} from 'lucide-react'

interface PaymentIntent {
  id: string
  amount: number
  currency: string
  description: string
  status: string
  type: string
  paymentMethod: string
  createdAt: string
  metadata?: any
}

export default function PaymentsPage() {
  const { user } = useAuthStore()
  const [payments, setPayments] = useState<PaymentIntent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (user) {
      fetchPaymentHistory()
    }
  }, [user])

  const fetchPaymentHistory = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { payments: userPayments, error } = await paymentService.getUserPaymentHistory(user.id)
      if (error) {
        console.error('Erreur lors du chargement des paiements:', error)
        // Simulation de données pour la démonstration
        const mockPayments: PaymentIntent[] = [
          {
            id: '1',
            amount: 19.99,
            currency: 'EUR',
            description: 'Abonnement Pro - 1 mois',
            status: 'completed',
            type: 'subscription',
            paymentMethod: 'paypal',
            createdAt: '2024-01-15T10:00:00Z',
            metadata: { planName: 'Pro' }
          },
          {
            id: '2',
            amount: 150.00,
            currency: 'EUR',
            description: 'Commission mentor - Placement emploi',
            status: 'completed',
            type: 'mentor_commission',
            paymentMethod: 'paypal',
            createdAt: '2024-01-10T14:30:00Z',
            metadata: { studentId: 'student123', jobTitle: 'Développeur React' }
          },
          {
            id: '3',
            amount: 49.99,
            currency: 'EUR',
            description: 'Abonnement Premium - 1 mois',
            status: 'pending',
            type: 'subscription',
            paymentMethod: 'paypal',
            createdAt: '2024-01-20T09:15:00Z',
            metadata: { planName: 'Premium' }
          }
        ]
        setPayments(mockPayments)
      } else {
        setPayments(userPayments)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.status.toLowerCase().includes(searchTerm.toLowerCase())
    
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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'paypal':
        return <CreditCard className="h-4 w-4 text-blue-600" />
      case 'stripe':
        return <CreditCard className="h-4 w-4 text-purple-600" />
      case 'bank_transfer':
        return <CreditCard className="h-4 w-4 text-gray-600" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-400" />
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

  const handleRetryPayment = async (paymentId: string) => {
    // Logique pour relancer un paiement
    alert('Fonctionnalité de relance de paiement en cours de développement')
  }

  const handleRefundRequest = async (paymentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir demander un remboursement pour ce paiement ?')) return
    
    try {
      const { success, error } = await paymentService.refundPayment(paymentId)
      if (error) {
        alert(`Erreur: ${error}`)
      } else {
        alert('Demande de remboursement soumise avec succès.')
        fetchPaymentHistory()
      }
    } catch (error) {
      console.error('Erreur lors de la demande de remboursement:', error)
      alert('Une erreur est survenue.')
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <CreditCard className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour accéder à vos paiements.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-blue-600" />
          Mes Paiements
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez vos paiements et transactions
        </p>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Paiements</CardTitle>
              <CardDescription>
                Consultez tous vos paiements et transactions
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
                      placeholder="Description, type ou statut..."
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
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <div>
                            <h3 className="font-semibold">{payment.description}</h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(payment.createdAt)}
                            </p>
                          </div>
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
                        <Label className="font-medium">Type</Label>
                        <p className="capitalize">{payment.type.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <Label className="font-medium">ID Transaction</Label>
                        <p className="font-mono text-xs">{payment.id}</p>
                      </div>
                    </div>

                    {payment.metadata && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm text-gray-600">
                          {payment.metadata.planName && (
                            <p>Plan: {payment.metadata.planName}</p>
                          )}
                          {payment.metadata.jobTitle && (
                            <p>Poste: {payment.metadata.jobTitle}</p>
                          )}
                          {payment.metadata.studentId && (
                            <p>Étudiant: {payment.metadata.studentId}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Transaction #{payment.id}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {payment.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRetryPayment(payment.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Relancer
                          </Button>
                        )}
                        {payment.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRefundRequest(payment.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Remboursement
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Facture
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredPayments.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun paiement trouvé</h3>
                    <p className="text-gray-600">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Aucun paiement ne correspond à vos critères de recherche.'
                        : 'Vous n\'avez pas encore effectué de paiements.'
                      }
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Dépensé</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatAmount(
                    payments
                      .filter(p => p.status === 'completed')
                      .reduce((sum, p) => sum + p.amount, 0), 
                    'EUR'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {payments.filter(p => p.status === 'completed').length} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reçu</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatAmount(
                    payments
                      .filter(p => p.type === 'mentor_commission' && p.status === 'completed')
                      .reduce((sum, p) => sum + p.amount, 0), 
                    'EUR'
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {payments.filter(p => p.type === 'mentor_commission' && p.status === 'completed').length} commissions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paiements En Attente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payments.filter(p => p.status === 'pending').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  En cours de traitement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Remboursements</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payments.filter(p => p.status === 'refunded').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatAmount(
                    payments
                      .filter(p => p.status === 'refunded')
                      .reduce((sum, p) => sum + p.amount, 0), 
                    'EUR'
                  )} remboursés
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Type</CardTitle>
                <CardDescription>
                  Répartition de vos paiements par catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['subscription', 'mentor_commission', 'job_placement', 'one_time'].map((type) => {
                    const typePayments = payments.filter(p => p.type === type && p.status === 'completed')
                    const total = typePayments.reduce((sum, p) => sum + p.amount, 0)
                    const count = typePayments.length
                    
                    if (count === 0) return null
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeBadge(type)}
                          <span className="capitalize">{type.replace('_', ' ')}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatAmount(total, 'EUR')}</p>
                          <p className="text-xs text-gray-600">{count} transaction(s)</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Méthodes de Paiement</CardTitle>
                <CardDescription>
                  Préférences de paiement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['paypal', 'stripe', 'bank_transfer'].map((method) => {
                    const methodPayments = payments.filter(p => p.paymentMethod === method && p.status === 'completed')
                    const count = methodPayments.length
                    
                    if (count === 0) return null
                    
                    return (
                      <div key={method} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(method)}
                          <span className="capitalize">{method.replace('_', ' ')}</span>
                        </div>
                        <Badge variant="outline">{count} transaction(s)</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
