'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { localSessionAPI, localUserAPI } from '@/lib/localStorage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Star, 
  TrendingUp,
  Target,
  Globe,
  MessageSquare,
  Settings,
  Search,
  Award
} from 'lucide-react'

interface StudentStats {
  completedSessions: number
  upcomingSessions: number
  totalMentors: number
  averageRating: number
  goalsAchieved: number
  totalGoals: number
}

interface UpcomingSession {
  id: string
  mentorName: string
  title: string
  scheduledAt: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'pending'
}

interface Recommendation {
  id: string
  type: 'career' | 'scholarship' | 'university' | 'skill'
  title: string
  description: string
  matchScore: number
  actionUrl?: string
}

export default function StudentDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, signOut } = useAuthStore()
  const [stats, setStats] = useState<StudentStats>({
    completedSessions: 0,
    upcomingSessions: 0,
    totalMentors: 0,
    averageRating: 0,
    goalsAchieved: 0,
    totalGoals: 0
  })
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      router.push('/auth/login')
      return
    }

    // Charger les vraies données depuis localStorage
    const sessions = localSessionAPI.getSessionsByUser(user.id, 'mentee')
    
    setStats({
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      upcomingSessions: sessions.filter(s => s.status === 'scheduled').length,
      totalMentors: new Set(sessions.map(s => s.mentor_id)).size,
      averageRating: 4.9, // Simulé pour l'instant
      goalsAchieved: 5,
      totalGoals: 8
    })

    // Charger les sessions à venir avec les noms des mentors
    const upcomingSessionsData = sessions
      .filter(s => s.status === 'scheduled' || s.status === 'confirmed')
      .slice(0, 2)
      .map(session => {
        const mentor = localUserAPI.findById(session.mentor_id)
        return {
          id: session.id,
          mentorName: mentor ? mentor.name : 'Mentor inconnu',
          title: session.title,
          scheduledAt: session.scheduled_at,
          duration: session.duration_minutes,
          status: session.status as 'scheduled' | 'confirmed' | 'pending'
        }
      })

    setUpcomingSessions(upcomingSessionsData)

    // Recommandations simulées (pour l'instant)
    setRecommendations([
      {
        id: '1',
        type: 'career',
        title: 'Développeur Full Stack',
        description: 'Carrière idéale basée sur vos compétences en JavaScript et Python',
        matchScore: 92,
        actionUrl: '/careers/full-stack-developer'
      },
      {
        id: '2',
        type: 'scholarship',
        title: 'Bourse d\'excellence Eiffel',
        description: 'Bourse pour études en France - correspond à votre profil',
        matchScore: 88,
        actionUrl: '/scholarships/eiffel'
      },
      {
        id: '3',
        type: 'university',
        title: 'École Polytechnique',
        description: 'Master en Data Science - excellent pour votre orientation',
        matchScore: 85,
        actionUrl: '/universities/polytechnique'
      }
    ])
  }, [isAuthenticated, user, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!isAuthenticated || user?.role !== 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Sessions Complétées',
      value: (stats.completedSessions || 0).toString(),
      description: 'Sessions de mentorat',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Prochaines Sessions',
      value: (stats.upcomingSessions || 0).toString(),
      description: 'Cette semaine',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Mentors',
      value: (stats.totalMentors || 0).toString(),
      description: 'Mentors actifs',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Objectifs',
      value: `${stats.goalsAchieved}/${stats.totalGoals}`,
      description: 'Objectifs atteints',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const quickActions = [
    {
      title: 'Trouver un Mentor',
      description: 'Rechercher des mentors dans votre domaine',
      icon: Search,
      action: () => router.push('/mentors')
    },
    {
      title: 'Mes Objectifs',
      description: 'Gérer mes objectifs académiques',
      icon: Target,
      action: () => router.push('/student/goals')
    },
    {
      title: 'Recommandations IA',
      description: 'Voir mes recommandations personnalisées',
      icon: TrendingUp,
      action: () => router.push('/student/recommendations')
    },
    {
      title: 'Profil',
      description: 'Compléter mon profil',
      icon: Settings,
      action: () => router.push('/student/profile')
    }
  ]

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'career':
        return TrendingUp
      case 'scholarship':
        return Award
      case 'university':
        return Globe
      case 'skill':
        return BookOpen
      default:
        return Star
    }
  }

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'career':
        return 'text-blue-600 bg-blue-50'
      case 'scholarship':
        return 'text-green-600 bg-green-50'
      case 'university':
        return 'text-purple-600 bg-purple-50'
      case 'skill':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Tableau de Bord</h1>
              <p className="text-gray-600">Bienvenue, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Rôle: Étudiant</span>
              <Button variant="outline" onClick={() => router.push('/student/profile')}>
                Mon Profil
              </Button>
              <Button variant="outline" onClick={() => router.push('/student/goals')}>
                Mes Objectifs
              </Button>
              <Button variant="outline" onClick={() => router.push('/messages')}>
                Messages
              </Button>
              <Button variant="outline" onClick={() => router.push('/test')}>
                Page de Test
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Vue d'ensemble</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.description}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6" onClick={action.action}>
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Sessions à venir et recommandations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Prochaines Sessions</CardTitle>
              <CardDescription>Vos sessions de mentorat à venir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{session.mentorName}</p>
                        <p className="text-sm text-gray-600">{session.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(session.scheduledAt).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{session.duration}min</p>
                      <p className="text-xs text-gray-500 capitalize">{session.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommandations IA</CardTitle>
              <CardDescription>Suggestions personnalisées pour vous</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec) => {
                  const Icon = getRecommendationIcon(rec.type)
                  return (
                    <div key={rec.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getRecommendationColor(rec.type)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{rec.title}</p>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{rec.matchScore}%</p>
                        <p className="text-xs text-gray-500">Correspondance</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Objectifs et progression */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Mes Objectifs</CardTitle>
              <CardDescription>Suivez votre progression académique</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progression globale</span>
                  <span className="text-sm font-medium text-gray-900">
                    {Math.round((stats.goalsAchieved / stats.totalGoals) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.goalsAchieved / stats.totalGoals) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.goalsAchieved}</p>
                    <p className="text-sm text-gray-600">Objectifs atteints</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalGoals - stats.goalsAchieved}</p>
                    <p className="text-sm text-gray-600">En cours</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{stats.totalGoals}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
