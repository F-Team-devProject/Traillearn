'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Star, 
  Clock, 
  MapPin, 
  Filter,
  User,
  BookOpen,
  Award,
  MessageCircle,
  Calendar,
  Euro
} from 'lucide-react'
import { localMentorAPI, localUserAPI } from '@/lib/localStorage'
import { Mentor } from '@/types'

export default function MentorsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedPriceRange, setSelectedPriceRange] = useState('')
  const [selectedRating, setSelectedRating] = useState('')

  const subjects = [
    'Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Informatique',
    'Économie', 'Histoire', 'Géographie', 'Français', 'Anglais',
    'Philosophie', 'Sciences Politiques', 'Droit', 'Médecine', 'Ingénierie'
  ]

  const priceRanges = [
    { label: 'Tous les prix', value: '' },
    { label: 'Moins de 20€/h', value: '0-20' },
    { label: '20€ - 40€/h', value: '20-40' },
    { label: '40€ - 60€/h', value: '40-60' },
    { label: 'Plus de 60€/h', value: '60+' }
  ]

  useEffect(() => {
    loadMentors()
  }, [])

  useEffect(() => {
    filterMentors()
  }, [mentors, searchTerm, selectedSubject, selectedPriceRange, selectedRating])

  const loadMentors = async () => {
    try {
      setLoading(true)
      const mentorsData = await localMentorAPI.getAllMentors()
      setMentors(mentorsData)
    } catch (error) {
      console.error('Erreur lors du chargement des mentors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMentors = () => {
    let filtered = [...mentors]

    // Filtre par recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(mentor => 
        (mentor.specialties || []).some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        (mentor.bio || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par matière
    if (selectedSubject && selectedSubject !== 'all') {
      filtered = filtered.filter(mentor => 
        (mentor.specialties || []).includes(selectedSubject)
      )
    }

    // Filtre par prix
    if (selectedPriceRange && selectedPriceRange !== 'all') {
      filtered = filtered.filter(mentor => {
        const price = mentor.hourly_rate
        switch (selectedPriceRange) {
          case '0-20': return price < 20
          case '20-40': return price >= 20 && price < 40
          case '40-60': return price >= 40 && price < 60
          case '60+': return price >= 60
          default: return true
        }
      })
    }

    // Filtre par note
    if (selectedRating && selectedRating !== 'all') {
      const minRating = parseFloat(selectedRating)
      filtered = filtered.filter(mentor => mentor.rating >= minRating)
    }

    setFilteredMentors(filtered)
  }

  const handleBookSession = (mentorId: string) => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    router.push(`/booking/${mentorId}`)
  }

  const handleViewProfile = (mentorId: string) => {
    router.push(`/mentor/${mentorId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des mentors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trouvez votre Mentor</h1>
              <p className="text-gray-600 mt-2">Découvrez nos mentors experts pour vous accompagner</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.push('/')}>
                Accueil
              </Button>
              {isAuthenticated && (
                <Button variant="outline" onClick={() => router.push('/nav')}>
                  Navigation
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtres de recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Recherche */}
              <div className="lg:col-span-2">
                <Label htmlFor="search">Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Matière, spécialité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Matière */}
              <div>
                <Label>Matière</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les matières" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les matières</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prix */}
              <div>
                <Label>Prix par heure</Label>
                <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les prix" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map(range => (
                      <SelectItem key={range.value} value={range.value || "all"}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Note */}
              <div>
                <Label>Note minimum</Label>
                <Select value={selectedRating} onValueChange={setSelectedRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les notes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les notes</SelectItem>
                    <SelectItem value="4.5">4.5+ étoiles</SelectItem>
                    <SelectItem value="4.0">4.0+ étoiles</SelectItem>
                    <SelectItem value="3.5">3.5+ étoiles</SelectItem>
                    <SelectItem value="3.0">3.0+ étoiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Résultats */}
        <div className="mb-4">
          <p className="text-gray-600">
            {filteredMentors.length} mentor{filteredMentors.length > 1 ? 's' : ''} trouvé{filteredMentors.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Liste des mentors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {(mentor.name || 'M').split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {mentor.name || 'Mentor'}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(mentor.rating)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {(mentor.rating || 0).toFixed(1)} ({mentor.studentsCount || 0} sessions)
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Euro className="h-3 w-3 mr-1" />
                    {mentor.hourly_rate}/h
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Spécialités */}
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Spécialités</h4>
                  <div className="flex flex-wrap gap-1">
                    {(mentor.specialties || []).slice(0, 3).map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {(mentor.specialties || []).length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(mentor.specialties || []).length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600 line-clamp-3">
                  {mentor.bio}
                </p>

                {/* Localisation */}
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {mentor.user?.city}, {mentor.user?.country_code}
                </div>

                {/* Disponibilité */}
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {mentor.isAvailable ? (
                    <span className="text-green-600 font-medium">Disponible</span>
                  ) : (
                    <span className="text-orange-600 font-medium">Occupé</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProfile(mentor.id)}
                    className="flex-1"
                  >
                    <User className="h-4 w-4 mr-1" />
                    Profil
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleBookSession(mentor.id)}
                    className="flex-1"
                    disabled={!mentor.isAvailable}
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Réserver
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun mentor trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedSubject('')
                  setSelectedPriceRange('')
                  setSelectedRating('')
                }}
              >
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
