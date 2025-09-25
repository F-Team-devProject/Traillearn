'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Flag, MessageSquare, User, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function AdminModerationPage() {
  const [reports, setReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login')
      return
    }

    // Simulation du chargement des signalements
    const loadReports = async () => {
      setIsLoading(true)
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Données simulées
        const mockReports = [
          {
            id: '1',
            type: 'inappropriate_content',
            title: 'Contenu inapproprié dans un message',
            description: 'Un mentor a envoyé des messages inappropriés à un étudiant',
            reporter: 'Étudiant anonyme',
            reportedUser: 'Dr. John Smith',
            status: 'pending',
            createdAt: '2024-01-20',
            severity: 'high'
          },
          {
            id: '2',
            type: 'spam',
            title: 'Compte spam détecté',
            description: 'Compte créé récemment avec des messages répétitifs',
            reporter: 'Système automatique',
            reportedUser: 'user123@spam.com',
            status: 'pending',
            createdAt: '2024-01-19',
            severity: 'medium'
          },
          {
            id: '3',
            type: 'harassment',
            title: 'Harcèlement présumé',
            description: 'Un étudiant se plaint de harcèlement de la part de son mentor',
            reporter: 'Marie Dupont',
            reportedUser: 'Prof. Martin',
            status: 'resolved',
            createdAt: '2024-01-18',
            severity: 'high'
          }
        ]
        setReports(mockReports)
      } catch (error) {
        console.error('Erreur lors du chargement des signalements:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReports()
  }, [isAuthenticated, user, router])

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">Élevée</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Moyenne</Badge>
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Faible</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Résolu</Badge>
      case 'dismissed':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Rejeté</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inappropriate_content':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'spam':
        return <Flag className="w-5 h-5 text-yellow-500" />
      case 'harassment':
        return <User className="w-5 h-5 text-orange-500" />
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />
    }
  }

  const handleResolveReport = (reportId: string) => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, status: 'resolved' }
        : report
    ))
  }

  const handleDismissReport = (reportId: string) => {
    setReports(reports.map(report => 
      report.id === reportId 
        ? { ...report, status: 'dismissed' }
        : report
    ))
  }

  const pendingReports = reports.filter(r => r.status === 'pending')
  const resolvedReports = reports.filter(r => r.status === 'resolved')
  const dismissedReports = reports.filter(r => r.status === 'dismissed')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des signalements...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Modération</h1>
              <p className="text-gray-600 mt-2">Gérez les signalements et maintenez la qualité de la plateforme</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Flag className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Signalements</p>
                  <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Attente</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Résolus</p>
                  <p className="text-2xl font-bold text-gray-900">{resolvedReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-gray-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejetés</p>
                  <p className="text-2xl font-bold text-gray-900">{dismissedReports.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              En Attente ({pendingReports.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Résolus ({resolvedReports.length})
            </TabsTrigger>
            <TabsTrigger value="dismissed">
              Rejetés ({dismissedReports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun signalement en attente</h3>
                  <p className="text-gray-600">Tous les signalements ont été traités.</p>
                </CardContent>
              </Card>
            ) : (
              pendingReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        {getTypeIcon(report.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                            {getSeverityBadge(report.severity)}
                            {getStatusBadge(report.status)}
                          </div>
                          <p className="text-gray-600 mb-3">{report.description}</p>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p><strong>Signalé par:</strong> {report.reporter}</p>
                            <p><strong>Utilisateur signalé:</strong> {report.reportedUser}</p>
                            <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleResolveReport(report.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Résoudre
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDismissReport(report.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            {resolvedReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun signalement résolu</h3>
                  <p className="text-gray-600">Les signalements résolus apparaîtront ici.</p>
                </CardContent>
              </Card>
            ) : (
              resolvedReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {getTypeIcon(report.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                          {getSeverityBadge(report.severity)}
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-gray-600 mb-3">{report.description}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p><strong>Signalé par:</strong> {report.reporter}</p>
                          <p><strong>Utilisateur signalé:</strong> {report.reportedUser}</p>
                          <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="dismissed" className="space-y-4">
            {dismissedReports.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun signalement rejeté</h3>
                  <p className="text-gray-600">Les signalements rejetés apparaîtront ici.</p>
                </CardContent>
              </Card>
            ) : (
              dismissedReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {getTypeIcon(report.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                          {getSeverityBadge(report.severity)}
                          {getStatusBadge(report.status)}
                        </div>
                        <p className="text-gray-600 mb-3">{report.description}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p><strong>Signalé par:</strong> {report.reporter}</p>
                          <p><strong>Utilisateur signalé:</strong> {report.reportedUser}</p>
                          <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
