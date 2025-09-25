'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Star, 
  Clock, 
  MapPin, 
  Euro, 
  User, 
  BookOpen, 
  Award,
  MessageCircle,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Users,
  TrendingUp,
  MessageSquare
} from 'lucide-react'
import { localMentorAPI, localUserAPI, localSessionAPI } from '@/lib/localStorage'
import { Mentor, MentoringSession } from '@/types'

interface MentorProfilePageProps {
  params: {
    id: string
  }
}

export default function MentorProfilePage({ params }: MentorProfilePageProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [recentSessions, setRecentSessions] = useState<MentoringSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMentorData()
  }, [params.id])

  const loadMentorData = async () => {
    try {
      setLoading(true)
      const mentorData = await localMentorAPI.getMentorById(params.id)
      if (mentorData) {
        setMentor(mentorData)
        // Charger les sessions récentes
        const sessions = await localSessionAPI.getSessionsByUser(params.id, 'mentor')
        setRecentSessions(sessions.slice(0, 5))
      }
    } catch (error) {
      console.error('Erreur lors du chargement du mentor:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookSession = () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    router.push(`/booking/${params.id}`)
  }

  const handleContact = () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    // TODO: Implémenter le système de messagerie
    alert('Fonctionnalité de messagerie à venir !')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mentor non trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Le mentor que vous recherchez n'existe pas
            </p>
            <Button onClick={() => router.push('/mentors')}>
              Retour aux mentors
            </Button>
          </CardContent>
        </Card>
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
                onClick={() => router.push('/mentors')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Profil de {mentor.name}
                </h1>
                <p className="text-gray-600">Mentor expert</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.push('/')}>
                Accueil
              </Button>
              {isAuthenticated && (
                <Button variant="outline" onClick={() => router.push('/nav')}>
                  Navigation
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                  {(mentor.name || 'M').split(' ').map((n: string) => n[0]).join('')}
                </div>
                <CardTitle className="text-xl">
                  {mentor.name || 'Mentor'}
                </CardTitle>
                <CardDescription>
                  Mentor depuis {new Date(mentor.created_at).getFullYear()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Note et statistiques */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(mentor.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{(mentor.rating || 0).toFixed(1)}</p>
                  <p className="text-sm text-gray-600">
                    {mentor.studentsCount || 0} étudiants
                  </p>
                </div>

                {/* Prix */}
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Euro className="h-5 w-5 text-green-600 mr-1" />
                    <span className="text-2xl font-bold text-green-600">
                      {mentor.hourly_rate || 0}
                    </span>
                    <span className="text-green-600">/heure</span>
                  </div>
                  <p className="text-sm text-green-700">Taux horaire</p>
                </div>

                {/* Disponibilité */}
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    mentor.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    <Clock className="h-4 w-4 mr-1" />
                    {mentor.isAvailable ? 'Disponible' : 'Occupé'}
                  </div>
                </div>

                {/* Localisation */}
                <div className="flex items-center justify-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  Paris, France
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleBookSession}
                    className="w-full"
                    disabled={!mentor.isAvailable}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Réserver une session
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleContact}
                    className="w-full"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">À propos</TabsTrigger>
                <TabsTrigger value="specialties">Spécialités</TabsTrigger>
                <TabsTrigger value="experience">Expérience</TabsTrigger>
                <TabsTrigger value="reviews">Avis</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Présentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {mentor.bio}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Méthode d'enseignement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {mentor.bio || "Méthode d'enseignement personnalisée selon les besoins de chaque étudiant. Approche interactive et pratique pour une meilleure compréhension."}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specialties" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Spécialités</CardTitle>
                    <CardDescription>
                      Domaines d'expertise et matières enseignées
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(mentor.specialties || []).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="p-2 text-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Niveaux enseignés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(mentor.educationLevels || []).length > 0 ? (
                        (mentor.educationLevels || []).map((level, index) => (
                          <Badge key={index} variant="outline">
                            {level}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline">Tous niveaux</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Expérience professionnelle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mentor.experience?.map((exp, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">{exp.duration}</p>
                          <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                        </div>
                      )) || (
                        <p className="text-gray-600">
                          Expérience détaillée à venir...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Formation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mentor.education?.map((edu, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Award className="h-5 w-5 text-blue-500 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                            <p className="text-sm text-gray-600">{edu.institution}</p>
                            <p className="text-sm text-gray-500">{edu.year}</p>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-600">
                          Formation détaillée à venir...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Avis des étudiants</CardTitle>
                    <CardDescription>
                      Retours d'expérience de {mentor.studentsCount || 0} sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentSessions.map((session) => (
                        <div key={session.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  Étudiant anonyme
                                </p>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < (session.rating || 5)
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(session.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {session.feedback || "Session très productive et enrichissante. Le mentor est très compétent et à l'écoute."}
                          </p>
                        </div>
                      ))}
                      
                      {recentSessions.length === 0 && (
                        <p className="text-gray-600 text-center py-8">
                          Aucun avis disponible pour le moment
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
