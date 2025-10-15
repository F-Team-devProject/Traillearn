'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { mentoringService } from '@/lib/mentoringService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  Briefcase, 
  MapPin, 
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Plus,
  Edit,
  MessageSquare,
  Target,
  TrendingUp
} from 'lucide-react'
import { MentoringSessionExtended, SessionChecklistItem } from '@/types'

export default function MentoringSessionsPage() {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<MentoringSessionExtended[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<MentoringSessionExtended | null>(null)
  const [checklistItems, setChecklistItems] = useState<SessionChecklistItem[]>([])
  const [showNewSessionForm, setShowNewSessionForm] = useState(false)
  const [newSession, setNewSession] = useState({
    subject: '',
    sessionType: 'academic' as 'academic' | 'career' | 'integration' | 'job_preparation',
    preferredDate: '',
    preferredTime: '',
    duration: 60,
    objectives: [''],
    notes: ''
  })

  useEffect(() => {
    if (user) {
      fetchSessions()
    }
  }, [user])

  const fetchSessions = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Déterminer si l'utilisateur est mentor ou étudiant
      const userType = user.is_mentor && user.mentor_status === 'approved' ? 'mentor' : 'student'
      
      let result
      if (userType === 'mentor') {
        result = await mentoringService.getMentorSessions(user.id)
      } else {
        result = await mentoringService.getStudentSessions(user.id)
      }

      if (result.error) {
        console.error('Erreur lors du chargement des sessions:', result.error)
      } else {
        setSessions(result.sessions)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchChecklistItems = async (sessionId: string) => {
    try {
      const { items, error } = await mentoringService.getSessionChecklistItems(sessionId)
      if (error) {
        console.error('Erreur lors du chargement des items:', error)
      } else {
        setChecklistItems(items)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des items:', error)
    }
  }

  const handleSessionSelect = (session: MentoringSessionExtended) => {
    setSelectedSession(session)
    fetchChecklistItems(session.id)
  }

  const handleCreateSession = async () => {
    if (!user || !newSession.subject.trim()) return

    // Simulation - dans un vrai projet, il faudrait sélectionner un mentor
    const mockMentorId = 'mentor-123'

    try {
      const result = await mentoringService.createSessionRequest({
        mentorId: mockMentorId,
        studentId: user.id,
        subject: newSession.subject,
        sessionType: newSession.sessionType,
        preferredDate: newSession.preferredDate,
        preferredTime: newSession.preferredTime,
        duration: newSession.duration,
        objectives: newSession.objectives.filter(obj => obj.trim() !== ''),
        notes: newSession.notes
      })

      if (result.error) {
        alert(`Erreur: ${result.error}`)
      } else {
        setSessions(prev => [result.session!, ...prev])
        setNewSession({
          subject: '',
          sessionType: 'academic',
          preferredDate: '',
          preferredTime: '',
          duration: 60,
          objectives: [''],
          notes: ''
        })
        setShowNewSessionForm(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la session:', error)
    }
  }

  const handleUpdateChecklistItem = async (itemId: string, isCompleted: boolean) => {
    try {
      const result = await mentoringService.updateChecklistItem(itemId, { 
        is_completed: isCompleted 
      })
      
      if (result.success) {
        setChecklistItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, is_completed: isCompleted } : item
        ))
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <BookOpen className="h-4 w-4" />
      case 'career':
        return <Briefcase className="h-4 w-4" />
      case 'integration':
        return <MapPin className="h-4 w-4" />
      case 'job_preparation':
        return <Users className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getSessionTypeLabel = (type: string) => {
    switch (type) {
      case 'academic':
        return 'Académique'
      case 'career':
        return 'Carrière'
      case 'integration':
        return 'Intégration'
      case 'job_preparation':
        return 'Recherche d\'emploi'
      default:
        return type
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Planifiée'
      case 'completed':
        return 'Terminée'
      case 'cancelled':
        return 'Annulée'
      case 'in_progress':
        return 'En cours'
      default:
        return status
    }
  }

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.date) >= new Date())
  const completedSessions = sessions.filter(s => s.status === 'completed')
  const cancelledSessions = sessions.filter(s => s.status === 'cancelled')

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour accéder aux sessions de mentorat.</p>
      </div>
    )
  }

  const isMentor = user.is_mentor && user.mentor_status === 'approved'
  const isStudent = user.is_student && user.student_status === 'active'

  if (!isMentor && !isStudent) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Accès aux sessions de mentorat</h2>
        <p className="text-gray-600 mb-4">
          Vous devez activer votre statut étudiant ou mentor pour accéder aux sessions de mentorat.
        </p>
        <Button onClick={() => window.location.href = '/profile/roles'}>
          Gérer mes rôles
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sessions de Mentorat</h1>
        <p className="text-gray-600 mt-2">
          {isMentor ? 'Gérez vos sessions avec vos étudiants' : 'Suivez vos sessions avec vos mentors'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des sessions */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">
                À venir ({upcomingSessions.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Terminées ({completedSessions.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled">
                Annulées ({cancelledSessions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {isStudent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Nouvelle Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!showNewSessionForm ? (
                      <Button onClick={() => setShowNewSessionForm(true)} className="w-full">
                        Demander une session
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="subject">Sujet de la session *</Label>
                          <Input
                            id="subject"
                            value={newSession.subject}
                            onChange={(e) => setNewSession(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Ex: Préparation aux entretiens d'embauche"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="sessionType">Type de session</Label>
                          <Select
                            value={newSession.sessionType}
                            onValueChange={(value: any) => setNewSession(prev => ({ ...prev, sessionType: value }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="academic">Académique</SelectItem>
                              <SelectItem value="career">Carrière</SelectItem>
                              <SelectItem value="integration">Intégration</SelectItem>
                              <SelectItem value="job_preparation">Recherche d'emploi</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="date">Date préférée</Label>
                            <Input
                              id="date"
                              type="date"
                              value={newSession.preferredDate}
                              onChange={(e) => setNewSession(prev => ({ ...prev, preferredDate: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="time">Heure préférée</Label>
                            <Input
                              id="time"
                              type="time"
                              value={newSession.preferredTime}
                              onChange={(e) => setNewSession(prev => ({ ...prev, preferredTime: e.target.value }))}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="objectives">Objectifs</Label>
                          <div className="space-y-2 mt-1">
                            {newSession.objectives.map((objective, index) => (
                              <Input
                                key={index}
                                value={objective}
                                onChange={(e) => {
                                  const newObjectives = [...newSession.objectives]
                                  newObjectives[index] = e.target.value
                                  setNewSession(prev => ({ ...prev, objectives: newObjectives }))
                                }}
                                placeholder={`Objectif ${index + 1}`}
                              />
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setNewSession(prev => ({ 
                                ...prev, 
                                objectives: [...prev.objectives, ''] 
                              }))}
                            >
                              Ajouter un objectif
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="notes">Notes (optionnel)</Label>
                          <Textarea
                            id="notes"
                            value={newSession.notes}
                            onChange={(e) => setNewSession(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Informations supplémentaires..."
                            className="mt-1"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={handleCreateSession} className="flex-1">
                            Créer la demande
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setShowNewSessionForm(false)}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {upcomingSessions.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune session à venir</h3>
                    <p className="text-gray-600">
                      {isStudent ? 'Demandez une nouvelle session pour commencer.' : 'Aucune session planifiée avec vos étudiants.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <Card 
                      key={session.id} 
                      className={`cursor-pointer hover:shadow-lg transition-shadow ${
                        selectedSession?.id === session.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleSessionSelect(session)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getSessionTypeIcon(session.session_type)}
                              <h3 className="text-lg font-semibold">{session.subject}</h3>
                              <Badge className={getStatusColor(session.status)}>
                                {getStatusIcon(session.status)}
                                <span className="ml-1">{getStatusText(session.status)}</span>
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(session.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{session.time} ({session.duration}min)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {getSessionTypeLabel(session.session_type)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{isMentor ? 'Étudiant' : 'Mentor'}</span>
                              </div>
                            </div>

                            {session.objectives.length > 0 && (
                              <div className="mt-3">
                                <h4 className="font-medium mb-2">Objectifs:</h4>
                                <ul className="space-y-1">
                                  {session.objectives.slice(0, 2).map((objective, index) => (
                                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                      <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                                      {objective}
                                    </li>
                                  ))}
                                  {session.objectives.length > 2 && (
                                    <li className="text-sm text-gray-500">
                                      +{session.objectives.length - 2} autres objectifs
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedSessions.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune session terminée</h3>
                    <p className="text-gray-600">Les sessions terminées apparaîtront ici.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {completedSessions.map((session) => (
                    <Card 
                      key={session.id} 
                      className={`cursor-pointer hover:shadow-lg transition-shadow ${
                        selectedSession?.id === session.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleSessionSelect(session)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getSessionTypeIcon(session.session_type)}
                              <h3 className="text-lg font-semibold">{session.subject}</h3>
                              <Badge className={getStatusColor(session.status)}>
                                {getStatusIcon(session.status)}
                                <span className="ml-1">{getStatusText(session.status)}</span>
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(session.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{session.time} ({session.duration}min)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {getSessionTypeLabel(session.session_type)}
                                </Badge>
                              </div>
                              {session.rating && (
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span>{session.rating}/5</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {cancelledSessions.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune session annulée</h3>
                    <p className="text-gray-600">Les sessions annulées apparaîtront ici.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {cancelledSessions.map((session) => (
                    <Card key={session.id} className="opacity-75">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getSessionTypeIcon(session.session_type)}
                              <h3 className="text-lg font-semibold">{session.subject}</h3>
                              <Badge className={getStatusColor(session.status)}>
                                {getStatusIcon(session.status)}
                                <span className="ml-1">{getStatusText(session.status)}</span>
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(session.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{session.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">
                                  {getSessionTypeLabel(session.session_type)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Détails de la session sélectionnée */}
        <div className="lg:col-span-1">
          {selectedSession ? (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Détails de la Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">{selectedSession.subject}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      {getSessionTypeIcon(selectedSession.session_type)}
                      <Badge variant="outline">
                        {getSessionTypeLabel(selectedSession.session_type)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Date:</span>
                        <p>{new Date(selectedSession.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div>
                        <span className="font-medium">Heure:</span>
                        <p>{selectedSession.time}</p>
                      </div>
                      <div>
                        <span className="font-medium">Durée:</span>
                        <p>{selectedSession.duration} minutes</p>
                      </div>
                      <div>
                        <span className="font-medium">Statut:</span>
                        <Badge className={getStatusColor(selectedSession.status)}>
                          {getStatusText(selectedSession.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {selectedSession.objectives.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Objectifs</h4>
                      <ul className="space-y-2">
                        {selectedSession.objectives.map((objective, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedSession.outcomes && selectedSession.outcomes.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Résultats</h4>
                      <ul className="space-y-2">
                        {selectedSession.outcomes.map((outcome, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedSession.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Notes</h4>
                      <p className="text-sm text-gray-600">{selectedSession.notes}</p>
                    </div>
                  )}

                  {selectedSession.rating && (
                    <div>
                      <h4 className="font-semibold mb-2">Évaluation</h4>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="font-semibold">{selectedSession.rating}/5</span>
                      </div>
                      {selectedSession.feedback && (
                        <p className="text-sm text-gray-600 mt-2">{selectedSession.feedback}</p>
                      )}
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-3">Checklist de Session</h4>
                    <div className="space-y-3">
                      {checklistItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <button
                            onClick={() => handleUpdateChecklistItem(item.id, !item.is_completed)}
                            className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center ${
                              item.is_completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300'
                            }`}
                          >
                            {item.is_completed && <CheckCircle className="h-3 w-3" />}
                          </button>
                          <div className="flex-1">
                            <p className={`text-sm ${item.is_completed ? 'line-through text-gray-500' : ''}`}>
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contacter
                    </Button>
                    {selectedSession.status === 'scheduled' && (
                      <Button variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sélectionnez une session</h3>
                <p className="text-gray-600">
                  Cliquez sur une session pour voir les détails et la checklist.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
