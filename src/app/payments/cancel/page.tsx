'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { paymentService } from '@/lib/paymentService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  XCircle, 
  CreditCard, 
  Home,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  DollarSign
} from 'lucide-react'

export default function PaymentCancelPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const paymentIntentId = searchParams.get('intent')
  const reason = searchParams.get('reason')

  useEffect(() => {
    if (paymentIntentId) {
      checkPaymentStatus()
    } else {
      setIsLoading(false)
    }
  }, [paymentIntentId])

  const checkPaymentStatus = async () => {
    if (!paymentIntentId) return

    try {
      const { status, error } = await paymentService.checkPaymentStatus(paymentIntentId)
      
      if (!error) {
        // Simulation de données pour la démonstration
        setPaymentIntent({
          id: paymentIntentId,
          amount: 19.99,
          currency: 'EUR',
          description: 'Abonnement Pro - 1 mois',
          status: 'cancelled',
          type: 'subscription',
          createdAt: new Date().toISOString(),
          metadata: {
            planName: 'Pro'
          }
        })
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCancellationReason = (reason: string | null) => {
    switch (reason) {
      case 'user_cancelled':
        return 'Vous avez annulé le paiement'
      case 'payment_failed':
        return 'Le paiement a échoué'
      case 'timeout':
        return 'Le paiement a expiré'
      default:
        return 'Le paiement a été annulé'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Vérification...</h2>
            <p className="text-gray-600">Vérification du statut du paiement.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-2">Paiement Annulé</h1>
            <p className="text-gray-600 mb-2">
              {getCancellationReason(reason)}
            </p>
            <p className="text-sm text-gray-500">
              Aucun montant n'a été débité de votre compte.
            </p>
          </div>

          {paymentIntent && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Détails de la Transaction
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="font-semibold">{paymentIntent.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Montant</label>
                  <p className="font-semibold text-lg">
                    {formatAmount(paymentIntent.amount, paymentIntent.currency)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Statut</label>
                  <Badge className="bg-red-100 text-red-800 ml-2">
                    <XCircle className="h-3 w-3 mr-1" />
                    Annulé
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date</label>
                  <p>{formatDate(paymentIntent.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <Badge variant="outline" className="ml-2">
                    {paymentIntent.type === 'subscription' ? 'Abonnement' : 'Ponctuel'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">ID Transaction</label>
                  <p className="font-mono text-sm">{paymentIntent.id}</p>
                </div>
              </div>

              {paymentIntent.metadata?.planName && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Abonnement Non Finalisé</h3>
                  <p className="text-gray-600">
                    L'abonnement au plan <strong>{paymentIntent.metadata.planName}</strong> n'a pas été finalisé.
                    Vous pouvez réessayer à tout moment.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Que s'est-il passé ?</h3>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Le paiement a été annulé avant finalisation</li>
                  <li>• Aucun montant n'a été débité</li>
                  <li>• Vous pouvez réessayer quand vous voulez</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <RefreshCw className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Prochaines Étapes</h3>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Réessayez le paiement si souhaité</li>
                  <li>• Contactez le support si problème persistant</li>
                  <li>• Explorez d'autres options de paiement</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 mb-1">Besoin d'aide ?</h3>
                <p className="text-sm text-yellow-700">
                  Si vous rencontrez des difficultés avec le paiement, notre équipe de support est là pour vous aider.
                  N'hésitez pas à nous contacter pour toute question.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => router.push('/subscriptions')} className="flex-1">
              <CreditCard className="h-4 w-4 mr-2" />
              Réessayer le Paiement
            </Button>
            <Button variant="outline" onClick={() => router.push('/payments')} className="flex-1">
              <DollarSign className="h-4 w-4 mr-2" />
              Mes Paiements
            </Button>
            <Button variant="outline" onClick={() => router.push('/')} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Retour à l'Accueil
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-600 mb-4">
              Vous avez des questions sur ce paiement ?
            </p>
            <Button variant="ghost" size="sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              Contacter le Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
