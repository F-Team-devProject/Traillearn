'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { checklistService } from '@/lib/checklistService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  ClipboardCheck, 
  MapPin, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Info,
  ExternalLink,
  Calendar,
  DollarSign,
  FileText,
  Phone,
  Mail,
  Globe,
  Star,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'

interface ChecklistItem {
  id: string
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedTime: string
  cost?: number
  currency?: string
  documents: string[]
  tips: string[]
  warnings: string[]
  links: Array<{
    title: string
    url: string
    description?: string
  }>
  isRequired: boolean
  order: number
}

interface DestinationChecklist {
  id: string
  country: string
  city?: string
  region?: string
  description: string
  items: ChecklistItem[]
  tips: string[]
  warnings: string[]
  usefulContacts: Array<{
    name: string
    type: string
    phone?: string
    email?: string
    address?: string
    website?: string
    description?: string
  }>
  emergencyNumbers: Array<{
    number: string
    service: string
    description?: string
  }>
  localInfo: {
    currency: string
    language: string[]
    timezone: string
    climate: string
    bestTimeToVisit: string
    culturalNotes: string[]
  }
}

interface UserProgress {
  completedItems: string[]
  inProgressItems: string[]
  notes: Record<string, string>
}

export default function ChecklistsPage() {
  const { user } = useAuthStore()
  const [destinations, setDestinations] = useState<Array<{ id: string, country: string, city?: string, region?: string }>>([])
  const [selectedDestination, setSelectedDestination] = useState<string>('')
  const [checklist, setChecklist] = useState<DestinationChecklist | null>(null)
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Données de démonstration
  const mockDestinations = [
    { id: 'france-paris', country: 'France', city: 'Paris', region: 'Île-de-France' },
    { id: 'canada-toronto', country: 'Canada', city: 'Toronto', region: 'Ontario' },
    { id: 'germany-berlin', country: 'Allemagne', city: 'Berlin', region: 'Berlin' },
    { id: 'usa-nyc', country: 'États-Unis', city: 'New York', region: 'New York' }
  ]

  const mockChecklist: DestinationChecklist = {
    id: 'france-paris',
    country: 'France',
    city: 'Paris',
    region: 'Île-de-France',
    description: 'Checklist complète pour s\'installer à Paris, France',
    items: [
      {
        id: '1',
        title: 'Demande de Visa',
        description: 'Demander un visa étudiant ou de travail selon votre situation',
        category: 'visa',
        priority: 'critical',
        estimatedTime: '2-3 mois',
        cost: 99,
        currency: 'EUR',
        documents: ['Passeport', 'Justificatifs de ressources', 'Assurance maladie', 'Certificat d\'hébergement'],
        tips: ['Commencez la procédure 3 mois avant votre départ', 'Préparez tous les documents en français'],
        warnings: ['Les délais peuvent être longs en haute saison', 'Certains documents doivent être apostillés'],
        links: [
          { title: 'Ambassade de France', url: 'https://france-visas.gouv.fr', description: 'Site officiel des visas' }
        ],
        isRequired: true,
        order: 1
      },
      {
        id: '2',
        title: 'Assurance Maladie',
        description: 'Souscrire une assurance maladie obligatoire',
        category: 'insurance',
        priority: 'high',
        estimatedTime: '1 semaine',
        cost: 50,
        currency: 'EUR',
        documents: ['Carte vitale', 'Justificatif de domicile'],
        tips: ['Comparez les offres d\'assurance', 'Vérifiez la couverture dentaire et optique'],
        warnings: ['L\'assurance est obligatoire pour tous les résidents'],
        links: [
          { title: 'CPAM', url: 'https://www.ameli.fr', description: 'Caisse Primaire d\'Assurance Maladie' }
        ],
        isRequired: true,
        order: 2
      },
      {
        id: '3',
        title: 'Recherche de Logement',
        description: 'Trouver un logement adapté à vos besoins',
        category: 'housing',
        priority: 'high',
        estimatedTime: '1-2 mois',
        cost: 800,
        currency: 'EUR',
        documents: ['Justificatifs de revenus', 'Garant', 'Assurance habitation'],
        tips: ['Visitez plusieurs appartements', 'Négociez le loyer et les charges'],
        warnings: ['Attention aux arnaques sur les sites de location', 'Les cautions sont souvent importantes'],
        links: [
          { title: 'LeBonCoin', url: 'https://www.leboncoin.fr', description: 'Annonces immobilières' },
          { title: 'SeLoger', url: 'https://www.seloger.com', description: 'Agences immobilières' }
        ],
        isRequired: true,
        order: 3
      },
      {
        id: '4',
        title: 'Ouverture de Compte Bancaire',
        description: 'Ouvrir un compte bancaire français',
        category: 'banking',
        priority: 'medium',
        estimatedTime: '1 semaine',
        documents: ['Passeport', 'Justificatif de domicile', 'Justificatifs de revenus'],
        tips: ['Comparez les frais bancaires', 'Demandez une carte de crédit'],
        warnings: ['Certaines banques exigent un salaire minimum'],
        links: [
          { title: 'Banque de France', url: 'https://www.banque-france.fr', description: 'Informations bancaires' }
        ],
        isRequired: true,
        order: 4
      },
      {
        id: '5',
        title: 'Inscription à l\'Université',
        description: 'S\'inscrire dans votre établissement d\'enseignement',
        category: 'education',
        priority: 'high',
        estimatedTime: '2 semaines',
        cost: 300,
        currency: 'EUR',
        documents: ['Diplômes', 'Relevés de notes', 'CV', 'Lettre de motivation'],
        tips: ['Préparez votre CV en français', 'Rédigez une lettre de motivation personnalisée'],
        warnings: ['Les inscriptions ont des délais stricts', 'Certains programmes ont des prérequis'],
        links: [
          { title: 'Campus France', url: 'https://www.campusfrance.org', description: 'Études en France' }
        ],
        isRequired: true,
        order: 5
      }
    ],
    tips: [
      'Apprenez les bases du français avant votre arrivée',
      'Ouvrez un compte bancaire dès que possible',
      'Inscrivez-vous à la CAF pour les aides au logement',
      'Téléchargez les applications mobiles utiles (RATP, SNCF, etc.)'
    ],
    warnings: [
      'Les démarches administratives peuvent prendre du temps',
      'Gardez toujours des copies de vos documents importants',
      'Vérifiez les dates limites pour chaque démarche'
    ],
    usefulContacts: [
      {
        name: 'Ambassade de France',
        type: 'embassy',
        phone: '+33 1 43 12 22 22',
        address: '37 Quai d\'Orsay, 75007 Paris',
        website: 'https://france-visas.gouv.fr'
      },
      {
        name: 'CPAM Paris',
        type: 'service',
        phone: '3646',
        address: 'Service national',
        website: 'https://www.ameli.fr'
      },
      {
        name: 'Préfecture de Police',
        type: 'government',
        phone: '+33 1 55 76 20 00',
        address: '1 bis rue de Lutèce, 75004 Paris',
        website: 'https://www.prefecturedepolice.interieur.gouv.fr'
      }
    ],
    emergencyNumbers: [
      { number: '112', service: 'Urgences européen', description: 'Numéro d\'urgence unique' },
      { number: '15', service: 'SAMU', description: 'Urgences médicales' },
      { number: '17', service: 'Police', description: 'Police nationale' },
      { number: '18', service: 'Pompiers', description: 'Sapeurs-pompiers' }
    ],
    localInfo: {
      currency: 'Euro (EUR)',
      language: ['Français'],
      timezone: 'CET (UTC+1) / CEST (UTC+2)',
      climate: 'Temperé océanique',
      bestTimeToVisit: 'Avril à octobre',
      culturalNotes: [
        'Le français est la langue officielle',
        'La ponctualité est appréciée',
        'Les magasins ferment souvent entre 12h et 14h',
        'Le pourboire est inclus dans les restaurants'
      ]
    }
  }

  useEffect(() => {
    fetchDestinations()
  }, [])

  useEffect(() => {
    if (selectedDestination && user) {
      fetchChecklist()
      fetchUserProgress()
    }
  }, [selectedDestination, user])

  const fetchDestinations = async () => {
    try {
      const { destinations, error } = await checklistService.getDestinations()
      if (error) {
        console.error('Erreur lors du chargement des destinations:', error)
        setDestinations(mockDestinations)
      } else {
        setDestinations(destinations.length > 0 ? destinations : mockDestinations)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des destinations:', error)
      setDestinations(mockDestinations)
    }
  }

  const fetchChecklist = async () => {
    if (!selectedDestination) return

    setIsLoading(true)
    try {
      const { checklist: destinationChecklist, error } = await checklistService.getDestinationChecklist(selectedDestination)
      if (error) {
        console.error('Erreur lors du chargement de la checklist:', error)
        // Utiliser les données mock pour la démonstration
        if (selectedDestination === 'france-paris') {
          setChecklist(mockChecklist)
        }
      } else {
        setChecklist(destinationChecklist)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la checklist:', error)
      if (selectedDestination === 'france-paris') {
        setChecklist(mockChecklist)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProgress = async () => {
    if (!user || !selectedDestination) return

    try {
      const { progress, error } = await checklistService.getUserChecklistProgress(user.id, selectedDestination)
      if (error) {
        console.error('Erreur lors du chargement du progrès:', error)
      } else {
        setUserProgress(progress)
      }
    } catch (error) {
      console.error('Erreur lors du chargement du progrès:', error)
    }
  }

  const handleCompleteItem = async (itemId: string) => {
    if (!user || !selectedDestination) return

    try {
      const { success, error } = await checklistService.completeChecklistItem(user.id, selectedDestination, itemId)
      if (error) {
        alert(`Erreur: ${error}`)
      } else if (success) {
        alert('Étape complétée ! Vous avez gagné 10 points.')
        fetchUserProgress()
      }
    } catch (error) {
      console.error('Erreur lors de la completion:', error)
      alert('Une erreur est survenue.')
    }
  }

  const handleStartItem = async (itemId: string) => {
    if (!user || !selectedDestination) return

    try {
      const { success, error } = await checklistService.startChecklistItem(user.id, selectedDestination, itemId)
      if (error) {
        alert(`Erreur: ${error}`)
      } else if (success) {
        fetchUserProgress()
      }
    } catch (error) {
      console.error('Erreur lors du démarrage:', error)
      alert('Une erreur est survenue.')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'visa':
        return <FileText className="h-4 w-4" />
      case 'insurance':
        return <CheckCircle className="h-4 w-4" />
      case 'housing':
        return <MapPin className="h-4 w-4" />
      case 'banking':
        return <DollarSign className="h-4 w-4" />
      case 'education':
        return <Globe className="h-4 w-4" />
      case 'health':
        return <CheckCircle className="h-4 w-4" />
      case 'work':
        return <TrendingUp className="h-4 w-4" />
      case 'taxes':
        return <FileText className="h-4 w-4" />
      default:
        return <ClipboardCheck className="h-4 w-4" />
    }
  }

  const filteredItems = checklist?.items.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    
    return matchesSearch && matchesCategory
  }) || []

  const completionRate = checklist && userProgress 
    ? Math.round((userProgress.completedItems.length / checklist.items.length) * 100)
    : 0

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <ClipboardCheck className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour accéder aux checklists.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ClipboardCheck className="h-8 w-8 text-blue-600" />
          Checklists Administratives
        </h1>
        <p className="text-gray-600 mt-2">
          Guides complets pour votre installation à l'étranger
        </p>
      </div>

      <Tabs defaultValue="destinations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="checklist">Ma Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="destinations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choisir votre Destination</CardTitle>
              <CardDescription>
                Sélectionnez votre pays et ville de destination pour accéder à la checklist complète
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {destinations.map((destination) => (
                  <Card 
                    key={destination.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedDestination === destination.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedDestination(destination.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold">{destination.country}</h3>
                      {destination.city && (
                        <p className="text-sm text-gray-600">{destination.city}</p>
                      )}
                      {destination.region && (
                        <p className="text-xs text-gray-500">{destination.region}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-6">
          {selectedDestination && checklist ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {checklist.country} - {checklist.city}
                      </CardTitle>
                      <CardDescription>{checklist.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
                      <p className="text-sm text-gray-600">Complété</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                      <Label htmlFor="search">Rechercher</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="search"
                          placeholder="Rechercher une étape..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="category">Catégorie</Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Toutes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          <SelectItem value="visa">Visa</SelectItem>
                          <SelectItem value="insurance">Assurance</SelectItem>
                          <SelectItem value="housing">Logement</SelectItem>
                          <SelectItem value="banking">Banque</SelectItem>
                          <SelectItem value="education">Éducation</SelectItem>
                          <SelectItem value="health">Santé</SelectItem>
                          <SelectItem value="work">Travail</SelectItem>
                          <SelectItem value="taxes">Impôts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredItems.map((item) => {
                      const isCompleted = userProgress?.completedItems.includes(item.id) || false
                      const isInProgress = userProgress?.inProgressItems.includes(item.id) || false
                      const userNotes = userProgress?.notes[item.id] || ''

                      return (
                        <Card key={item.id} className={`${isCompleted ? 'bg-green-50 border-green-200' : isInProgress ? 'bg-blue-50 border-blue-200' : ''}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {getCategoryIcon(item.category)}
                                  <h3 className="text-lg font-semibold">{item.title}</h3>
                                  <Badge className={getPriorityColor(item.priority)}>
                                    {item.priority}
                                  </Badge>
                                  {item.isRequired && (
                                    <Badge variant="outline">Requis</Badge>
                                  )}
                                </div>
                                <p className="text-gray-600 mb-3">{item.description}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span>{item.estimatedTime}</span>
                                  </div>
                                  {item.cost && (
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="h-4 w-4 text-gray-400" />
                                      <span>{item.cost} {item.currency}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                    <span>{item.documents.length} documents</span>
                                  </div>
                                </div>

                                {item.documents.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="font-medium mb-2">Documents requis :</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {item.documents.map((doc, index) => (
                                        <Badge key={index} variant="outline">{doc}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {item.tips.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                      <Info className="h-4 w-4 text-blue-600" />
                                      Conseils :
                                    </h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                      {item.tips.map((tip, index) => (
                                        <li key={index}>• {tip}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {item.warnings.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="font-medium mb-2 flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                                      Avertissements :
                                    </h4>
                                    <ul className="text-sm text-orange-700 space-y-1">
                                      {item.warnings.map((warning, index) => (
                                        <li key={index}>• {warning}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {item.links.length > 0 && (
                                  <div className="mb-4">
                                    <h4 className="font-medium mb-2">Liens utiles :</h4>
                                    <div className="space-y-2">
                                      {item.links.map((link, index) => (
                                        <a 
                                          key={index}
                                          href={link.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          {link.title}
                                          {link.description && (
                                            <span className="text-gray-500">- {link.description}</span>
                                          )}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {userNotes && (
                                  <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                                    <h4 className="font-medium mb-1">Mes notes :</h4>
                                    <p className="text-sm text-gray-600">{userNotes}</p>
                                  </div>
                                )}
                              </div>

                              <div className="ml-4 flex flex-col gap-2">
                                {!isCompleted ? (
                                  <Button 
                                    onClick={() => handleCompleteItem(item.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                    size="sm"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Compléter
                                  </Button>
                                ) : (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Complété
                                  </Badge>
                                )}
                                
                                {!isInProgress && !isCompleted && (
                                  <Button 
                                    variant="outline"
                                    onClick={() => handleStartItem(item.id)}
                                    size="sm"
                                  >
                                    <Clock className="h-4 w-4 mr-1" />
                                    Commencer
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}

                    {filteredItems.length === 0 && (
                      <div className="text-center py-8">
                        <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Aucune étape trouvée</h3>
                        <p className="text-gray-600">
                          Aucune étape ne correspond à vos critères de recherche.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contacts Utiles
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {checklist.usefulContacts.map((contact, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <h4 className="font-semibold">{contact.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{contact.type}</p>
                          {contact.phone && (
                            <p className="text-sm flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {contact.phone}
                            </p>
                          )}
                          {contact.email && (
                            <p className="text-sm flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </p>
                          )}
                          {contact.address && (
                            <p className="text-sm">{contact.address}</p>
                          )}
                          {contact.website && (
                            <a 
                              href={contact.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Site web
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Numéros d'Urgence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {checklist.emergencyNumbers.map((number, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div>
                            <p className="font-bold text-lg text-red-800">{number.number}</p>
                            <p className="text-sm text-red-700">{number.service}</p>
                            {number.description && (
                              <p className="text-xs text-red-600">{number.description}</p>
                            )}
                          </div>
                          <Phone className="h-5 w-5 text-red-600" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Informations Locales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Monnaie</h4>
                      <p className="text-gray-600">{checklist.localInfo.currency}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Langues</h4>
                      <p className="text-gray-600">{checklist.localInfo.language.join(', ')}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Fuseau Horaire</h4>
                      <p className="text-gray-600">{checklist.localInfo.timezone}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Climat</h4>
                      <p className="text-gray-600">{checklist.localInfo.climate}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Meilleure Période</h4>
                      <p className="text-gray-600">{checklist.localInfo.bestTimeToVisit}</p>
                    </div>
                  </div>

                  {checklist.localInfo.culturalNotes.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Notes Culturelles</h4>
                      <ul className="space-y-1">
                        {checklist.localInfo.culturalNotes.map((note, index) => (
                          <li key={index} className="text-gray-600 flex items-start gap-2">
                            <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sélectionnez une destination</h3>
                <p className="text-gray-600 mb-4">
                  Choisissez votre pays et ville de destination pour accéder à la checklist complète.
                </p>
                <Button onClick={() => {
                  const destinationsTab = document.querySelector('[value="destinations"]') as HTMLElement;
                  if (destinationsTab) destinationsTab.click();
                }}>
                  Choisir une destination
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
