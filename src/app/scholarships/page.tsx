'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackToDashboardButton } from '@/components/ui/back-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  Filter, 
  Heart, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  DollarSign,
  Clock,
  Star,
  Globe,
  BookOpen,
  AlertCircle
} from 'lucide-react'
import { ScholarshipExtended, ScholarshipFavorite, ScholarshipAlert } from '@/types'

export default function ScholarshipsPage() {
  const { user } = useAuthStore()
  const [scholarships, setScholarships] = useState<ScholarshipExtended[]>([])
  const [favorites, setFavorites] = useState<ScholarshipFavorite[]>([])
  const [alerts, setAlerts] = useState<ScholarshipAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    countries: [] as string[],
    levels: [] as string[],
    fields: [] as string[],
    languages: [] as string[],
    minAmount: '',
    maxAmount: '',
    deadlineBefore: ''
  })
  const [activeTab, setActiveTab] = useState('all')

  // Données simulées pour la démonstration
  const mockScholarships: ScholarshipExtended[] = [
    {
      id: '1',
      title: 'Bourse Eiffel Excellence',
      description: 'Programme de bourses d\'excellence du gouvernement français pour étudiants étrangers',
      amount: 1181,
      currency: 'EUR',
      deadline: '2024-03-15',
      requirements: ['Master ou Doctorat', 'Excellence académique', 'Projet de recherche'],
      country: 'France',
      level: 'graduate',
      fields_of_study: ['Informatique', 'Ingénierie', 'Sciences'],
      language_requirements: ['Français B2', 'Anglais B2'],
      application_opening_date: '2024-01-15',
      university: 'Toutes universités françaises',
      program_type: 'Master/Doctorat',
      duration_months: 24,
      eligibility_criteria: ['Être âgé de moins de 30 ans', 'Avoir un diplôme de licence', 'Maîtriser le français'],
      application_process: ['Candidature en ligne', 'Documents requis', 'Entretien'],
      documents_required: ['CV', 'Lettres de recommandation', 'Projet de recherche', 'Certificats linguistiques'],
      isActive: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Bourse Chevening',
      description: 'Bourses du gouvernement britannique pour études au Royaume-Uni',
      amount: 15000,
      currency: 'GBP',
      deadline: '2024-11-01',
      requirements: ['Master', 'Leadership', '2 ans d\'expérience'],
      country: 'Royaume-Uni',
      level: 'graduate',
      fields_of_study: ['Business', 'Politique', 'Sciences sociales'],
      language_requirements: ['Anglais C1'],
      application_opening_date: '2024-08-01',
      university: 'Universités britanniques',
      program_type: 'Master',
      duration_months: 12,
      eligibility_criteria: ['Citoyen éligible', 'Retour au pays d\'origine', 'Leadership démontré'],
      application_process: ['Candidature en ligne', 'Essais', 'Entretien'],
      documents_required: ['CV', 'Essais de motivation', 'Lettres de recommandation'],
      isActive: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '3',
      title: 'Bourse Fulbright',
      description: 'Programme d\'échange culturel et académique entre les États-Unis et le monde',
      amount: 25000,
      currency: 'USD',
      deadline: '2024-10-15',
      requirements: ['Master/Doctorat', 'Excellence académique'],
      country: 'États-Unis',
      level: 'graduate',
      fields_of_study: ['Arts', 'Sciences', 'Éducation', 'Ingénierie'],
      language_requirements: ['Anglais TOEFL 100+'],
      application_opening_date: '2024-04-01',
      university: 'Universités américaines',
      program_type: 'Master/Doctorat',
      duration_months: 24,
      eligibility_criteria: ['Diplôme de licence', 'Maîtrise de l\'anglais', 'Projet de recherche'],
      application_process: ['Candidature en ligne', 'Essais', 'Entretien'],
      documents_required: ['CV', 'Essais académiques', 'Lettres de recommandation', 'TOEFL'],
      isActive: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ]

  useEffect(() => {
    fetchScholarships()
    fetchFavorites()
    fetchAlerts()
  }, [])

  const fetchScholarships = async () => {
    setIsLoading(true)
    try {
      // Simulation d'un appel API
      setTimeout(() => {
        setScholarships(mockScholarships)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erreur lors du chargement des bourses:', error)
      setIsLoading(false)
    }
  }

  const fetchFavorites = async () => {
    // Simulation - récupérer les favoris de l'utilisateur
    setFavorites([
      { id: '1', userId: user?.id || '', scholarshipId: '1', created_at: '2024-01-15T10:00:00Z' }
    ])
  }

  const fetchAlerts = async () => {
    // Simulation - récupérer les alertes de l'utilisateur
    setAlerts([
      {
        id: '1',
        userId: user?.id || '',
        name: 'Bourses France',
        filters: {
          countries: ['France'],
          levels: ['graduate'],
          deadline_before: '2024-12-31'
        },
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ])
  }

  const toggleFavorite = async (scholarshipId: string) => {
    const isFavorited = favorites.some(fav => fav.scholarshipId === scholarshipId)
    
    if (isFavorited) {
      // Supprimer des favoris
      setFavorites(prev => prev.filter(fav => fav.scholarshipId !== scholarshipId))
    } else {
      // Ajouter aux favoris
      const newFavorite: ScholarshipFavorite = {
        id: Date.now().toString(),
        userId: user?.id || '',
        scholarshipId,
        created_at: new Date().toISOString()
      }
      setFavorites(prev => [...prev, newFavorite])
    }
  }

  const filteredScholarships = scholarships.filter(scholarship => {
    // Filtre par terme de recherche
    if (searchTerm && !scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !scholarship.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Filtre par pays
    if (filters.countries.length > 0 && !filters.countries.includes(scholarship.country)) {
      return false
    }

    // Filtre par niveau
    if (filters.levels.length > 0 && !filters.levels.includes(scholarship.level)) {
      return false
    }

    // Filtre par domaine
    if (filters.fields.length > 0 && !filters.fields.some(field => 
        scholarship.fields_of_study.includes(field))) {
      return false
    }

    // Filtre par montant minimum
    if (filters.minAmount && scholarship.amount < parseInt(filters.minAmount)) {
      return false
    }

    // Filtre par montant maximum
    if (filters.maxAmount && scholarship.amount > parseInt(filters.maxAmount)) {
      return false
    }

    // Filtre par deadline
    if (filters.deadlineBefore && scholarship.deadline > filters.deadlineBefore) {
      return false
    }

    return true
  })

  const getScholarshipDisplayData = () => {
    switch (activeTab) {
      case 'favorites':
        return scholarships.filter(s => 
          favorites.some(fav => fav.scholarshipId === s.id)
        )
      case 'alerts':
        return scholarships.filter(s => {
          return alerts.some(alert => {
            if (!alert.is_active) return false
            const filter = alert.filters
            
            // Vérifier les critères de l'alerte
            if (filter.countries && filter.countries.length > 0 && 
                !filter.countries.includes(s.country)) return false
            
            if (filter.levels && filter.levels.length > 0 && 
                !filter.levels.includes(s.level)) return false
            
            if (filter.deadline_before && s.deadline > filter.deadline_before) return false
            
            return true
          })
        })
      default:
        return filteredScholarships
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const isFavorited = (scholarshipId: string) => {
    return favorites.some(fav => fav.scholarshipId === scholarshipId)
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour accéder aux bourses.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">🎓 Bourses d'Études</h1>
            <p className="text-gray-600 mt-2">
              Découvrez les opportunités de bourses pour vos études à l'international
            </p>
          </div>
          <BackToDashboardButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar avec filtres */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Recherche</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Rechercher une bourse..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Pays</Label>
                <Select onValueChange={(value) => {
                  if (value && !filters.countries.includes(value)) {
                    setFilters(prev => ({ ...prev, countries: [...prev.countries, value] }))
                  }
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Royaume-Uni">Royaume-Uni</SelectItem>
                    <SelectItem value="États-Unis">États-Unis</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Allemagne">Allemagne</SelectItem>
                  </SelectContent>
                </Select>
                {filters.countries.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.countries.map(country => (
                      <Badge key={country} variant="secondary" className="cursor-pointer"
                        onClick={() => setFilters(prev => ({ 
                          ...prev, 
                          countries: prev.countries.filter(c => c !== country) 
                        }))}>
                        {country} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Niveau d'études</Label>
                <Select onValueChange={(value) => {
                  if (value && !filters.levels.includes(value)) {
                    setFilters(prev => ({ ...prev, levels: [...prev.levels, value] }))
                  }
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undergraduate">Licence</SelectItem>
                    <SelectItem value="graduate">Master</SelectItem>
                    <SelectItem value="phd">Doctorat</SelectItem>
                  </SelectContent>
                </Select>
                {filters.levels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.levels.map(level => (
                      <Badge key={level} variant="secondary" className="cursor-pointer"
                        onClick={() => setFilters(prev => ({ 
                          ...prev, 
                          levels: prev.levels.filter(l => l !== level) 
                        }))}>
                        {level === 'undergraduate' ? 'Licence' : 
                         level === 'graduate' ? 'Master' : 'Doctorat'} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Montant minimum (EUR)</Label>
                <Input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Montant maximum (EUR)</Label>
                <Input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                  placeholder="50000"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Deadline avant le</Label>
                <Input
                  type="date"
                  value={filters.deadlineBefore}
                  onChange={(e) => setFilters(prev => ({ ...prev, deadlineBefore: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <Button 
                variant="outline" 
                onClick={() => setFilters({
                  countries: [],
                  levels: [],
                  fields: [],
                  languages: [],
                  minAmount: '',
                  maxAmount: '',
                  deadlineBefore: ''
                })}
                className="w-full"
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                Toutes ({filteredScholarships.length})
              </TabsTrigger>
              <TabsTrigger value="favorites">
                Favoris ({favorites.length})
              </TabsTrigger>
              <TabsTrigger value="alerts">
                Alertes ({alerts.filter(a => a.is_active).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-600">Chargement des bourses...</p>
                </div>
              ) : getScholarshipDisplayData().length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune bourse trouvée</h3>
                    <p className="text-gray-600">
                      {activeTab === 'favorites' ? 'Vous n\'avez pas encore de bourses favorites.' :
                       activeTab === 'alerts' ? 'Aucune bourse ne correspond à vos alertes.' :
                       'Aucune bourse ne correspond à vos critères de recherche.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {getScholarshipDisplayData().map((scholarship) => {
                    const daysUntilDeadline = getDaysUntilDeadline(scholarship.deadline)
                    const isFavorite = isFavorited(scholarship.id)
                    
                    return (
                      <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-xl">{scholarship.title}</CardTitle>
                              <CardDescription className="mt-2">
                                {scholarship.description}
                              </CardDescription>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(scholarship.id)}
                              className={`ml-4 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
                            >
                              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-green-600" />
                                <span className="font-semibold text-green-600">
                                  {formatAmount(scholarship.amount, scholarship.currency)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span>{scholarship.country}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-gray-500" />
                                <span className="capitalize">
                                  {scholarship.level === 'undergraduate' ? 'Licence' :
                                   scholarship.level === 'graduate' ? 'Master' : 'Doctorat'}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>Deadline: {new Date(scholarship.deadline).toLocaleDateString('fr-FR')}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className={daysUntilDeadline < 30 ? 'text-red-600 font-medium' : ''}>
                                  {daysUntilDeadline > 0 ? `${daysUntilDeadline} jours restants` : 'Expiré'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-500" />
                                <span>{scholarship.language_requirements.join(', ')}</span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Domaines d'études</h4>
                                <div className="flex flex-wrap gap-2">
                                  {scholarship.fields_of_study.slice(0, 3).map((field, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {field}
                                    </Badge>
                                  ))}
                                  {scholarship.fields_of_study.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{scholarship.fields_of_study.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Université</h4>
                                <p className="text-sm text-gray-600">{scholarship.university}</p>
                              </div>
                            </div>
                          </div>

                          <Separator className="my-6" />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-2">Critères d'éligibilité</h4>
                              <ul className="space-y-1">
                                {scholarship.eligibility_criteria.slice(0, 3).map((criteria, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="text-green-500 mt-1">•</span>
                                    {criteria}
                                  </li>
                                ))}
                                {scholarship.eligibility_criteria.length > 3 && (
                                  <li className="text-sm text-gray-500">
                                    +{scholarship.eligibility_criteria.length - 3} autres critères
                                  </li>
                                )}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Documents requis</h4>
                              <ul className="space-y-1">
                                {scholarship.documents_required.slice(0, 3).map((doc, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    {doc}
                                  </li>
                                ))}
                                {scholarship.documents_required.length > 3 && (
                                  <li className="text-sm text-gray-500">
                                    +{scholarship.documents_required.length - 3} autres documents
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>

                          <div className="flex gap-4 mt-6">
                            <Button className="flex-1">
                              Voir les détails
                            </Button>
                            <Button variant="outline" className="flex-1">
                              Demander conseil
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
