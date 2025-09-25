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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User,
  ArrowLeft,
  Save,
  MapPin,
  Calendar,
  BookOpen,
  Target,
  Award
} from 'lucide-react'
import { localUserAPI } from '@/lib/localStorage'
import { User as UserType } from '@/types'

export default function StudentProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [profile, setProfile] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const countries = [
    { code: 'FRA', name: 'France' },
    { code: 'USA', name: 'États-Unis' },
    { code: 'CAN', name: 'Canada' },
    { code: 'GBR', name: 'Royaume-Uni' },
    { code: 'DEU', name: 'Allemagne' },
    { code: 'ESP', name: 'Espagne' },
    { code: 'ITA', name: 'Italie' },
    { code: 'NLD', name: 'Pays-Bas' },
    { code: 'BEL', name: 'Belgique' },
    { code: 'CHE', name: 'Suisse' }
  ]

  const educationLevels = [
    'Collège', 'Lycée', 'Bac+1', 'Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Doctorat'
  ]

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      router.push('/')
      return
    }
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const userData = await localUserAPI.getUserById(user?.id || '')
      setProfile(userData)
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const result = await localUserAPI.updateUser(profile.id, {
        name: profile.name,
        city: profile.city,
        country_code: profile.country_code,
        bio: profile.bio,
        education_level: profile.education_level,
        interests: profile.interests,
        goals: profile.goals
      })

      if (result.success) {
        alert('Profil mis à jour avec succès !')
      } else {
        alert('Erreur lors de la mise à jour: ' + result.error)
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Profil non trouvé
            </h3>
            <Button onClick={() => router.push('/student/dashboard')}>
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
                onClick={() => router.push('/student/dashboard')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
                <p className="text-gray-600 mt-2">Gérez vos informations personnelles</p>
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
            <TabsTrigger value="academic">Parcours académique</TabsTrigger>
            <TabsTrigger value="goals">Objectifs</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={profile.name || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={profile.name || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={profile.city || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, city: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Pays</Label>
                    <Select 
                      value={profile.country_code || ''} 
                      onValueChange={(value) => setProfile(prev => prev ? { ...prev, country_code: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map(country => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez-nous de vous, vos passions, vos centres d'intérêt..."
                    value={profile.bio || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Parcours académique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="educationLevel">Niveau d'études</Label>
                  <Select 
                    value={profile.education_level || ''} 
                    onValueChange={(value) => setProfile(prev => prev ? { ...prev, education_level: value } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner votre niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="interests">Centres d'intérêt</Label>
                  <Textarea
                    id="interests"
                    placeholder="Décrivez vos matières préférées, domaines d'étude qui vous passionnent..."
                    value={profile.interests || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, interests: e.target.value } : null)}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Objectifs et aspirations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="goals">Objectifs académiques et professionnels</Label>
                  <Textarea
                    id="goals"
                    placeholder="Décrivez vos objectifs, vos aspirations professionnelles, ce que vous souhaitez accomplir..."
                    value={profile.goals || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, goals: e.target.value } : null)}
                    rows={6}
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Conseils</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Soyez précis dans vos objectifs pour mieux vous orienter</li>
                    <li>• Mentionnez vos domaines d'intérêt pour des recommandations personnalisées</li>
                    <li>• Décrivez vos aspirations pour que les mentors puissent mieux vous aider</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end mt-8">
          <Button 
            onClick={handleSaveProfile} 
            disabled={saving}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </Button>
        </div>
      </main>
    </div>
  )
}


