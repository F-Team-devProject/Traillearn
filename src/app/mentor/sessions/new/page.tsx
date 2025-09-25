'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  Plus,
  Save,
  BookOpen,
  Euro
} from 'lucide-react'
import { localMentorAPI, localUserAPI, localSessionAPI } from '@/lib/localStorage'
import { Mentor, User } from '@/types'

export default function NewSessionPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [students, setStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sessionData, setSessionData] = useState({
    student_id: '',
    subject: '',
    duration_minutes: 60,
    scheduled_at: '',
    price: 0,
    description: '',
    meeting_type: 'online' as 'online' | 'in_person'
  })

  const subjects = [
    'Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Informatique',
    'Économie', 'Histoire', 'Géographie', 'Français', 'Anglais',
    'Philosophie', 'Sciences Politiques', 'Droit', 'Médecine', 'Ingénierie'
  ]

  const durations = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 heure' },
    { value: 90, label: '1h30' },
    { value: 120, label: '2 heures' }
  ]

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'mentor') {
      router.push('/')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const mentorData = await localMentorAPI.getMentorByUserId(user?.id || '')
      setMentor(mentorData)
      
      // Charger les étudiants disponibles
      const allUsers = await localUserAPI.getAllUsers()
      const studentUsers = allUsers.filter(u => u.role === 'student')
      setStudents(studentUsers)
      
      // Initialiser le prix avec le taux horaire du mentor
      if (mentorData) {
        setSessionData(prev => ({
          ...prev,
          price: (mentorData.hourly_rate * prev.duration_minutes) / 60
        }))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDurationChange = (duration: number) => {
    setSessionData(prev => ({
      ...prev,
      duration_minutes: duration,
      price: mentor ? (mentor.hourly_rate * duration) / 60 : 0
    }))
  }

  const handleCreateSession = async () => {
    if (!mentor || !sessionData.student_id || !sessionData.subject || !sessionData.scheduled_at) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSaving(true)
    try {
      const session = {
        mentor_id: mentor.id,
        student_id: sessionData.student_id,
        subject: sessionData.subject,
        duration_minutes: sessionData.duration_minutes,
        scheduled_at: new Date(sessionData.scheduled_at).toISOString(),
        status: 'scheduled' as const,
        price: sessionData.price,
        description: sessionData.description,
        meeting_type: sessionData.meeting_type,
        meeting_link: sessionData.meeting_type === 'online' ? `https://meet.traillearn.com/${Date.now()}` : null,
        feedback: null,
        rating: null
      }

      const result = await localSessionAPI.createSession(session)
      
      if (result.success) {
        alert('Session créée avec succès !')
        router.push('/mentor/dashboard')
      } else {
        alert('Erreur lors de la création: ' + result.error)
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
      alert('Erreur lors de la création de la session')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
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
              Profil mentor non trouvé
            </h3>
            <Button onClick={() => router.push('/mentor/dashboard')}>
              Retour au dashboard
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
                onClick={() => router.push('/mentor/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nouvelle Session</h1>
                <p className="text-gray-600 mt-2">Planifiez une session avec un étudiant</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.push('/nav')}>
                Navigation
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Détails de la session
                </CardTitle>
                <CardDescription>
                  Remplissez les informations pour créer une nouvelle session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sélection de l'étudiant */}
                <div>
                  <Label htmlFor="student">Étudiant *</Label>
                  <Select 
                    value={sessionData.student_id} 
                    onValueChange={(value) => setSessionData(prev => ({ ...prev, student_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un étudiant" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Matière */}
                <div>
                  <Label htmlFor="subject">Matière *</Label>
                  <Select 
                    value={sessionData.subject} 
                    onValueChange={(value) => setSessionData(prev => ({ ...prev, subject: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la matière" />
                    </SelectTrigger>
                    <SelectContent>
                      {(mentor.specialties || []).map(specialty => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date et heure */}
                <div>
                  <Label htmlFor="datetime">Date et heure *</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={sessionData.scheduled_at}
                    onChange={(e) => setSessionData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                  />
                </div>

                {/* Durée */}
                <div>
                  <Label>Durée de la session</Label>
                  <Select 
                    value={sessionData.duration_minutes.toString()} 
                    onValueChange={(value) => handleDurationChange(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durations.map(duration => (
                        <SelectItem key={duration.value} value={duration.value.toString()}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type de session */}
                <div>
                  <Label>Type de session</Label>
                  <Select 
                    value={sessionData.meeting_type} 
                    onValueChange={(value) => setSessionData(prev => ({ ...prev, meeting_type: value as 'online' | 'in_person' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">En ligne</SelectItem>
                      <SelectItem value="in_person">En présentiel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez le contenu de la session, les objectifs, les sujets à aborder..."
                    value={sessionData.description}
                    onChange={(e) => setSessionData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {(mentor.name || 'M').split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium">{mentor.name || 'Mentor'}</p>
                    <p className="text-sm text-gray-600">Mentor</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taux horaire:</span>
                    <span className="font-medium">{mentor.hourly_rate}€/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Durée:</span>
                    <span className="font-medium">{sessionData.duration_minutes} min</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Prix total:</span>
                    <span className="text-green-600">{sessionData.price.toFixed(2)}€</span>
                  </div>
                </div>

                {sessionData.student_id && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-1">Étudiant sélectionné</h4>
                    <p className="text-sm text-blue-700">
                      {students.find(s => s.id === sessionData.student_id)?.name}
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  <Clock className="h-4 w-4 inline mr-1" />
                  La session sera automatiquement ajoutée au calendrier
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/mentor/dashboard')}
          >
            Annuler
          </Button>
          <Button
            onClick={handleCreateSession}
            disabled={saving || !sessionData.student_id || !sessionData.subject || !sessionData.scheduled_at}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Création...' : 'Créer la session'}
          </Button>
        </div>
      </main>
    </div>
  )
}


