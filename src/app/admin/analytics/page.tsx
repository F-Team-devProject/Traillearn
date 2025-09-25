'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, Users, BookOpen, DollarSign, Star, Calendar, BarChart3 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login')
      return
    }

    // Simulation du chargement des analytics
    const loadAnalytics = async () => {
      setIsLoading(true)
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Données simulées
        const mockAnalytics = {
          overview: {
            totalUsers: 1250,
            totalMentors: 85,
            totalSessions: 3420,
            totalRevenue: 125000,
            averageRating: 4.7,
            activeUsers: 890
          },
          growth: {
            usersGrowth: 15.2,
            mentorsGrowth: 8.5,
            sessionsGrowth: 22.1,
            revenueGrowth: 18.7
          },
          topMentors: [
            { name: 'Dr. Sarah Johnson', sessions: 156, rating: 4.9, revenue: 7800 },
            { name: 'Prof. Michael Chen', sessions: 142, rating: 4.8, revenue: 8520 },
            { name: 'Dr. Emily Rodriguez', sessions: 138, rating: 4.7, revenue: 6210 }
          ],
          popularSubjects: [
            { subject: 'Mathématiques', sessions: 456, students: 234 },
            { subject: 'Informatique', sessions: 389, students: 198 },
            { subject: 'Physique', sessions: 312, students: 156 },
            { subject: 'Chimie', sessions: 267, students: 134 }
          ],
          monthlyStats: [
            { month: 'Jan', users: 1200, sessions: 320, revenue: 12000 },
            { month: 'Fév', users: 1250, sessions: 340, revenue: 12500 },
            { month: 'Mar', users: 1300, sessions: 360, revenue: 13000 }
          ]
        }
        setAnalytics(mockAnalytics)
      } catch (error) {
        console.error('Erreur lors du chargement des analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [isAuthenticated, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Erreur lors du chargement des données</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-600 mt-2">Analysez les performances de la plateforme</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Utilisateurs Totaux</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{analytics.growth.usersGrowth}% ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sessions Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalSessions.toLocaleString()}</p>
                  <p className="text-sm text-green-600">+{analytics.growth.sessionsGrowth}% ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalRevenue.toLocaleString()}€</p>
                  <p className="text-sm text-green-600">+{analytics.growth.revenueGrowth}% ce mois</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Note Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageRating}/5</p>
                  <p className="text-sm text-gray-600">Basé sur {analytics.overview.totalSessions} sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Mentors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Top Mentors
              </CardTitle>
              <CardDescription>Les mentors les plus performants ce mois</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topMentors.map((mentor: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{mentor.name}</h4>
                        <p className="text-sm text-gray-600">{mentor.sessions} sessions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {mentor.rating}
                      </div>
                      <p className="text-sm font-medium text-green-600">{mentor.revenue}€</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Matières Populaires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Matières Populaires
              </CardTitle>
              <CardDescription>Les matières les plus demandées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.popularSubjects.map((subject: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                      <p className="text-sm text-gray-600">{subject.students} étudiants</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-blue-600">{subject.sessions}</p>
                      <p className="text-sm text-gray-600">sessions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques Mensuelles */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Évolution Mensuelle
            </CardTitle>
            <CardDescription>Comparaison des 3 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Mois</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Utilisateurs</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Sessions</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Revenus</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.monthlyStats.map((stat: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4 font-medium text-gray-900">{stat.month}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{stat.users.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{stat.sessions.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{stat.revenue.toLocaleString()}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
