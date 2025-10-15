'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { eventService } from '@/lib/eventService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackToDashboardButton } from '@/components/ui/back-button'
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
  MapPin, 
  Users, 
  Globe,
  Building,
  GraduationCap,
  Briefcase,
  Microphone,
  Video,
  Plus,
  Search,
  Filter,
  Star,
  User,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Eye,
  MessageSquare,
  Download,
  ExternalLink
} from 'lucide-react'
import { EventExtended, EventRegistration } from '@/types'

export default function EventsPage() {
  const { user } = useAuthStore()
  const [events, setEvents] = useState<EventExtended[]>([])
  const [userRegistrations, setUserRegistrations] = useState<EventRegistration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventExtended | null>(null)
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    country: '',
    search: '',
    status: 'upcoming'
  })
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: '',
    type: 'webinar' as 'webinar' | 'bootcamp' | 'conference' | 'workshop',
    startDate: '',
    endDate: '',
    timezone: 'Europe/Paris',
    location: '',
    country: '',
    isOnline: true,
    maxParticipants: '',
    registrationDeadline: '',
    price: '',
    currency: 'EUR',
    tags: [''],
    requirements: [''],
    agenda: [''],
    speakers: [{ name: '', title: '', company: '', bio: '' }]
  })
  const [newRegistration, setNewRegistration] = useState({
    notes: '',
    questions: [{ question: '', answer: '' }]
  })

  const categories = [
    'Orientation et Carrière',
    'Études et Bourses',
    'Technologies',
    'Langues',
    'Intégration Culturelle',
    'Entrepreneuriat',
    'Recherche',
    'Développement Personnel'
  ]

  const countries = [
    'France', 'Canada', 'États-Unis', 'Royaume-Uni', 'Allemagne', 'Espagne',
    'Italie', 'Pays-Bas', 'Belgique', 'Suisse', 'Suède', 'Norvège',
    'Danemark', 'Finlande', 'Autriche', 'Portugal'
  ]

  const currencies = ['EUR', 'USD', 'CAD', 'GBP', 'CHF']

  const timezones = [
    'Europe/Paris',
    'America/Toronto',
    'America/New_York',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Australia/Sydney'
  ]

  useEffect(() => {
    fetchEvents()
    if (user) {
      fetchUserRegistrations()
    }
  }, [filters, user])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const { events, error } = await eventService.getEvents(filters)
      if (error) {
        console.error('Erreur lors du chargement des événements:', error)
      } else {
        setEvents(events)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserRegistrations = async () => {
    if (!user) return

    try {
      const { registrations, error } = await eventService.getUserRegistrations(user.id)
      if (error) {
        console.error('Erreur lors du chargement des inscriptions:', error)
      } else {
        setUserRegistrations(registrations)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des inscriptions:', error)
    }
  }

  const handleCreateEvent = async () => {
    if (!user || !newEvent.title.trim() || !newEvent.description.trim()) return

    setIsLoading(true)
    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        category: newEvent.category || 'Orientation et Carrière',
        type: newEvent.type,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate,
        timezone: newEvent.timezone,
        location: newEvent.location || undefined,
        country: newEvent.country || undefined,
        isOnline: newEvent.isOnline,
        maxParticipants: newEvent.maxParticipants ? parseInt(newEvent.maxParticipants) : undefined,
        registrationDeadline: newEvent.registrationDeadline || undefined,
        price: newEvent.price ? parseFloat(newEvent.price) : undefined,
        currency: newEvent.currency,
        organizerId: user.id,
        tags: newEvent.tags.filter(tag => tag.trim() !== ''),
        requirements: newEvent.requirements.filter(req => req.trim() !== ''),
        agenda: newEvent.agenda.filter(item => item.trim() !== ''),
        speakers: newEvent.speakers.filter(speaker => speaker.name.trim() !== '')
      }

      const { event, error } = await eventService.createEvent(eventData)
      
      if (error) {
        alert(`Erreur: ${error}`)
      } else {
        setEvents(prev => [event!, ...prev])
        setNewEvent({
          title: '',
          description: '',
          category: '',
          type: 'webinar',
          startDate: '',
          endDate: '',
          timezone: 'Europe/Paris',
          location: '',
          country: '',
          isOnline: true,
          maxParticipants: '',
          registrationDeadline: '',
          price: '',
          currency: 'EUR',
          tags: [''],
          requirements: [''],
          agenda: [''],
          speakers: [{ name: '', title: '', company: '', bio: '' }]
        })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterForEvent = async () => {
    if (!user || !selectedEvent) return

    setIsLoading(true)
    try {
      const registrationData = {
        eventId: selectedEvent.id,
        userId: user.id,
        registrationDate: new Date().toISOString(),
        status: 'registered' as const,
        notes: newRegistration.notes || undefined,
        questions: newRegistration.questions.filter(q => q.question.trim() !== '' && q.answer.trim() !== '')
      }

      const { registration, error } = await eventService.registerForEvent(registrationData)
      
      if (error) {
        alert(`Erreur: ${error}`)
      } else {
        fetchUserRegistrations()
        setNewRegistration({
          notes: '',
          questions: [{ question: '', answer: '' }]
        })
        setShowRegistrationForm(false)
        alert('Inscription réussie ! Vous recevrez un rappel avant l\'événement.')
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'webinar':
        return <Video className="h-4 w-4 text-blue-500" />
      case 'bootcamp':
        return <GraduationCap className="h-4 w-4 text-green-500" />
      case 'conference':
        return <Microphone className="h-4 w-4 text-purple-500" />
      case 'workshop':
        return <Building className="h-4 w-4 text-orange-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'webinar':
        return 'Webinaire'
      case 'bootcamp':
        return 'Bootcamp'
      case 'conference':
        return 'Conférence'
      case 'workshop':
        return 'Atelier'
      default:
        return type
    }
  }

  const getEventStatusIcon = (event: EventExtended) => {
    const now = new Date()
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)

    if (startDate > now) {
      return <Clock className="h-4 w-4 text-blue-500" />
    } else if (startDate <= now && endDate >= now) {
      return <Play className="h-4 w-4 text-green-500" />
    } else {
      return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventStatusColor = (event: EventExtended) => {
    const now = new Date()
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)

    if (startDate > now) {
      return 'bg-blue-100 text-blue-800'
    } else if (startDate <= now && endDate >= now) {
      return 'bg-green-100 text-green-800'
    } else {
      return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventStatusText = (event: EventExtended) => {
    const now = new Date()
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)

    if (startDate > now) {
      return 'À venir'
    } else if (startDate <= now && endDate >= now) {
      return 'En cours'
    } else {
      return 'Terminé'
    }
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

  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((date.getTime() - now.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 0) return 'Terminé'
    if (diffInMinutes < 60) return `Dans ${diffInMinutes}min`
    if (diffInMinutes < 1440) return `Dans ${Math.floor(diffInMinutes / 60)}h`
    if (diffInMinutes < 10080) return `Dans ${Math.floor(diffInMinutes / 1440)}j`
    return date.toLocaleDateString('fr-FR')
  }

  const upcomingEvents = events.filter(e => new Date(e.start_date) > new Date())
  const ongoingEvents = events.filter(e => {
    const now = new Date()
    return new Date(e.start_date) <= now && new Date(e.end_date) >= now
  })
  const pastEvents = events.filter(e => new Date(e.end_date) < new Date())

  const userRegisteredEvents = userRegistrations
    .filter(reg => reg.status === 'registered')
    .map(reg => reg.event)

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <Calendar className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour accéder aux événements.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              📅 Événements et Formations
            </h1>
            <p className="text-gray-600 mt-2">
              Participez à des webinaires, bootcamps et conférences pour développer vos compétences
            </p>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">
            À venir ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="ongoing">
            En cours ({ongoingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Terminés ({pastEvents.length})
          </TabsTrigger>
          <TabsTrigger value="my-events">
            Mes événements ({userRegisteredEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-6">
          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres de recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Recherche</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Rechercher un événement..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les catégories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les types</SelectItem>
                      <SelectItem value="webinar">Webinaire</SelectItem>
                      <SelectItem value="bootcamp">Bootcamp</SelectItem>
                      <SelectItem value="conference">Conférence</SelectItem>
                      <SelectItem value="workshop">Atelier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Select
                    value={filters.country}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Tous les pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les pays</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button onClick={fetchEvents} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Créer un événement */}
          {!showCreateForm ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Organiser un Événement
                </CardTitle>
                <CardDescription>
                  Créez et organisez vos propres webinaires, bootcamps ou conférences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowCreateForm(true)} className="w-full">
                  Créer un événement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Créer un Événement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="eventTitle">Titre de l'événement *</Label>
                    <Input
                      id="eventTitle"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Bootcamp Data Science"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="eventCategory">Catégorie</Label>
                    <Select
                      value={newEvent.category}
                      onValueChange={(value) => setNewEvent(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="eventType">Type d'événement</Label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(value: any) => setNewEvent(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webinar">Webinaire</SelectItem>
                        <SelectItem value="bootcamp">Bootcamp</SelectItem>
                        <SelectItem value="conference">Conférence</SelectItem>
                        <SelectItem value="workshop">Atelier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="eventPrice">Prix (optionnel)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="eventPrice"
                        type="number"
                        value={newEvent.price}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0"
                        className="flex-1"
                      />
                      <Select
                        value={newEvent.currency}
                        onValueChange={(value) => setNewEvent(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="startDate">Date de début *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">Date de fin *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Select
                      value={newEvent.timezone}
                      onValueChange={(value) => setNewEvent(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((timezone) => (
                          <SelectItem key={timezone} value={timezone}>
                            {timezone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxParticipants">Participants max (optionnel)</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={newEvent.maxParticipants}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, maxParticipants: e.target.value }))}
                      placeholder="100"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="eventDescription">Description *</Label>
                  <Textarea
                    id="eventDescription"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez votre événement, ses objectifs et ce que les participants vont apprendre..."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isOnline"
                    checked={newEvent.isOnline}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, isOnline: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="isOnline" className="flex items-center gap-2 cursor-pointer">
                    <Globe className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Événement en ligne</span>
                  </label>
                </div>

                {!newEvent.isOnline && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="eventLocation">Lieu</Label>
                      <Input
                        id="eventLocation"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Ex: Paris, France"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="eventCountry">Pays</Label>
                      <Select
                        value={newEvent.country}
                        onValueChange={(value) => setNewEvent(prev => ({ ...prev, country: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionner un pays" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button 
                    onClick={handleCreateEvent}
                    disabled={isLoading || !newEvent.title.trim() || !newEvent.description.trim() || !newEvent.startDate || !newEvent.endDate}
                    className="flex-1"
                  >
                    {isLoading ? 'Création...' : 'Créer l\'événement'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des événements à venir */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement des événements...</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun événement à venir</h3>
                <p className="text-gray-600">
                  Aucun événement ne correspond à vos critères de recherche.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getEventTypeIcon(event.type)}
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <Badge className={getEventStatusColor(event)}>
                            {getEventStatusIcon(event)}
                            <span className="ml-1">{getEventStatusText(event)}</span>
                          </Badge>
                          <Badge variant="outline">
                            {getEventTypeLabel(event.type)}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{event.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.start_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{getRelativeTime(event.start_date)}</span>
                          </div>
                          {event.is_online ? (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>En ligne</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{event.organizer?.first_name} {event.organizer?.last_name}</span>
                          </div>
                        </div>

                        {event.price && event.price > 0 && (
                          <div className="mt-2 text-sm">
                            <Badge variant="outline">
                              {event.price} {event.currency}
                            </Badge>
                          </div>
                        )}

                        {event.tags && event.tags.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {event.tags.slice(0, 5).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {event.tags.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{event.tags.length - 5}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="flex gap-4">
                        <Button 
                          onClick={() => {
                            setSelectedEvent(event)
                            setShowRegistrationForm(true)
                          }}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          S'inscrire
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ongoing" className="space-y-4">
          {ongoingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Play className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun événement en cours</h3>
                <p className="text-gray-600">Aucun événement n'est actuellement en cours.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {ongoingEvents.map((event) => (
                <Card key={event.id} className="border-green-200 bg-green-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Play className="h-5 w-5 text-green-600" />
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <Badge className="bg-green-100 text-green-800">
                            <Play className="h-4 w-4 mr-1" />
                            En cours
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.start_date)}</span>
                          </div>
                          {event.is_online ? (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>En ligne</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>En cours</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-4">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        <Play className="h-4 w-4 mr-2" />
                        Rejoindre
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastEvents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun événement terminé</h3>
                <p className="text-gray-600">Les événements terminés apparaîtront ici.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastEvents.map((event) => (
                <Card key={event.id} className="opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="h-4 w-4 text-gray-500" />
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <Badge className="bg-gray-100 text-gray-800">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Terminé
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.start_date)}</span>
                          </div>
                          {event.is_online ? (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>En ligne</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{event.organizer?.first_name} {event.organizer?.last_name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-4">
                      <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger le replay
                      </Button>
                      <Button variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Voir détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-events" className="space-y-4">
          {userRegisteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune inscription</h3>
                <p className="text-gray-600">
                  Vous n'êtes inscrit à aucun événement pour le moment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userRegisteredEvents.map((event) => (
                <Card key={event.id} className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Inscrit
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.start_date)}</span>
                          </div>
                          {event.is_online ? (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              <span>En ligne</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{getRelativeTime(event.start_date)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-4">
                      <Button className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Rejoindre
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contacter l'organisateur
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Formulaire d'inscription */}
      {selectedEvent && showRegistrationForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Inscription à l'événement</CardTitle>
            <CardDescription>
              {selectedEvent.title} - {formatDate(selectedEvent.start_date)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="registrationNotes">Notes (optionnel)</Label>
              <Textarea
                id="registrationNotes"
                value={newRegistration.notes}
                onChange={(e) => setNewRegistration(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Ajoutez des commentaires ou questions pour l'organisateur..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-base font-semibold mb-4 block">Questions personnalisées</Label>
              <div className="space-y-4">
                {newRegistration.questions.map((question, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="mb-3">
                      <Label>Question {index + 1}</Label>
                      <Input
                        value={question.question}
                        onChange={(e) => {
                          const newQuestions = [...newRegistration.questions]
                          newQuestions[index].question = e.target.value
                          setNewRegistration(prev => ({ ...prev, questions: newQuestions }))
                        }}
                        placeholder="Votre question..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Réponse</Label>
                      <Textarea
                        value={question.answer}
                        onChange={(e) => {
                          const newQuestions = [...newRegistration.questions]
                          newQuestions[index].answer = e.target.value
                          setNewRegistration(prev => ({ ...prev, questions: newQuestions }))
                        }}
                        placeholder="Votre réponse..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewRegistration(prev => ({ 
                    ...prev, 
                    questions: [...prev.questions, { question: '', answer: '' }] 
                  }))}
                >
                  Ajouter une question
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleRegisterForEvent}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Inscription...' : 'Confirmer l\'inscription'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowRegistrationForm(false)}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
