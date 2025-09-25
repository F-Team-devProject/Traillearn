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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings,
  Euro,
  User,
  BookOpen,
  Award,
  Clock,
  MapPin,
  Save,
  Plus,
  X,
  Star,
  TrendingUp,
  MessageCircle
} from 'lucide-react'
import { localMentorAPI, localUserAPI } from '@/lib/localStorage'
import { Mentor } from '@/types'

export default function MentorSettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newEducationLevel, setNewEducationLevel] = useState('')
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    duration: '',
    description: ''
  })

  const subjects = [
    'Mathématiques', 'Physique', 'Chimie', 'Biologie', 'Informatique',
    'Économie', 'Histoire', 'Géographie', 'Français', 'Anglais',
    'Philosophie', 'Sciences Politiques', 'Droit', 'Médecine', 'Ingénierie'
  ]

  const educationLevels = [
    'Primaire', 'Collège', 'Lycée', 'Bac+1', 'Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Doctorat'
  ]

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'mentor') {
      router.push('/')
      return
    }
    loadMentorData()
  }, [user])

  const loadMentorData = async () => {
    try {
      setLoading(true)
      const mentorData = await localMentorAPI.getMentorByUserId(user?.id || '')
      setMentor(mentorData)
    } catch (error) {
      console.error('Erreur lors du chargement du profil mentor:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!mentor) return

    setSaving(true)
    try {
      const result = await localMentorAPI.updateMentor(mentor.id, {
        hourly_rate: mentor.hourly_rate,
        bio: mentor.bio,
        specialties: mentor.specialties,
        educationLevels: mentor.educationLevels,
        bio: mentor.bio,
        isAvailable: mentor.isAvailable,
        experience: mentor.experience,
        education: mentor.education
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

  const addSpecialty = () => {
    if (newSpecialty && !(mentor?.specialties || []).includes(newSpecialty)) {
      setMentor(prev => prev ? {
        ...prev,
        specialties: [...(prev.specialties || []), newSpecialty]
      } : null)
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (specialty: string) => {
    setMentor(prev => prev ? {
      ...prev,
      specialties: (prev.specialties || []).filter(s => s !== specialty)
    } : null)
  }

  const addEducationLevel = () => {
    if (newEducationLevel && !mentor?.educationLevels?.includes(newEducationLevel)) {
      setMentor(prev => prev ? {
        ...prev,
        educationLevels: [...(prev.educationLevels || []), newEducationLevel]
      } : null)
      setNewEducationLevel('')
    }
  }

  const removeEducationLevel = (level: string) => {
    setMentor(prev => prev ? {
      ...prev,
      educationLevels: prev.educationLevels?.filter(l => l !== level) || []
    } : null)
  }

  const addExperience = () => {
    if (newExperience.title && newExperience.company) {
      setMentor(prev => prev ? {
        ...prev,
        experience: [...(prev.experience || []), { ...newExperience }]
      } : null)
      setNewExperience({ title: '', company: '', duration: '', description: '' })
    }
  }

  const removeExperience = (index: number) => {
    setMentor(prev => prev ? {
      ...prev,
      experience: prev.experience?.filter((_, i) => i !== index) || []
    } : null)
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

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="text-center py-12">
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Profil mentor non trouvé
            </h3>
            <Button onClick={() => router.push('/mentor/dashboard')}>
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paramètres du Profil</h1>
              <p className="text-gray-600 mt-2">Gérez votre profil mentor et vos tarifs</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.push('/mentor/dashboard')}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push('/nav')}>
                Navigation
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="pricing">Tarifs</TabsTrigger>
            <TabsTrigger value="specialties">Spécialités</TabsTrigger>
            <TabsTrigger value="experience">Expérience</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={mentor.name || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={mentor.name || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    placeholder="Décrivez votre parcours, votre passion pour l'enseignement, et ce qui vous rend unique..."
                    value={mentor.bio}
                    onChange={(e) => setMentor(prev => prev ? { ...prev, bio: e.target.value } : null)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="teachingMethod">Méthode d'enseignement</Label>
                  <Textarea
                    id="teachingMethod"
                    placeholder="Décrivez votre approche pédagogique, vos méthodes d'enseignement..."
                    value={mentor.bio || ''}
                    onChange={(e) => setMentor(prev => prev ? { ...prev, bio: e.target.value } : null)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Disponibilité</Label>
                  <Select 
                    value={mentor.isAvailable ? 'available' : 'busy'} 
                    onValueChange={(value) => setMentor(prev => prev ? { ...prev, isAvailable: value === 'available' } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="busy">Occupé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Euro className="h-5 w-5 mr-2" />
                  Tarification
                </CardTitle>
                <CardDescription>
                  Définissez votre taux horaire
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="max-w-md">
                  <Label htmlFor="hourlyRate">Taux horaire (€/heure)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="10"
                      max="200"
                      value={mentor.hourly_rate}
                      onChange={(e) => setMentor(prev => prev ? { ...prev, hourly_rate: parseFloat(e.target.value) || 0 } : null)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Recommandé: 20-60€/heure selon votre expérience
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Conseils pour fixer votre prix</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Consultez les tarifs des autres mentors dans votre domaine</li>
                    <li>• Tenez compte de votre expérience et qualifications</li>
                    <li>• Vous pouvez ajuster vos tarifs à tout moment</li>
                    <li>• Commencez par un prix compétitif pour attirer les premiers étudiants</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specialties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Spécialités et niveaux
                </CardTitle>
                <CardDescription>
                  Définissez les matières que vous enseignez
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Spécialités */}
                <div>
                  <Label>Spécialités</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-4">
                    {(mentor.specialties || []).map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {specialty}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeSpecialty(specialty)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select value={newSpecialty} onValueChange={setNewSpecialty}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Ajouter une spécialité" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addSpecialty} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Niveaux d'éducation */}
                <div>
                  <Label>Niveaux enseignés</Label>
                  <div className="flex flex-wrap gap-2 mt-2 mb-4">
                    {mentor.educationLevels?.map((level, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {level}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeEducationLevel(level)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Select value={newEducationLevel} onValueChange={setNewEducationLevel}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Ajouter un niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={addEducationLevel} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Expérience professionnelle
                </CardTitle>
                <CardDescription>
                  Ajoutez votre parcours professionnel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Expériences existantes */}
                <div className="space-y-4">
                  {mentor.experience?.map((exp, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{exp.title}</h4>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">{exp.duration}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeExperience(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700">{exp.description}</p>
                    </div>
                  ))}
                </div>

                {/* Ajouter une nouvelle expérience */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <h4 className="font-semibold mb-4">Ajouter une expérience</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expTitle">Poste</Label>
                        <Input
                          id="expTitle"
                          value={newExperience.title}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Ex: Professeur de Mathématiques"
                        />
                      </div>
                      <div>
                        <Label htmlFor="expCompany">Entreprise/École</Label>
                        <Input
                          id="expCompany"
                          value={newExperience.company}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                          placeholder="Ex: Lycée Victor Hugo"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="expDuration">Durée</Label>
                      <Input
                        id="expDuration"
                        value={newExperience.duration}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="Ex: 2020 - 2023"
                      />
                    </div>
                    <div>
                      <Label htmlFor="expDescription">Description</Label>
                      <Textarea
                        id="expDescription"
                        value={newExperience.description}
                        onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Décrivez vos responsabilités et réalisations..."
                        rows={3}
                      />
                    </div>
                    <Button onClick={addExperience} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter cette expérience
                    </Button>
                  </div>
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
