'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Users, Star, MessageSquare, Calendar } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function MentorStudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'mentor') {
      router.push('/auth/login')
      return
    }

    // Simulation du chargement des étudiants
    const loadStudents = async () => {
      setIsLoading(true)
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Données simulées
        const mockStudents = [
          {
            id: '1',
            name: 'Marie Dupont',
            email: 'marie.dupont@example.com',
            level: 'Lycée',
            subjects: ['Mathématiques', 'Physique'],
            sessionsCount: 12,
            lastSession: '2024-01-18',
            nextSession: '2024-01-25',
            progress: 75,
            rating: 4.5
          },
          {
            id: '2',
            name: 'Pierre Martin',
            email: 'pierre.martin@example.com',
            level: 'Université',
            subjects: ['Informatique'],
            sessionsCount: 8,
            lastSession: '2024-01-15',
            nextSession: '2024-01-22',
            progress: 60,
            rating: 4.8
          },
          {
            id: '3',
            name: 'Sophie Bernard',
            email: 'sophie.bernard@example.com',
            level: 'Collège',
            subjects: ['Mathématiques', 'Chimie'],
            sessionsCount: 15,
            lastSession: '2024-01-20',
            nextSession: '2024-01-27',
            progress: 90,
            rating: 4.2
          }
        ]
        setStudents(mockStudents)
      } catch (error) {
        console.error('Erreur lors du chargement des étudiants:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStudents()
  }, [isAuthenticated, user, router])

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.subjects.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'Collège':
        return <Badge className="bg-blue-100 text-blue-800">Collège</Badge>
      case 'Lycée':
        return <Badge className="bg-green-100 text-green-800">Lycée</Badge>
      case 'Université':
        return <Badge className="bg-purple-100 text-purple-800">Université</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des étudiants...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Mes Étudiants</h1>
              <p className="text-gray-600 mt-2">Gérez vos étudiants et suivez leur progression</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/mentor/dashboard')}>
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
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Étudiants</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sessions ce mois</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.reduce((acc, s) => acc + s.sessionsCount, 0)}
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
                    {(students.reduce((acc, s) => acc + s.rating, 0) / students.length).toFixed(1)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Progression Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher par nom, email ou matière..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des étudiants */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Étudiants</CardTitle>
            <CardDescription>
              {filteredStudents.length} étudiant(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredStudents.map((student) => (
                <div key={student.id} className="border rounded-lg p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-600">
                          {(student.name || 'S').split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{student.name || 'Étudiant'}</h3>
                          {getLevelBadge(student.level)}
                        </div>
                        <p className="text-gray-600 mb-2">{student.email}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                            {student.sessionsCount} sessions
                          </div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            {student.rating}/5
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Matières:</p>
                          <div className="flex flex-wrap gap-1">
                            {student.subjects.map((subject: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progression</span>
                            <span>{student.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          <p>Dernière session: {new Date(student.lastSession).toLocaleDateString('fr-FR')}</p>
                          {student.nextSession && (
                            <p>Prochaine session: {new Date(student.nextSession).toLocaleDateString('fr-FR')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm">
                        Voir le profil
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
