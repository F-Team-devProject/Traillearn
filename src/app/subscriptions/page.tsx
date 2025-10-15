'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { subscriptionService } from '@/lib/subscriptionService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackToDashboardButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { 
  Crown, 
  Star, 
  Zap, 
  Shield, 
  Check,
  X,
  Clock,
  TrendingUp,
  Users,
  Award,
  Gift,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react'
import { SubscriptionType, UserLevel } from '@/types'

export default function SubscriptionsPage() {
  const { user } = useAuthStore()
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([])
  const [userSubscription, setUserSubscription] = useState<any>(null)
  const [userLevel, setUserLevel] = useState<{ level: UserLevel, points: number, nextLevelPoints: number } | null>(null)
  const [pointsHistory, setPointsHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Plans par défaut pour la démonstration
  const defaultPlans = [
    {
      id: 'free',
      name: 'Gratuit',
      type: 'free' as SubscriptionType,
      description: 'Accès de base à la plateforme',
      price: 0,
      currency: 'EUR',
      duration_months: 1,
      features: [
        'Recherche de bourses (limité)',
        'Accès aux forums publics',
        'Événements gratuits',
        'Support communautaire'
      ],
      limitations: {
        max_scholarship_alerts: 2,
        max_job_alerts: 1,
        max_mentoring_sessions: 0,
        ai_orientation_access: false,
        priority_support: false,
        custom_domains: false,
        advanced_analytics: false
      },
      is_active: true
    },
    {
      id: 'plus',
      name: 'Plus',
      type: 'plus' as SubscriptionType,
      description: 'Accès étendu avec fonctionnalités premium',
      price: 9.99,
      currency: 'EUR',
      duration_months: 1,
      features: [
        'Recherche de bourses illimitée',
        'Alertes personnalisées',
        'Accès aux forums privés',
        'Événements premium',
        'Support prioritaire',
        'Historique des favoris'
      ],
      limitations: {
        max_scholarship_alerts: 10,
        max_job_alerts: 5,
        max_mentoring_sessions: 2,
        ai_orientation_access: true,
        priority_support: true,
        custom_domains: false,
        advanced_analytics: false
      },
      is_popular: true,
      is_active: true
    },
    {
      id: 'pro',
      name: 'Pro',
      type: 'pro' as SubscriptionType,
      description: 'Accès complet avec mentorat et IA',
      price: 19.99,
      currency: 'EUR',
      duration_months: 1,
      features: [
        'Tout de Plus',
        'Sessions de mentorat (5/mois)',
        'IA d\'orientation avancée',
        'Alertes emploi premium',
        'Analytics détaillées',
        'Support prioritaire 24/7',
        'Accès aux webinaires exclusifs'
      ],
      limitations: {
        max_scholarship_alerts: -1,
        max_job_alerts: 15,
        max_mentoring_sessions: 5,
        ai_orientation_access: true,
        priority_support: true,
        custom_domains: true,
        advanced_analytics: true
      },
      is_active: true
    },
    {
      id: 'premium',
      name: 'Premium',
      type: 'premium' as SubscriptionType,
      description: 'Accès illimité avec accompagnement personnalisé',
      price: 49.99,
      currency: 'EUR',
      duration_months: 1,
      features: [
        'Tout de Pro',
        'Sessions de mentorat illimitées',
        'Accompagnement personnalisé',
        'Conseiller dédié',
        'Accès aux événements VIP',
        'Support téléphonique',
        'Garantie de satisfaction'
      ],
      limitations: {
        max_scholarship_alerts: -1,
        max_job_alerts: -1,
        max_mentoring_sessions: -1,
        ai_orientation_access: true,
        priority_support: true,
        custom_domains: true,
        advanced_analytics: true
      },
      is_active: true
    }
  ]

  useEffect(() => {
    if (user) {
      fetchSubscriptionPlans()
      fetchUserSubscription()
      fetchUserLevel()
      fetchPointsHistory()
    }
  }, [user])

  const fetchSubscriptionPlans = async () => {
    try {
      const { plans, error } = await subscriptionService.getSubscriptionPlans()
      if (error) {
        console.error('Erreur lors du chargement des plans:', error)
        setSubscriptionPlans(defaultPlans)
      } else {
        setSubscriptionPlans(plans.length > 0 ? plans : defaultPlans)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des plans:', error)
      setSubscriptionPlans(defaultPlans)
    }
  }

  const fetchUserSubscription = async () => {
    if (!user) return

    try {
      const { subscription, error } = await subscriptionService.getUserSubscription(user.id)
      if (error) {
        console.error('Erreur lors du chargement de l\'abonnement:', error)
      } else {
        setUserSubscription(subscription)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'abonnement:', error)
    }
  }

  const fetchUserLevel = async () => {
    if (!user) return

    try {
      const { level, points, nextLevelPoints, error } = await subscriptionService.calculateUserLevel(user.id)
      if (error) {
        console.error('Erreur lors du chargement du niveau:', error)
      } else {
        setUserLevel({ level, points, nextLevelPoints })
      }
    } catch (error) {
      console.error('Erreur lors du chargement du niveau:', error)
    }
  }

  const fetchPointsHistory = async () => {
    if (!user) return

    try {
      const { history, error } = await subscriptionService.getUserPointsHistory(user.id)
      if (error) {
        console.error('Erreur lors du chargement de l\'historique:', error)
      } else {
        setPointsHistory(history)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!user) return

    setIsLoading(true)
    try {
      const { subscription, error } = await subscriptionService.createSubscription(user.id, planId)
      
      if (error) {
        alert(`Erreur: ${error}`)
      } else {
        alert('Abonnement créé avec succès !')
        fetchUserSubscription()
      }
    } catch (error) {
      console.error('Erreur lors de la souscription:', error)
      alert('Une erreur est survenue lors de la souscription.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!user || !userSubscription) return

    if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) return

    setIsLoading(true)
    try {
      const { success, error } = await subscriptionService.cancelSubscription(userSubscription.id, user.id)
      
      if (error) {
        alert(`Erreur: ${error}`)
      } else {
        alert('Abonnement annulé avec succès.')
        fetchUserSubscription()
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      alert('Une erreur est survenue lors de l\'annulation.')
    } finally {
      setIsLoading(false)
    }
  }

  const getPlanIcon = (type: SubscriptionType) => {
    switch (type) {
      case 'free':
        return <Star className="h-6 w-6 text-gray-500" />
      case 'plus':
        return <Zap className="h-6 w-6 text-blue-500" />
      case 'pro':
        return <Crown className="h-6 w-6 text-purple-500" />
      case 'premium':
        return <Shield className="h-6 w-6 text-gold-500" />
      default:
        return <Star className="h-6 w-6 text-gray-500" />
    }
  }

  const getPlanColor = (type: SubscriptionType) => {
    switch (type) {
      case 'free':
        return 'border-gray-200'
      case 'plus':
        return 'border-blue-200 bg-blue-50/50'
      case 'pro':
        return 'border-purple-200 bg-purple-50/50'
      case 'premium':
        return 'border-yellow-200 bg-yellow-50/50'
      default:
        return 'border-gray-200'
    }
  }

  const getLevelIcon = (level: UserLevel) => {
    switch (level) {
      case 'bronze':
        return <Award className="h-5 w-5 text-orange-500" />
      case 'silver':
        return <Award className="h-5 w-5 text-gray-400" />
      case 'gold':
        return <Award className="h-5 w-5 text-yellow-500" />
      case 'platinum':
        return <Award className="h-5 w-5 text-purple-500" />
      default:
        return <Award className="h-5 w-5 text-gray-500" />
    }
  }

  const getLevelColor = (level: UserLevel) => {
    switch (level) {
      case 'bronze':
        return 'bg-orange-100 text-orange-800'
      case 'silver':
        return 'bg-gray-100 text-gray-800'
      case 'gold':
        return 'bg-yellow-100 text-yellow-800'
      case 'platinum':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Crown className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour accéder aux abonnements.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Crown className="h-8 w-8 text-yellow-600" />
              👑 Abonnements et Niveaux
            </h1>
            <p className="text-gray-600 mt-2">
              Choisissez votre plan d'abonnement et progressez dans les niveaux
            </p>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans">Plans d'Abonnement</TabsTrigger>
          <TabsTrigger value="current">Mon Abonnement</TabsTrigger>
          <TabsTrigger value="levels">Mon Niveau</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subscriptionPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative ${getPlanColor(plan.type)} ${
                  plan.is_popular ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Populaire
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <div className="flex justify-center mb-2">
                    {getPlanIcon(plan.type)}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{plan.price}€</span>
                    <span className="text-gray-600">/mois</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {plan.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <Button 
                    className="w-full"
                    variant={plan.type === 'free' ? 'outline' : 'default'}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isLoading || (userSubscription && userSubscription.plan?.type === plan.type)}
                  >
                    {userSubscription && userSubscription.plan?.type === plan.type ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Actuel
                      </>
                    ) : plan.type === 'free' ? (
                      'Gratuit'
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Souscrire
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-600" />
                Avantages des Niveaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Award className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Bronze</h3>
                  <p className="text-sm text-gray-600">0-499 points</p>
                  <p className="text-xs text-gray-500 mt-1">Accès de base</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <h3 className="font-semibold">Silver</h3>
                  <p className="text-sm text-gray-600">500-1499 points</p>
                  <p className="text-xs text-gray-500 mt-1">+5% de réduction</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Gold</h3>
                  <p className="text-sm text-gray-600">1500-4999 points</p>
                  <p className="text-xs text-gray-500 mt-1">+10% de réduction</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Platinum</h3>
                  <p className="text-sm text-gray-600">5000+ points</p>
                  <p className="text-xs text-gray-500 mt-1">+15% de réduction</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current" className="space-y-6">
          {userSubscription ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getPlanIcon(userSubscription.plan?.type || 'free')}
                  Mon Abonnement Actuel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{userSubscription.plan?.name}</h3>
                    <p className="text-gray-600 mb-4">{userSubscription.plan?.description}</p>
                    <div className="space-y-2">
                      {userSubscription.plan?.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium">Prix</Label>
                      <p className="text-2xl font-bold">{userSubscription.plan?.price}€/mois</p>
                    </div>
                    <div>
                      <Label className="font-medium">Statut</Label>
                      <Badge className="bg-green-100 text-green-800 ml-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Actif
                      </Badge>
                    </div>
                    <div>
                      <Label className="font-medium">Date de début</Label>
                      <p>{formatDate(userSubscription.startDate)}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Date de fin</Label>
                      <p>{formatDate(userSubscription.endDate)}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Renouvellement automatique</Label>
                      <p>{userSubscription.autoRenew ? 'Activé' : 'Désactivé'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4">
                  <Button variant="outline">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Gérer le paiement
                  </Button>
                  <Button variant="outline" onClick={handleCancelSubscription} disabled={isLoading}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler l'abonnement
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun abonnement actif</h3>
                <p className="text-gray-600 mb-4">
                  Vous utilisez actuellement le plan gratuit.
                </p>
                <Button onClick={() => {
                  const plansTab = document.querySelector('[value="plans"]') as HTMLElement;
                  if (plansTab) plansTab.click();
                }}>
                  Voir les plans disponibles
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="levels" className="space-y-6">
          {userLevel ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getLevelIcon(userLevel.level)}
                    Mon Niveau Actuel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div>
                      <Badge className={`${getLevelColor(userLevel.level)} text-lg px-4 py-2`}>
                        {getLevelIcon(userLevel.level)}
                        <span className="ml-2 capitalize">{userLevel.level}</span>
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold">{userLevel.points} points</h3>
                      <p className="text-gray-600">Points actuels</p>
                    </div>

                    {userLevel.level !== 'platinum' && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Prochain niveau: {userLevel.nextLevelPoints - userLevel.points} points
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(100, (userLevel.points / userLevel.nextLevelPoints) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="text-center p-3 border rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Activité</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <Users className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Parrainage</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <CheckCircle className="h-6 w-6 text-purple-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Feedback</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <Gift className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Bonus</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comment gagner des points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Plus className="h-5 w-5 text-blue-500" />
                        <span>Compléter votre profil</span>
                      </div>
                      <Badge variant="outline">+50 points</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-green-500" />
                        <span>Parrainer un ami</span>
                      </div>
                      <Badge variant="outline">+100 points</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-purple-500" />
                        <span>Laisser un feedback</span>
                      </div>
                      <Badge variant="outline">+25 points</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-orange-500" />
                        <span>Participer à un événement</span>
                      </div>
                      <Badge variant="outline">+30 points</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chargement du niveau</h3>
                <p className="text-gray-600">Calcul de votre niveau en cours...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {pointsHistory.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Historique des Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pointsHistory.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {entry.points > 0 ? (
                          <Plus className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">{entry.reason}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(entry.created_at)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={entry.points > 0 ? "default" : "destructive"}>
                        {entry.points > 0 ? '+' : ''}{entry.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun historique</h3>
                <p className="text-gray-600">
                  Commencez à utiliser la plateforme pour gagner des points !
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
