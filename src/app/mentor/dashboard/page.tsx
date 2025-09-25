'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { localSessionAPI, localMentorAPI, localUserAPI } from '@/lib/localStorage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  Calendar, 
  Star, 
  MessageSquare, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  BookOpen
} from 'lucide-react'

interface MentorStats {
  totalSessions: number
  completedSessions: number
  upcomingSessions: number
  averageRating: number
  totalStudents: number
  monthlyEarnings: number
}

interface UpcomingSession {
  id: string
  studentName: string
  title: string
  scheduledAt: string
  duration: number
  status: 'scheduled' | 'confirmed' | 'pending'
}

export default function MentorDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, signOut } = useAuthStore()
  const [stats, setStats] = useState<MentorStats>({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    averageRating: 0,
    totalStudents: 0,
    monthlyEarnings: 0
  })
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'mentor') {
      router.push('/auth/login')
      return
    }

    // Charger les vraies données depuis localStorage
    const mentorData = localMentorAPI.getByUserId(user.id)
    const sessions = localSessionAPI.getSessionsByUser(user.id, 'mentor')
    
    setStats({
      totalSessions: mentorData?.studentsCount || 0,
      completedSessions: sessions.filter(s => s.status === 'completed').length,
      upcomingSessions: sessions.filter(s => s.status === 'scheduled').length,
      averageRating: mentorData?.rating || 0,
      totalStudents: new Set(sessions.map(s => s.mentee_id)).size,
      monthlyEarnings: mentorData?.hourly_rate ? mentorData.hourly_rate * sessions.filter(s => s.status === 'completed').length : 0
    })

    // Charger les sessions à venir avec les noms des étudiants
    const upcomingSessionsData = sessions
      .filter(s => s.status === 'scheduled' || s.status === 'confirmed')
      .slice(0, 3)
      .map(session => {
        const student = localUserAPI.findById(session.mentee_id)
        return {
          id: session.id,
          studentName: student ? student.name : 'Étudiant inconnu',
          title: session.title,
          scheduledAt: session.scheduled_at,
          duration: session.duration_minutes,
          status: session.status as 'scheduled' | 'confirmed' | 'pending'
        }
      })

    setUpcomingSessions(upcomingSessionsData)
  }, [isAuthenticated, user, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!isAuthenticated || user?.role !== 'mentor') {
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
      title: 'Sessions Total',
      value: (stats.totalSessions || 0).toString(),
      description: `${stats.completedSessions || 0} complétées`,
      icon: MessageSquare,
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
      title: 'Note Moyenne',
      value: (stats.averageRating || 0).toFixed(1),
      description: 'Basée sur 38 avis',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Étudiants Aidés',
      value: (stats.totalStudents || 0).toString(),
      description: 'Étudiants uniques',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Gains du Mois',
      value: `${stats.monthlyEarnings || 0}€`,
      description: 'Janvier 2024',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ]

  const quickActions = [
    {
      title: 'Nouvelle Session',
      description: 'Planifier une session de mentorat',
      icon: Calendar,
      action: () => router.push('/mentor/sessions/new')
    },
    {
      title: 'Mes Étudiants',
      description: 'Voir tous mes étudiants',
      icon: Users,
      action: () => router.push('/mentor/students')
    },
    {
      title: 'Disponibilités',
      description: 'Gérer mes créneaux',
      icon: Clock,
      action: () => router.push('/mentor/availability')
    },
    {
      title: 'Profil',
      description: 'Modifier mon profil mentor',
      icon: Settings,
      action: () => router.push('/mentor/profile')
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50'
      case 'scheduled':
        return 'text-blue-600 bg-blue-50'
      case 'pending':
        return 'text-orange-600 bg-orange-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return CheckCircle
      case 'scheduled':
        return Clock
      case 'pending':
        return AlertCircle
      default:
        return Clock
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Mentor</h1>
              <p className="text-gray-600">Bienvenue, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Rôle: Mentor</span>
              <Button variant="outline" onClick={() => router.push('/mentor/sessions/new')}>
                Nouvelle Session
              </Button>
              <Button variant="outline" onClick={() => router.push('/mentor/settings')}>
                Paramètres
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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

        {/* Sessions à venir et activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Prochaines Sessions</CardTitle>
              <CardDescription>Vos sessions de mentorat à venir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions.map((session) => {
                  const StatusIcon = getStatusIcon(session.status)
                  return (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getStatusColor(session.status)}`}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{session.studentName}</p>
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
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>Vos dernières interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Session complétée avec Marie</p>
                    <p className="text-xs text-gray-500">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nouvel avis 5 étoiles</p>
                    <p className="text-xs text-gray-500">Il y a 4 heures</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nouvelle demande de mentorat</p>
                    <p className="text-xs text-gray-500">Il y a 6 heures</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <MessageSquare className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Message d'Ahmed</p>
                    <p className="text-xs text-gray-500">Il y a 1 jour</p>
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
