'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { paymentService } from '@/lib/paymentService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  CreditCard, 
  Download, 
  Home,
  ArrowRight,
  Clock,
  DollarSign
} from 'lucide-react'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentIntent, setPaymentIntent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const paymentIntentId = searchParams.get('intent')
  const paymentId = searchParams.get('paymentId')
  const payerId = searchParams.get('PayerID')

  useEffect(() => {
    if (paymentIntentId && paymentId && payerId) {
      executePayment()
    } else if (paymentIntentId) {
      checkPaymentStatus()
    } else {
      setError('Paramètres de paiement manquants')
      setIsLoading(false)
    }
  }, [paymentIntentId, paymentId, payerId])

  const executePayment = async () => {
    if (!paymentId || !payerId) return

    try {
      const { success, transactionId, error } = await paymentService.executePayPalPayment(paymentId, payerId)
      
      if (error) {
        setError(error)
      } else if (success) {
        // Récupérer les détails de l'intention de paiement
        await checkPaymentStatus()
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution du paiement:', error)
      setError('Une erreur est survenue lors du traitement du paiement')
    } finally {
      setIsLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!paymentIntentId) return

    try {
      const { status, error } = await paymentService.checkPaymentStatus(paymentIntentId)
      
      if (error) {
        setError(error)
      } else {
        // Simulation de données pour la démonstration
        setPaymentIntent({
          id: paymentIntentId,
          amount: 19.99,
          currency: 'EUR',
          description: 'Abonnement Pro - 1 mois',
          status: status || 'completed',
          type: 'subscription',
          createdAt: new Date().toISOString(),
          metadata: {
            planName: 'Pro'
          }
        })
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error)
      setError('Une erreur est survenue lors de la vérification du paiement')
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Traitement du paiement...</h2>
            <p className="text-gray-600">Veuillez patienter pendant que nous finalisons votre paiement.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-600">Erreur de Paiement</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={() => router.push('/subscriptions')} className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Réessayer le paiement
              </Button>
              <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </div>
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
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">Paiement Réussi !</h1>
            <p className="text-gray-600">
              Votre paiement a été traité avec succès. Vous recevrez un email de confirmation sous peu.
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
                  <Badge className="bg-green-100 text-green-800 ml-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complété
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
                  <h3 className="font-semibold mb-2">Détails de l'Abonnement</h3>
                  <p className="text-gray-600">
                    Vous avez souscrit au plan <strong>{paymentIntent.metadata.planName}</strong>. 
                    Vos fonctionnalités premium sont maintenant actives.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Prochaines Étapes</h3>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Vérifiez votre email pour la confirmation</li>
                  <li>• Accédez à vos fonctionnalités premium</li>
                  <li>• Explorez les nouvelles possibilités</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Support</h3>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Questions ? Contactez notre support</li>
                  <li>• Documentation complète disponible</li>
                  <li>• Réponse sous 24h garantie</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => router.push('/payments')} className="flex-1">
              <CreditCard className="h-4 w-4 mr-2" />
              Voir mes Paiements
            </Button>
            <Button variant="outline" onClick={() => router.push('/subscriptions')} className="flex-1">
              <ArrowRight className="h-4 w-4 mr-2" />
              Gérer l'Abonnement
            </Button>
            <Button variant="outline" onClick={() => router.push('/')} className="flex-1">
              <Home className="h-4 w-4 mr-2" />
              Retour à l'Accueil
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t text-center">
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Télécharger la Facture
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
