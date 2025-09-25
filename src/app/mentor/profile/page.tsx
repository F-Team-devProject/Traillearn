'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, User, Save, Plus, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function MentorProfilePage() {
  const [profile, setProfile] = useState<any>({
    name: '',
    email: '',
    bio: '',
    hourly_rate: 0,
    specialties: [],
    education: '',
    experience: '',
    languages: [],
    newSpecialty: '',
    newLanguage: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'mentor') {
      router.push('/auth/login')
      return
    }

    // Simulation du chargement du profil
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Données simulées basées sur l'utilisateur connecté
        const mockProfile = {
          name: user?.name || 'Dr. Sarah Johnson',
          email: user?.email || 'sarah.johnson@example.com',
          bio: 'Mentor expérimentée en mathématiques et physique avec plus de 5 ans d\'expérience dans l\'enseignement supérieur.',
          hourly_rate: 50,
          specialties: ['Mathématiques', 'Physique', 'Calcul'],
          education: 'PhD en Mathématiques - Université de Paris',
          experience: '5 ans d\'expérience en enseignement supérieur',
          languages: ['Français', 'Anglais', 'Espagnol']
        }
        setProfile(mockProfile)
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [isAuthenticated, user, router])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulation de la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Ici, vous feriez un appel API pour sauvegarder le profil
      console.log('Profil sauvegardé:', profile)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const addSpecialty = () => {
    if (profile.newSpecialty.trim() && !profile.specialties.includes(profile.newSpecialty.trim())) {
      setProfile({
        ...profile,
        specialties: [...profile.specialties, profile.newSpecialty.trim()],
        newSpecialty: ''
      })
    }
  }

  const removeSpecialty = (specialty: string) => {
    setProfile({
      ...profile,
      specialties: profile.specialties.filter((s: string) => s !== specialty)
    })
  }

  const addLanguage = () => {
    if (profile.newLanguage.trim() && !profile.languages.includes(profile.newLanguage.trim())) {
      setProfile({
        ...profile,
        languages: [...profile.languages, profile.newLanguage.trim()],
        newLanguage: ''
      })
    }
  }

  const removeLanguage = (language: string) => {
    setProfile({
      ...profile,
      languages: profile.languages.filter((l: string) => l !== language)
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
              <p className="text-gray-600 mt-2">Gérez vos informations de profil</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/mentor/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informations de Base
              </CardTitle>
              <CardDescription>Vos informations personnelles et de contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  placeholder="Décrivez votre parcours et votre approche pédagogique..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Tarif horaire (€)</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={profile.hourly_rate}
                    onChange={(e) => setProfile({ ...profile, hourly_rate: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Formation</Label>
                  <Input
                    id="education"
                    value={profile.education}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    placeholder="Votre formation académique"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Expérience</Label>
                <Input
                  id="experience"
                  value={profile.experience}
                  onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                  placeholder="Votre expérience professionnelle"
                />
              </div>
            </CardContent>
          </Card>

          {/* Spécialités */}
          <Card>
            <CardHeader>
              <CardTitle>Spécialités</CardTitle>
              <CardDescription>Les matières que vous enseignez</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.specialties.map((specialty: string, index: number) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    <span>{specialty}</span>
                    <button
                      onClick={() => removeSpecialty(specialty)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  value={profile.newSpecialty}
                  onChange={(e) => setProfile({ ...profile, newSpecialty: e.target.value })}
                  placeholder="Ajouter une spécialité"
                  onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                />
                <Button onClick={addSpecialty} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Langues */}
          <Card>
            <CardHeader>
              <CardTitle>Langues</CardTitle>
              <CardDescription>Les langues que vous parlez</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.languages.map((language: string, index: number) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    <span>{language}</span>
                    <button
                      onClick={() => removeLanguage(language)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  value={profile.newLanguage}
                  onChange={(e) => setProfile({ ...profile, newLanguage: e.target.value })}
                  placeholder="Ajouter une langue"
                  onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                />
                <Button onClick={addLanguage} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
