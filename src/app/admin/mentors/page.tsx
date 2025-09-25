'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Star, Users, DollarSign, CheckCircle, XCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login')
      return
    }

    // Simulation du chargement des mentors
    const loadMentors = async () => {
      setIsLoading(true)
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Données simulées
        const mockMentors = [
          {
            id: '1',
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@example.com',
            specialties: ['Mathématiques', 'Physique'],
            hourly_rate: 50,
            rating: 4.8,
            studentsCount: 25,
            status: 'approved',
            experience: '5 ans',
            education: 'PhD en Mathématiques'
          },
          {
            id: '2',
            name: 'Prof. Michael Chen',
            email: 'michael.chen@example.com',
            specialties: ['Informatique', 'Programmation'],
            hourly_rate: 60,
            rating: 4.9,
            studentsCount: 18,
            status: 'pending',
            experience: '8 ans',
            education: 'Master en Informatique'
          },
          {
            id: '3',
            name: 'Dr. Emily Rodriguez',
            email: 'emily.rodriguez@example.com',
            specialties: ['Chimie', 'Biologie'],
            hourly_rate: 45,
            rating: 4.7,
            studentsCount: 32,
            status: 'approved',
            experience: '6 ans',
            education: 'PhD en Chimie'
          }
        ]
        setMentors(mockMentors)
      } catch (error) {
        console.error('Erreur lors du chargement des mentors:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMentors()
  }, [isAuthenticated, user, router])

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.specialties.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approuvé</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejeté</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleApproveMentor = (mentorId: string) => {
    setMentors(mentors.map(mentor => 
      mentor.id === mentorId 
        ? { ...mentor, status: 'approved' }
        : mentor
    ))
  }

  const handleRejectMentor = (mentorId: string) => {
    setMentors(mentors.map(mentor => 
      mentor.id === mentorId 
        ? { ...mentor, status: 'rejected' }
        : mentor
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des mentors...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Mentors</h1>
              <p className="text-gray-600 mt-2">Approuvez et gérez les mentors de la plateforme</p>
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
                <Users className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Mentors</p>
                  <p className="text-2xl font-bold text-gray-900">{mentors.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approuvés</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mentors.filter(m => m.status === 'approved').length}
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
                  <p className="text-sm font-medium text-gray-600">En Attente</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mentors.filter(m => m.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Taux Moyen</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(mentors.reduce((acc, m) => acc + (m.hourly_rate || 0), 0) / mentors.length)}€/h
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
                    placeholder="Rechercher par nom, email ou spécialité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des mentors */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Mentors</CardTitle>
            <CardDescription>
              {filteredMentors.length} mentor(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredMentors.map((mentor) => (
                <div key={mentor.id} className="border rounded-lg p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-600">
                          {(mentor.name || 'M').split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{mentor.name || 'Mentor'}</h3>
                          {getStatusBadge(mentor.status)}
                        </div>
                        <p className="text-gray-600 mb-2">{mentor.email}</p>
                        <p className="text-sm text-gray-500 mb-3">{mentor.education}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            {mentor.rating}/5
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 text-blue-500 mr-1" />
                            {mentor.studentsCount || 0} étudiants
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                            {mentor.hourly_rate || 0}€/h
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">Spécialités:</p>
                          <div className="flex flex-wrap gap-1">
                            {mentor.specialties.map((specialty: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {mentor.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleApproveMentor(mentor.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approuver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleRejectMentor(mentor.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    )}
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
