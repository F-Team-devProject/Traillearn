'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { feedbackService } from '@/lib/feedbackService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackToDashboardButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Star, 
  MessageSquare, 
  ThumbsUp, 
  Clock, 
  User,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Heart,
  Target,
  Users,
  Globe,
  Shield,
  Zap,
  Calendar,
  Filter
} from 'lucide-react'

interface Mentor {
  id: string
  first_name: string
  last_name: string
  profile_picture?: string
  expertise: string[]
  averageRating?: number
  totalRatings?: number
}

interface Session {
  id: string
  mentor_id: string
  student_id: string
  title: string
  date: string
  status: string
  mentor: {
    first_name: string
    last_name: string
  }
}

export default function FeedbackPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('mentor')
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [feedbackHistory, setFeedbackHistory] = useState<any>({ mentorFeedbacks: [], platformFeedbacks: [] })
  const [isLoading, setIsLoading] = useState(false)

  // État du formulaire de feedback mentor
  const [mentorFeedback, setMentorFeedback] = useState({
    rating: 0,
    comment: '',
    categories: {
      communication: 0,
      expertise: 0,
      punctuality: 0,
      helpfulness: 0
    }
  })

  // État du formulaire de feedback plateforme
  const [platformFeedback, setPlatformFeedback] = useState({
    rating: 0,
    comment: '',
    category: 'general'
  })

  useEffect(() => {
    if (user) {
      fetchMentors()
      fetchSessions()
      fetchFeedbackHistory()
    }
  }, [user])

  const fetchMentors = async () => {
    // Simulation de données pour la démonstration
    const mockMentors: Mentor[] = [
      {
        id: '1',
        first_name: 'Jean',
        last_name: 'Dupont',
        expertise: ['Développement Web', 'React', 'Node.js'],
        averageRating: 4.8,
        totalRatings: 25
      },
      {
        id: '2',
        first_name: 'Marie',
        last_name: 'Martin',
        expertise: ['Data Science', 'Python', 'Machine Learning'],
        averageRating: 4.9,
        totalRatings: 18
      },
      {
        id: '3',
        first_name: 'Pierre',
        last_name: 'Durand',
        expertise: ['Cybersécurité', 'Ethical Hacking', 'Cloud Security'],
        averageRating: 4.7,
        totalRatings: 32
      }
    ]
    setMentors(mockMentors)
  }

  const fetchSessions = async () => {
    if (!user) return

    // Simulation de données pour la démonstration
    const mockSessions: Session[] = [
      {
        id: '1',
        mentor_id: '1',
        student_id: user.id,
        title: 'Session React Avancé',
        date: '2024-01-15T10:00:00Z',
        status: 'completed',
        mentor: {
          first_name: 'Jean',
          last_name: 'Dupont'
        }
      },
      {
        id: '2',
        mentor_id: '2',
        student_id: user.id,
        title: 'Introduction au Machine Learning',
        date: '2024-01-20T14:00:00Z',
        status: 'completed',
        mentor: {
          first_name: 'Marie',
          last_name: 'Martin'
        }
      }
    ]
    setSessions(mockSessions)
  }

  const fetchFeedbackHistory = async () => {
    if (!user) return

    try {
      const { mentorFeedbacks, platformFeedbacks, error } = await feedbackService.getUserFeedbackHistory(user.id)
      if (error) {
        console.error('Erreur lors du chargement de l\'historique:', error)
      } else {
        setFeedbackHistory({ mentorFeedbacks, platformFeedbacks })
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error)
    }
  }

  const handleMentorFeedbackSubmit = async () => {
    if (!user || !selectedMentor || mentorFeedback.rating === 0) {
      alert('Veuillez sélectionner un mentor et donner une note.')
      return
    }

    setIsLoading(true)
    try {
      const { success, error } = await feedbackService.submitMentorFeedback({
        mentorId: selectedMentor.id,
        studentId: user.id,
        sessionId: selectedSession?.id,
        rating: mentorFeedback.rating,
        comment: mentorFeedback.comment,
        categories: mentorFeedback.categories
      })

      if (error) {
        alert(`Erreur: ${error}`)
      } else {
        alert('Feedback soumis avec succès ! Vous avez gagné 25 points.')
        setMentorFeedback({ rating: 0, comment: '', categories: { communication: 0, expertise: 0, punctuality: 0, helpfulness: 0 } })
        setSelectedMentor(null)
        setSelectedSession(null)
        fetchFeedbackHistory()
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      alert('Une erreur est survenue.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlatformFeedbackSubmit = async () => {
    if (!user || platformFeedback.rating === 0) {
      alert('Veuillez donner une note.')
      return
    }

    setIsLoading(true)
    try {
      const { success, error } = await feedbackService.submitPlatformFeedback({
        userId: user.id,
        rating: platformFeedback.rating,
        comment: platformFeedback.comment,
        category: platformFeedback.category as any
      })

      if (error) {
        alert(`Erreur: ${error}`)
      } else {
        alert('Feedback soumis avec succès ! Vous avez gagné 15 points.')
        setPlatformFeedback({ rating: 0, comment: '', category: 'general' })
        fetchFeedbackHistory()
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      alert('Une erreur est survenue.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStars = (rating: number, onRatingChange?: (rating: number) => void, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    )
  }

  const renderCategoryStars = (value: number, onChange: (value: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= value 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } cursor-pointer hover:text-yellow-300`}
            onClick={() => onChange(star)}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <MessageSquare className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour laisser des feedbacks.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              ⭐ Feedback et Notation
            </h1>
            <p className="text-gray-600 mt-2">
              Partagez votre expérience et aidez la communauté à s'améliorer
            </p>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mentor">Feedback Mentor</TabsTrigger>
          <TabsTrigger value="platform">Feedback Plateforme</TabsTrigger>
          <TabsTrigger value="history">Mon Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="mentor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Sélectionner un Mentor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Mentors disponibles</Label>
                  <div className="space-y-2 mt-2">
                    {mentors.map((mentor) => (
                      <div
                        key={mentor.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedMentor?.id === mentor.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedMentor(mentor)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">
                              {mentor.first_name} {mentor.last_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {mentor.expertise.join(', ')}
                            </p>
                          </div>
                          <div className="text-right">
                            {mentor.averageRating && (
                              <div className="flex items-center gap-1">
                                {renderStars(mentor.averageRating)}
                                <span className="text-sm text-gray-600">
                                  ({mentor.totalRatings})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedMentor && (
                  <div>
                    <Label>Sessions disponibles</Label>
                    <div className="space-y-2 mt-2">
                      {sessions
                        .filter(session => session.mentor_id === selectedMentor.id)
                        .map((session) => (
                          <div
                            key={session.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedSession?.id === session.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedSession(session)}
                          >
                            <h4 className="font-medium">{session.title}</h4>
                            <p className="text-sm text-gray-600">
                              {formatDate(session.date)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Donner un Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedMentor ? (
                  <>
                    <div>
                      <Label>Note globale</Label>
                      <div className="mt-2">
                        {renderStars(mentorFeedback.rating, (rating) => 
                          setMentorFeedback({ ...mentorFeedback, rating }), true)}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Évaluation détaillée</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Communication
                          </Label>
                          {renderCategoryStars(
                            mentorFeedback.categories.communication,
                            (value) => setMentorFeedback({
                              ...mentorFeedback,
                              categories: { ...mentorFeedback.categories, communication: value }
                            })
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Expertise
                          </Label>
                          {renderCategoryStars(
                            mentorFeedback.categories.expertise,
                            (value) => setMentorFeedback({
                              ...mentorFeedback,
                              categories: { ...mentorFeedback.categories, expertise: value }
                            })
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Ponctualité
                          </Label>
                          {renderCategoryStars(
                            mentorFeedback.categories.punctuality,
                            (value) => setMentorFeedback({
                              ...mentorFeedback,
                              categories: { ...mentorFeedback.categories, punctuality: value }
                            })
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Utilité
                          </Label>
                          {renderCategoryStars(
                            mentorFeedback.categories.helpfulness,
                            (value) => setMentorFeedback({
                              ...mentorFeedback,
                              categories: { ...mentorFeedback.categories, helpfulness: value }
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="comment">Commentaire (optionnel)</Label>
                      <Textarea
                        id="comment"
                        placeholder="Partagez votre expérience avec ce mentor..."
                        value={mentorFeedback.comment}
                        onChange={(e) => setMentorFeedback({ ...mentorFeedback, comment: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <Button 
                      onClick={handleMentorFeedbackSubmit}
                      disabled={isLoading || mentorFeedback.rating === 0}
                      className="w-full"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Soumettre le feedback (+25 points)
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Sélectionnez un mentor</h3>
                    <p className="text-gray-600">
                      Choisissez un mentor pour laisser un feedback sur votre expérience.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Feedback sur la Plateforme
              </CardTitle>
              <CardDescription>
                Aidez-nous à améliorer Traillearn en partageant votre expérience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Note globale de la plateforme</Label>
                <div className="mt-2">
                  {renderStars(platformFeedback.rating, (rating) => 
                    setPlatformFeedback({ ...platformFeedback, rating }), true)}
                </div>
              </div>

              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={platformFeedback.category}
                  onValueChange={(value) => setPlatformFeedback({ ...platformFeedback, category: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Général</SelectItem>
                    <SelectItem value="features">Fonctionnalités</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="bugs">Bugs</SelectItem>
                    <SelectItem value="suggestions">Suggestions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="platform-comment">Commentaire</Label>
                <Textarea
                  id="platform-comment"
                  placeholder="Décrivez votre expérience avec la plateforme..."
                  value={platformFeedback.comment}
                  onChange={(e) => setPlatformFeedback({ ...platformFeedback, comment: e.target.value })}
                  className="mt-2"
                />
              </div>

              <Button 
                onClick={handlePlatformFeedbackSubmit}
                disabled={isLoading || platformFeedback.rating === 0}
                className="w-full"
              >
                <Globe className="h-4 w-4 mr-2" />
                Soumettre le feedback (+15 points)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Feedbacks Mentors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedbackHistory.mentorFeedbacks.length > 0 ? (
                  <div className="space-y-4">
                    {feedbackHistory.mentorFeedbacks.map((feedback: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">
                            {feedback.mentor?.first_name} {feedback.mentor?.last_name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {renderStars(feedback.rating)}
                            <Badge variant="outline">{formatDate(feedback.created_at)}</Badge>
                          </div>
                        </div>
                        {feedback.comment && (
                          <p className="text-gray-600 text-sm">{feedback.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun feedback mentor</h3>
                    <p className="text-gray-600">
                      Vous n'avez pas encore laissé de feedback pour des mentors.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Feedbacks Plateforme
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedbackHistory.platformFeedbacks.length > 0 ? (
                  <div className="space-y-4">
                    {feedbackHistory.platformFeedbacks.map((feedback: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold capitalize">{feedback.category}</h3>
                          <div className="flex items-center gap-2">
                            {renderStars(feedback.rating)}
                            <Badge variant="outline">{formatDate(feedback.created_at)}</Badge>
                          </div>
                        </div>
                        {feedback.comment && (
                          <p className="text-gray-600 text-sm">{feedback.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun feedback plateforme</h3>
                    <p className="text-gray-600">
                      Vous n'avez pas encore laissé de feedback pour la plateforme.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
