'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Star, Users, BookOpen, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function StudentRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      router.push('/auth/login')
      return
    }

    // Simulation du chargement des recommandations
    const loadRecommendations = async () => {
      setIsLoading(true)
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Données simulées basées sur les préférences de l'étudiant
        const mockRecommendations = [
          {
            id: '1',
            mentor: {
              name: 'Dr. Sarah Johnson',
              specialties: ['Mathématiques', 'Physique'],
              rating: 4.9,
              studentsCount: 25,
              hourly_rate: 50,
              experience: '5 ans',
              bio: 'Experte en mathématiques avec une approche pédagogique adaptée à chaque étudiant.'
            },
            reason: 'Parfait pour votre niveau en mathématiques',
            matchScore: 95,
            isRecommended: true
          },
          {
            id: '2',
            mentor: {
              name: 'Prof. Michael Chen',
              specialties: ['Informatique', 'Programmation'],
              rating: 4.8,
              studentsCount: 18,
              hourly_rate: 60,
              experience: '8 ans',
              bio: 'Développeur senior avec une passion pour l\'enseignement de la programmation.'
            },
            reason: 'Excellent pour l\'apprentissage de la programmation',
            matchScore: 88,
            isRecommended: true
          },
          {
            id: '3',
            mentor: {
              name: 'Dr. Emily Rodriguez',
              specialties: ['Chimie', 'Biologie'],
              rating: 4.7,
              studentsCount: 32,
              hourly_rate: 45,
              experience: '6 ans',
              bio: 'Chercheuse en chimie avec une approche pratique et interactive.'
            },
            reason: 'Idéal pour vos cours de sciences',
            matchScore: 82,
            isRecommended: true
          },
          {
            id: '4',
            mentor: {
              name: 'Prof. David Wilson',
              specialties: ['Mathématiques', 'Statistiques'],
              rating: 4.6,
              studentsCount: 20,
              hourly_rate: 55,
              experience: '4 ans',
              bio: 'Statisticien avec une expertise en analyse de données.'
            },
            reason: 'Bon choix pour les statistiques avancées',
            matchScore: 75,
            isRecommended: false
          }
        ]
        setRecommendations(mockRecommendations)
      } catch (error) {
        console.error('Erreur lors du chargement des recommandations:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecommendations()
  }, [isAuthenticated, user, router])

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const handleBookSession = (mentorId: string) => {
    router.push(`/booking/${mentorId}`)
  }

  const handleViewProfile = (mentorId: string) => {
    router.push(`/mentor/${mentorId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des recommandations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recommandations</h1>
              <p className="text-gray-600 mt-2">Mentors recommandés pour vous</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/student/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recommandations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recommendations.filter(r => r.isRecommended).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(recommendations.reduce((acc, r) => acc + r.mentor.rating, 0) / recommendations.length).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Mentors</p>
                  <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommandations */}
        <div className="space-y-6">
          {recommendations.map((recommendation) => (
            <Card key={recommendation.id} className={`${recommendation.isRecommended ? 'ring-2 ring-blue-200' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-600">
                        {(recommendation.mentor.name || 'M').split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{recommendation.mentor.name || 'Mentor'}</h3>
                        {recommendation.isRecommended && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Recommandé
                          </Badge>
                        )}
                        <Badge className={getMatchScoreColor(recommendation.matchScore)}>
                          {recommendation.matchScore}% de compatibilité
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{recommendation.mentor.bio}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          {recommendation.mentor.rating}/5
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-blue-500 mr-1" />
                          {recommendation.mentor.studentsCount || 0} étudiants
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 text-green-500 mr-1" />
                          {recommendation.mentor.experience}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Spécialités:</p>
                        <div className="flex flex-wrap gap-1">
                          {recommendation.mentor.specialties.map((specialty: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Pourquoi cette recommandation:</strong> {recommendation.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-gray-900">{recommendation.mentor.hourly_rate || 0}€/h</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button 
                        onClick={() => handleBookSession(recommendation.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Réserver une session
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleViewProfile(recommendation.id)}
                      >
                        Voir le profil
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {recommendations.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune recommandation disponible</h3>
              <p className="text-gray-600 mb-4">
                Nous n'avons pas encore de recommandations personnalisées pour vous.
              </p>
              <Button onClick={() => router.push('/mentors')}>
                Explorer tous les mentors
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
