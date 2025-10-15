'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Clock, User, Mail, MapPin, Calendar, Star } from 'lucide-react'

interface MentorRequest {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  country_code?: string
  specialties: string[]
  experience: string
  education: string
  languages: string[]
  timezone: string
  countries_served: string[]
  capacity_per_month: number
  mentor_status: 'pending' | 'approved' | 'rejected'
  mentor_validation_notes?: string
  created_at: string
  updated_at: string
}

export default function MentorValidationPage() {
  const { user, validateMentor } = useAuthStore()
  const [mentorRequests, setMentorRequests] = useState<MentorRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [validationNotes, setValidationNotes] = useState('')
  const [selectedMentor, setSelectedMentor] = useState<MentorRequest | null>(null)

  // Vérifier que l'utilisateur est admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
              <p className="text-gray-600">Vous devez être administrateur pour accéder à cette page.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    fetchMentorRequests()
  }, [])

  const fetchMentorRequests = async () => {
    setIsLoading(true)
    try {
      // Simulation de données - à remplacer par un appel API réel
      const mockRequests: MentorRequest[] = [
        {
          id: '1',
          user_id: 'user-1',
          first_name: 'Jean',
          last_name: 'Dupont',
          email: 'jean.dupont@example.com',
          phone: '+33123456789',
          country_code: 'FR',
          specialties: ['Data Science', 'Machine Learning'],
          experience: '5 ans d\'expérience en data science chez Google et Microsoft',
          education: 'Master en Informatique, École Polytechnique',
          languages: ['Français', 'Anglais'],
          timezone: 'Europe/Paris',
          countries_served: ['France', 'Canada'],
          capacity_per_month: 8,
          mentor_status: 'pending',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          user_id: 'user-2',
          first_name: 'Marie',
          last_name: 'Martin',
          email: 'marie.martin@example.com',
          phone: '+33198765432',
          country_code: 'FR',
          specialties: ['Cybersécurité', 'Ethical Hacking'],
          experience: '7 ans d\'expérience en cybersécurité, certifiée CISSP',
          education: 'Master en Cybersécurité, Université de Lyon',
          languages: ['Français', 'Anglais', 'Espagnol'],
          timezone: 'Europe/Paris',
          countries_served: ['France', 'Espagne'],
          capacity_per_month: 6,
          mentor_status: 'pending',
          created_at: '2024-01-16T14:30:00Z',
          updated_at: '2024-01-16T14:30:00Z'
        }
      ]
      setMentorRequests(mockRequests)
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidation = async (mentorId: string, approved: boolean) => {
    try {
      const result = await validateMentor(mentorId, approved, validationNotes)
      if (result.success) {
        // Mettre à jour la liste locale
        setMentorRequests(prev => 
          prev.map(mentor => 
            mentor.user_id === mentorId 
              ? { ...mentor, mentor_status: approved ? 'approved' : 'rejected', mentor_validation_notes: validationNotes }
              : mentor
          )
        )
        setSelectedMentor(null)
        setValidationNotes('')
        alert(`Demande ${approved ? 'approuvée' : 'rejetée'} avec succès`)
      } else {
        alert(`Erreur: ${result.error}`)
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
      alert('Une erreur est survenue')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approuvé'
      case 'rejected':
        return 'Rejeté'
      case 'pending':
        return 'En attente'
      default:
        return 'Inconnu'
    }
  }

  const pendingRequests = mentorRequests.filter(req => req.mentor_status === 'pending')
  const approvedRequests = mentorRequests.filter(req => req.mentor_status === 'approved')
  const rejectedRequests = mentorRequests.filter(req => req.mentor_status === 'rejected')

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Chargement des demandes...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Validation des Mentors</h1>
        <p className="text-gray-600 mt-2">
          Examinez et validez les demandes de statut mentor
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            En attente ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approuvés ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejetés ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune demande en attente</h3>
                <p className="text-gray-600">Toutes les demandes ont été traitées.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {pendingRequests.map((mentor) => (
                <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          {mentor.first_name} {mentor.last_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {mentor.email}
                          </span>
                          {mentor.phone && (
                            <span className="flex items-center gap-1">
                              📞 {mentor.phone}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(mentor.mentor_status)}>
                        {getStatusIcon(mentor.mentor_status)}
                        <span className="ml-1">{getStatusText(mentor.mentor_status)}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Domaines d'expertise</h4>
                          <div className="flex flex-wrap gap-2">
                            {mentor.specialties.map((specialty, index) => (
                              <Badge key={index} variant="outline">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Expérience</h4>
                          <p className="text-sm text-gray-600">{mentor.experience}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Formation</h4>
                          <p className="text-sm text-gray-600">{mentor.education}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Langues</h4>
                          <div className="flex flex-wrap gap-2">
                            {mentor.languages.map((language, index) => (
                              <Badge key={index} variant="secondary">
                                {language}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Pays d'intervention</h4>
                          <div className="flex flex-wrap gap-2">
                            {mentor.countries_served.map((country, index) => (
                              <Badge key={index} variant="outline">
                                {country}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-1">Capacité mensuelle</h4>
                            <p className="text-sm text-gray-600">{mentor.capacity_per_month} étudiants</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Fuseau horaire</h4>
                            <p className="text-sm text-gray-600">{mentor.timezone}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-1">Date de demande</h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(mentor.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="flex gap-4">
                        <Button
                          onClick={() => handleValidation(mentor.user_id, true)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approuver
                        </Button>
                        <Button
                          onClick={() => handleValidation(mentor.user_id, false)}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeter
                        </Button>
                      </div>
                      
                      <div className="mt-4">
                        <Label htmlFor={`notes-${mentor.id}`}>Notes de validation (optionnel)</Label>
                        <Textarea
                          id={`notes-${mentor.id}`}
                          placeholder="Ajoutez des commentaires sur votre décision..."
                          value={validationNotes}
                          onChange={(e) => setValidationNotes(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          {approvedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun mentor approuvé</h3>
                <p className="text-gray-600">Les mentors approuvés apparaîtront ici.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {approvedRequests.map((mentor) => (
                <Card key={mentor.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{mentor.first_name} {mentor.last_name}</h3>
                        <p className="text-sm text-gray-600">{mentor.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {mentor.specialties.slice(0, 3).map((specialty, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {mentor.specialties.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{mentor.specialties.length - 3} autres
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(mentor.mentor_status)}>
                        {getStatusIcon(mentor.mentor_status)}
                        <span className="ml-1">{getStatusText(mentor.mentor_status)}</span>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-6">
          {rejectedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune demande rejetée</h3>
                <p className="text-gray-600">Les demandes rejetées apparaîtront ici.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rejectedRequests.map((mentor) => (
                <Card key={mentor.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{mentor.first_name} {mentor.last_name}</h3>
                        <p className="text-sm text-gray-600">{mentor.email}</p>
                        {mentor.mentor_validation_notes && (
                          <p className="text-sm text-red-600 mt-2">
                            Raison: {mentor.mentor_validation_notes}
                          </p>
                        )}
                      </div>
                      <Badge className={getStatusColor(mentor.mentor_status)}>
                        {getStatusIcon(mentor.mentor_status)}
                        <span className="ml-1">{getStatusText(mentor.mentor_status)}</span>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
