'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
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
  MapPin, 
  Users, 
  Home, 
  Car, 
  Heart, 
  ShoppingBag,
  Utensils,
  Banknote,
  Phone,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  MessageSquare,
  Plane,
  Building,
  Globe
} from 'lucide-react'
import { IntegrationAssistance, IntegrationChecklistItem } from '@/types'

export default function IntegrationPage() {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [integrationRequests, setIntegrationRequests] = useState<IntegrationAssistance[]>([])
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<IntegrationAssistance | null>(null)
  const [newRequest, setNewRequest] = useState({
    destination_country: '',
    destination_city: '',
    airport_pickup: false,
    accommodation_help: false,
    local_contacts_shared: false,
    cultural_activities: false,
    arrival_date: '',
    notes: ''
  })

  const [checklistItems, setChecklistItems] = useState<IntegrationChecklistItem[]>([])

  // Données simulées pour la démonstration
  const mockIntegrationRequests: IntegrationAssistance[] = [
    {
      id: '1',
      userId: user?.id || '',
      destination_country: 'France',
      destination_city: 'Paris',
      mentor_id: 'mentor-123',
      status: 'in_progress',
      airport_pickup: true,
      accommodation_help: true,
      local_contacts_shared: false,
      cultural_activities: true,
      checklist_items: [
        {
          id: '1',
          integration_id: '1',
          title: 'Accueil à l\'aéroport',
          description: 'Récupération à l\'aéroport et transport vers le logement',
          category: 'arrival',
          is_completed: true,
          completed_by_mentor: true,
          completed_date: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          integration_id: '1',
          title: 'Visite du quartier',
          description: 'Découverte des commerces et services locaux',
          category: 'cultural',
          is_completed: false,
          completed_by_mentor: false
        }
      ],
      rating: 0,
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    }
  ]

  const mockChecklistTemplates = {
    'France': [
      { category: 'arrival', title: 'Accueil à l\'aéroport', description: 'Récupération et transport vers le logement' },
      { category: 'accommodation', title: 'Visite du logement', description: 'Inspection et familiarisation avec les équipements' },
      { category: 'administrative', title: 'Ouverture compte bancaire', description: 'Accompagnement à la banque pour ouvrir un compte' },
      { category: 'administrative', title: 'Inscription à la sécurité sociale', description: 'Démarches pour l\'assurance maladie' },
      { category: 'cultural', title: 'Visite du quartier', description: 'Découverte des commerces et services locaux' },
      { category: 'cultural', title: 'Participation à des événements', description: 'Intégration dans la communauté locale' }
    ],
    'Canada': [
      { category: 'arrival', title: 'Accueil à l\'aéroport', description: 'Récupération et transport vers le logement' },
      { category: 'administrative', title: 'Demande de SIN', description: 'Numéro d\'assurance sociale canadien' },
      { category: 'administrative', title: 'Ouverture compte bancaire', description: 'Accompagnement à la banque' },
      { category: 'cultural', title: 'Découverte de la ville', description: 'Visite des quartiers et attractions' },
      { category: 'social', title: 'Rencontre avec la communauté', description: 'Intégration dans les groupes locaux' }
    ]
  }

  const countries = [
    { code: 'FR', name: 'France' },
    { code: 'CA', name: 'Canada' },
    { code: 'US', name: 'États-Unis' },
    { code: 'GB', name: 'Royaume-Uni' },
    { code: 'DE', name: 'Allemagne' },
    { code: 'ES', name: 'Espagne' },
    { code: 'IT', name: 'Italie' },
    { code: 'NL', name: 'Pays-Bas' },
    { code: 'BE', name: 'Belgique' },
    { code: 'CH', name: 'Suisse' }
  ]

  const cities = {
    'France': ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Montpellier', 'Strasbourg'],
    'Canada': ['Toronto', 'Montréal', 'Vancouver', 'Calgary', 'Ottawa', 'Edmonton', 'Québec', 'Winnipeg'],
    'États-Unis': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'],
    'Royaume-Uni': ['Londres', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool', 'Leeds', 'Edinburgh', 'Bristol']
  }

  useEffect(() => {
    // Charger les demandes d'intégration de l'utilisateur
    setIntegrationRequests(mockIntegrationRequests)
  }, [user])

  const handleCreateRequest = async () => {
    if (!user || !newRequest.destination_country || !newRequest.destination_city) return

    setIsLoading(true)
    try {
      // Simulation de création de demande
      const request: IntegrationAssistance = {
        id: Date.now().toString(),
        userId: user.id,
        destination_country: newRequest.destination_country,
        destination_city: newRequest.destination_city,
        status: 'requested',
        airport_pickup: newRequest.airport_pickup,
        accommodation_help: newRequest.accommodation_help,
        local_contacts_shared: newRequest.local_contacts_shared,
        cultural_activities: newRequest.cultural_activities,
        checklist_items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Créer les items de checklist par défaut
      const templateItems = mockChecklistTemplates[newRequest.destination_country as keyof typeof mockChecklistTemplates] || []
      request.checklist_items = templateItems.map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        integration_id: request.id,
        title: item.title,
        description: item.description,
        category: item.category as any,
        is_completed: false,
        completed_by_mentor: false
      }))

      setIntegrationRequests(prev => [request, ...prev])
      setNewRequest({
        destination_country: '',
        destination_city: '',
        airport_pickup: false,
        accommodation_help: false,
        local_contacts_shared: false,
        cultural_activities: false,
        arrival_date: '',
        notes: ''
      })
      setShowRequestForm(false)
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'assigned':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'in_progress':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'completed':
        return <Star className="h-4 w-4 text-purple-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-100 text-yellow-800'
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'requested':
        return 'Demande envoyée'
      case 'assigned':
        return 'Mentor assigné'
      case 'in_progress':
        return 'En cours'
      case 'completed':
        return 'Terminée'
      default:
        return status
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'arrival':
        return <Plane className="h-4 w-4 text-blue-500" />
      case 'accommodation':
        return <Home className="h-4 w-4 text-green-500" />
      case 'administrative':
        return <Building className="h-4 w-4 text-purple-500" />
      case 'cultural':
        return <Globe className="h-4 w-4 text-orange-500" />
      case 'social':
        return <Users className="h-4 w-4 text-pink-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'arrival':
        return 'Arrivée'
      case 'accommodation':
        return 'Logement'
      case 'administrative':
        return 'Administratif'
      case 'cultural':
        return 'Culturel'
      case 'social':
        return 'Social'
      default:
        return category
    }
  }

  const completedRequests = integrationRequests.filter(req => req.status === 'completed')
  const activeRequests = integrationRequests.filter(req => req.status !== 'completed')

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour accéder à l'aide à l'intégration.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MapPin className="h-8 w-8 text-green-600" />
          Aide à l'Intégration
        </h1>
        <p className="text-gray-600 mt-2">
          Bénéficiez d'un accompagnement personnalisé pour votre intégration dans votre nouvelle destination
        </p>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">
            Mes Demandes ({activeRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Terminées ({completedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="new">
            Nouvelle Demande
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          {activeRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune demande d'intégration</h3>
                <p className="text-gray-600 mb-4">
                  Créez votre première demande pour bénéficier d'un accompagnement personnalisé.
                </p>
                <Button onClick={() => {
                  const newTab = document.querySelector('[value="new"]') as HTMLElement;
                  if (newTab) newTab.click();
                }}>
                  Créer une demande
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-green-600" />
                          {request.destination_city}, {request.destination_country}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Demande créée le {new Date(request.created_at).toLocaleDateString('fr-FR')}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{getStatusText(request.status)}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Services demandés</h4>
                        <div className="space-y-2">
                          {request.airport_pickup && (
                            <div className="flex items-center gap-2">
                              <Plane className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">Accueil à l'aéroport</span>
                            </div>
                          )}
                          {request.accommodation_help && (
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Aide au logement</span>
                            </div>
                          )}
                          {request.local_contacts_shared && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-purple-500" />
                              <span className="text-sm">Contacts locaux</span>
                            </div>
                          )}
                          {request.cultural_activities && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-orange-500" />
                              <span className="text-sm">Activités culturelles</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Progression</h4>
                        <div className="space-y-2">
                          {request.checklist_items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                              {item.is_completed ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-gray-400" />
                              )}
                              <span className={`text-sm ${item.is_completed ? 'line-through text-gray-500' : ''}`}>
                                {item.title}
                              </span>
                            </div>
                          ))}
                          {request.checklist_items.length > 3 && (
                            <div className="text-sm text-gray-500">
                              +{request.checklist_items.length - 3} autres tâches
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="flex gap-4">
                        <Button 
                          onClick={() => setSelectedRequest(request)}
                          className="flex-1"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Voir les détails
                        </Button>
                        {request.mentor_id && (
                          <Button variant="outline">
                            Contacter le mentor
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune intégration terminée</h3>
                <p className="text-gray-600">Les intégrations terminées apparaîtront ici.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedRequests.map((request) => (
                <Card key={request.id} className="border-green-200 bg-green-50/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <MapPin className="h-5 w-5 text-green-600" />
                          <h3 className="text-lg font-semibold">
                            {request.destination_city}, {request.destination_country}
                          </h3>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{getStatusText(request.status)}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Terminé le {new Date(request.updated_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                          
                          {request.rating && (
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span>{request.rating}/5</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{request.checklist_items.filter(item => item.is_completed).length}/{request.checklist_items.length} tâches</span>
                          </div>
                        </div>
                        
                        {request.feedback && (
                          <div className="mt-3 p-3 bg-white rounded-lg">
                            <h4 className="font-medium mb-1">Votre feedback</h4>
                            <p className="text-sm text-gray-600">{request.feedback}</p>
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

        <TabsContent value="new" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle Demande d'Intégration</CardTitle>
              <CardDescription>
                Décrivez vos besoins pour bénéficier d'un accompagnement personnalisé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="country">Pays de destination *</Label>
                  <Select
                    value={newRequest.destination_country}
                    onValueChange={(value) => {
                      setNewRequest(prev => ({ 
                        ...prev, 
                        destination_country: value,
                        destination_city: '' // Reset city when country changes
                      }))
                    }}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="city">Ville de destination *</Label>
                  <Select
                    value={newRequest.destination_city}
                    onValueChange={(value) => setNewRequest(prev => ({ ...prev, destination_city: value }))}
                    disabled={!newRequest.destination_country}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {newRequest.destination_country && 
                        cities[newRequest.destination_country as keyof typeof cities]?.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="arrivalDate">Date d'arrivée prévue</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={newRequest.arrival_date}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, arrival_date: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-base font-semibold mb-4 block">Services d'accompagnement</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="airportPickup"
                      checked={newRequest.airport_pickup}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, airport_pickup: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="airportPickup" className="flex items-center gap-2 cursor-pointer">
                      <Plane className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Accueil à l'aéroport</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="accommodationHelp"
                      checked={newRequest.accommodation_help}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, accommodation_help: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="accommodationHelp" className="flex items-center gap-2 cursor-pointer">
                      <Home className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Aide au logement</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="localContacts"
                      checked={newRequest.local_contacts_shared}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, local_contacts_shared: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="localContacts" className="flex items-center gap-2 cursor-pointer">
                      <Phone className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Contacts locaux</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="culturalActivities"
                      checked={newRequest.cultural_activities}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, cultural_activities: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="culturalActivities" className="flex items-center gap-2 cursor-pointer">
                      <Globe className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Activités culturelles</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Informations supplémentaires</Label>
                <Textarea
                  id="notes"
                  value={newRequest.notes}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Décrivez vos besoins spécifiques, votre situation, ou toute information utile..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleCreateRequest}
                  disabled={isLoading || !newRequest.destination_country || !newRequest.destination_city}
                  className="flex-1"
                >
                  {isLoading ? 'Création...' : 'Créer la demande'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setNewRequest({
                    destination_country: '',
                    destination_city: '',
                    airport_pickup: false,
                    accommodation_help: false,
                    local_contacts_shared: false,
                    cultural_activities: false,
                    arrival_date: '',
                    notes: ''
                  })}
                >
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Détails de la demande sélectionnée */}
      {selectedRequest && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Détails de l'Intégration - {selectedRequest.destination_city}, {selectedRequest.destination_country}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Checklist d'Intégration</h4>
                <div className="space-y-4">
                  {selectedRequest.checklist_items.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(item.category)}
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(item.category)}
                        </Badge>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          {item.is_completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                          )}
                          <div>
                            <h5 className={`font-medium ${item.is_completed ? 'line-through text-gray-500' : ''}`}>
                              {item.title}
                            </h5>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            {item.is_completed && item.completed_date && (
                              <p className="text-xs text-gray-500 mt-1">
                                Terminé le {new Date(item.completed_date).toLocaleDateString('fr-FR')}
                                {item.completed_by_mentor && ' par le mentor'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex gap-4">
                <Button className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contacter le mentor
                </Button>
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
