'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { localUserAPI, localSessionAPI } from '@/lib/localStorage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Shield,
  Settings,
  BarChart3,
  MessageSquare,
  Globe
} from 'lucide-react'

interface DashboardStats {
  totalUsers: number
  totalMentors: number
  totalStudents: number
  totalSessions: number
  activeSessions: number
  completedSessions: number
  totalCommunities: number
  totalEvents: number
  recentRegistrations: number
  monthlyGrowth: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, signOut } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMentors: 0,
    totalStudents: 0,
    totalSessions: 0,
    activeSessions: 0,
    completedSessions: 0,
    totalCommunities: 0,
    totalEvents: 0,
    recentRegistrations: 0,
    monthlyGrowth: 0
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login')
      return
    }

    // Charger les vraies statistiques depuis localStorage
    const allUsers = localUserAPI.getAllUsers()
    const mentors = localUserAPI.getUsersByRole('mentor')
    const students = localUserAPI.getUsersByRole('student')
    const allSessions = localSessionAPI.getSessionsByUser('', 'mentor') // Récupérer toutes les sessions
    
    setStats({
      totalUsers: allUsers.length,
      totalMentors: mentors.length,
      totalStudents: students.length,
      totalSessions: allSessions.length,
      activeSessions: allSessions.filter(s => s.status === 'scheduled').length,
      completedSessions: allSessions.filter(s => s.status === 'completed').length,
      totalCommunities: 5, // Données simulées pour l'instant
      totalEvents: 3,
      recentRegistrations: Math.floor(allUsers.length * 0.1), // 10% des utilisateurs
      monthlyGrowth: 15.2
    })
  }, [isAuthenticated, user, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!isAuthenticated || user?.role !== 'admin') {
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
      title: 'Utilisateurs Total',
      value: (stats.totalUsers || 0).toLocaleString(),
      description: `+${stats.recentRegistrations || 0} cette semaine`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Mentors Actifs',
      value: (stats.totalMentors || 0).toLocaleString(),
      description: 'Mentors vérifiés',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Étudiants',
      value: (stats.totalStudents || 0).toLocaleString(),
      description: 'Étudiants inscrits',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Sessions de Mentorat',
      value: (stats.totalSessions || 0).toLocaleString(),
      description: `${stats.activeSessions || 0} en cours`,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Communautés',
      value: (stats.totalCommunities || 0).toLocaleString(),
      description: 'Communautés actives',
      icon: Globe,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Événements',
      value: (stats.totalEvents || 0).toLocaleString(),
      description: 'Événements programmés',
      icon: Calendar,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  ]

  const quickActions = [
    {
      title: 'Gérer les Utilisateurs',
      description: 'Voir et gérer tous les utilisateurs',
      icon: Users,
      action: () => router.push('/admin/users')
    },
    {
      title: 'Valider les Mentors',
      description: 'Approuver les demandes de mentorat',
      icon: UserCheck,
      action: () => router.push('/admin/mentors')
    },
    {
      title: 'Modérer le Contenu',
      description: 'Gérer les communautés et posts',
      icon: Shield,
      action: () => router.push('/admin/moderation')
    },
    {
      title: 'Analytics',
      description: 'Voir les statistiques détaillées',
      icon: BarChart3,
      action: () => router.push('/admin/analytics')
    },
    {
      title: 'Paramètres',
      description: 'Configuration de la plateforme',
      icon: Settings,
      action: () => router.push('/admin/settings')
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrateur</h1>
              <p className="text-gray-600">Bienvenue, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Rôle: Administrateur</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
              <CardDescription>Dernières actions sur la plateforme</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <UserCheck className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nouveau mentor approuvé</p>
                    <p className="text-xs text-gray-500">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">5 nouveaux utilisateurs</p>
                    <p className="text-xs text-gray-500">Il y a 4 heures</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <MessageSquare className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nouvelle session de mentorat</p>
                    <p className="text-xs text-gray-500">Il y a 6 heures</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Croissance mensuelle</CardTitle>
              <CardDescription>Évolution des indicateurs clés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nouveaux utilisateurs</span>
                  <span className="text-sm font-medium text-green-600">+{stats.monthlyGrowth}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sessions complétées</span>
                  <span className="text-sm font-medium text-green-600">+8.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Engagement</span>
                  <span className="text-sm font-medium text-green-600">+12.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Satisfaction</span>
                  <span className="text-sm font-medium text-green-600">+5.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
