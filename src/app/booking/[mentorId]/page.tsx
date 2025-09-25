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
  Euro,
  User,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  BookOpen,
  MessageCircle,
  Star
} from 'lucide-react'
import { localMentorAPI, localUserAPI, localSessionAPI } from '@/lib/localStorage'
import { Mentor } from '@/types'

interface MentoringSession {
  id: string
  mentorId: string
  studentId: string
  subject: string
  date: string
  time: string
  duration: number
  status: string
  notes?: string
}

interface BookingPageProps {
  params: {
    mentorId: string
  }
}

export default function BookingPage({ params }: BookingPageProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('60')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [message, setMessage] = useState('')
  const [bookingStep, setBookingStep] = useState(1)
  const [isBooking, setIsBooking] = useState(false)

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ]

  const durations = [
    { value: '30', label: '30 minutes - 15€' },
    { value: '60', label: '1 heure - 30€' },
    { value: '90', label: '1h30 - 45€' },
    { value: '120', label: '2 heures - 60€' }
  ]

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    loadMentorData()
  }, [params.mentorId, isAuthenticated])

  const loadMentorData = async () => {
    try {
      setLoading(true)
      const mentorData = await localMentorAPI.getMentorById(params.mentorId)
      setMentor(mentorData)
    } catch (error) {
      console.error('Erreur lors du chargement du mentor:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePrice = () => {
    if (!mentor || !selectedDuration) return 0
    const duration = parseInt(selectedDuration)
    return (mentor.hourly_rate * duration) / 60
  }

  const handleNextStep = () => {
    if (bookingStep === 1 && selectedDate && selectedTime) {
      setBookingStep(2)
    } else if (bookingStep === 2 && selectedSubject) {
      setBookingStep(3)
    }
  }

  const handlePreviousStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1)
    }
  }

  const handleBooking = async () => {
    if (!mentor || !user) return

    setIsBooking(true)
    try {
      const sessionData = {
        mentorId: mentor.id,
        studentId: user.id,
        subject: selectedSubject,
        date: selectedDate,
        time: selectedTime,
        duration: parseInt(selectedDuration),
        status: 'scheduled' as const,
        notes: message,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const result = await localSessionAPI.createSession(sessionData)
      
      if (result) {
        setBookingStep(4) // Page de confirmation
      } else {
        alert('Erreur lors de la réservation')
      }
    } catch (error) {
      console.error('Erreur lors de la réservation:', error)
      alert('Erreur lors de la réservation')
    } finally {
      setIsBooking(false)
    }
  }

  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
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
              Mentor non trouvé
            </h3>
            <Button onClick={() => router.push('/mentors')}>
              Retour aux mentors
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
                onClick={() => router.push(`/mentor/${params.mentorId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Réserver une session avec {mentor.name}
                </h1>
                <p className="text-gray-600">Étape {bookingStep} sur 3</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            {bookingStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Choisir la date et l'heure
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez le créneau qui vous convient
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sélection de la date */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Date</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {getAvailableDates().map((date) => {
                        const dateObj = new Date(date)
                        const isSelected = selectedDate === date
                        return (
                          <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={`p-3 text-center border rounded-lg transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-sm font-medium">
                              {dateObj.toLocaleDateString('fr-FR', { weekday: 'short' })}
                            </div>
                            <div className="text-lg font-bold">
                              {dateObj.getDate()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {dateObj.toLocaleDateString('fr-FR', { month: 'short' })}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Sélection de l'heure */}
                  {selectedDate && (
                    <div>
                      <Label className="text-base font-semibold mb-3 block">Heure</Label>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {timeSlots.map((time) => {
                          const isSelected = selectedTime === time
                          return (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`p-3 text-center border rounded-lg transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {time}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Durée */}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Durée de la session</Label>
                    <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir la durée" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {bookingStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Détails de la session
                  </CardTitle>
                  <CardDescription>
                    Précisez le sujet et vos objectifs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="subject">Matière / Sujet</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir la matière" />
                      </SelectTrigger>
                      <SelectContent>
                        {(mentor.specialties || []).map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message pour le mentor (optionnel)</Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez vos objectifs, questions spécifiques, ou tout ce que vous aimeriez aborder pendant la session..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {bookingStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Confirmation de réservation
                  </CardTitle>
                  <CardDescription>
                    Vérifiez les détails avant de confirmer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mentor:</span>
                      <span className="font-medium">{mentor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heure:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durée:</span>
                      <span className="font-medium">{selectedDuration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sujet:</span>
                      <span className="font-medium">{selectedSubject}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-3">
                      <span>Total:</span>
                      <span className="text-green-600">{calculatePrice().toFixed(2)}€</span>
                    </div>
                  </div>

                  {message && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Votre message:</Label>
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded mt-1">
                        {message}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {bookingStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Réservation confirmée !
                  </CardTitle>
                  <CardDescription>
                    Votre session a été réservée avec succès
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Prochaines étapes :</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Vous recevrez un email de confirmation</li>
                      <li>• Le lien de la session sera envoyé 1h avant</li>
                      <li>• Préparez vos questions et documents</li>
                    </ul>
                  </div>

                  <div className="flex space-x-3">
                    <Button onClick={() => router.push('/student/dashboard')}>
                      Voir mes sessions
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/mentors')}>
                      Trouver d'autres mentors
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            {bookingStep < 4 && (
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={bookingStep === 1}
                >
                  Précédent
                </Button>
                
                {bookingStep < 3 ? (
                  <Button
                    onClick={handleNextStep}
                    disabled={
                      (bookingStep === 1 && (!selectedDate || !selectedTime)) ||
                      (bookingStep === 2 && !selectedSubject)
                    }
                  >
                    Suivant
                  </Button>
                ) : (
                  <Button
                    onClick={handleBooking}
                    disabled={isBooking}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isBooking ? 'Réservation...' : 'Confirmer la réservation'}
                  </Button>
                )}
              </div>
            )}
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
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {(mentor.rating || 0).toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taux horaire:</span>
                    <span className="font-medium">{mentor.hourly_rate}€/h</span>
                  </div>
                  {selectedDuration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Durée:</span>
                      <span className="font-medium">{selectedDuration} min</span>
                    </div>
                  )}
                  {selectedDuration && (
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">{calculatePrice().toFixed(2)}€</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Le paiement sera effectué après la session
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
