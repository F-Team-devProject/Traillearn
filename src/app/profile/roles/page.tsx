'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, Clock, XCircle, User, GraduationCap, Users } from 'lucide-react'

export default function RolesPage() {
  const { user, activateStudentRole, requestMentorRole } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [mentorData, setMentorData] = useState({
    specialties: [''],
    experience: '',
    education: '',
    languages: [''],
    timezone: '',
    countries_served: [''],
    capacity_per_month: 5
  })

  const handleActivateStudent = async () => {
    setIsLoading(true)
    try {
      const result = await activateStudentRole()
      if (result.success) {
        // Afficher un message de succès
        alert('Statut étudiant activé avec succès !')
      } else {
        alert(`Erreur: ${result.error}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestMentor = async () => {
    setIsLoading(true)
    try {
      // Nettoyer les données (supprimer les champs vides)
      const cleanedData = {
        ...mentorData,
        specialties: mentorData.specialties.filter(s => s.trim() !== ''),
        languages: mentorData.languages.filter(l => l.trim() !== ''),
        countries_served: mentorData.countries_served.filter(c => c.trim() !== '')
      }

      const result = await requestMentorRole(cleanedData)
      if (result.success) {
        alert('Demande de statut mentor envoyée ! Elle sera examinée par nos administrateurs.')
      } else {
        alert(`Erreur: ${result.error}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'rejected':
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active':
        return 'Actif'
      case 'approved':
        return 'Approuvé'
      case 'pending':
        return 'En attente'
      case 'rejected':
        return 'Rejeté'
      case 'inactive':
        return 'Inactif'
      default:
        return 'Non activé'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return <div>Chargement...</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestion des Rôles</h1>
        <p className="text-gray-600 mt-2">
          Gérez vos statuts étudiant et mentor sur Traillearn
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="student">Statut Étudiant</TabsTrigger>
          <TabsTrigger value="mentor">Statut Mentor</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil Visiteur
              </CardTitle>
              <CardDescription>
                Vous êtes inscrit en tant que visiteur sur Traillearn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Niveau actuel</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(user.level)}>
                      {user.level.charAt(0).toUpperCase() + user.level.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Points</Label>
                  <p className="text-lg font-semibold">{user.points}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Abonnement</Label>
                  <Badge variant="outline">
                    {user.subscription_type.charAt(0).toUpperCase() + user.subscription_type.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Code de parrainage</Label>
                  <p className="font-mono text-sm">{user.referral_code}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Statut Étudiant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Statut:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.student_status)}
                      <Badge className={getStatusColor(user.student_status)}>
                        {getStatusText(user.student_status)}
                      </Badge>
                    </div>
                  </div>
                  
                  {!user.is_student && (
                    <Button 
                      onClick={handleActivateStudent}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Activation...' : 'Activer le statut étudiant'}
                    </Button>
                  )}
                  
                  {user.is_student && (
                    <div className="text-sm text-green-600">
                      ✅ Vous avez accès aux fonctionnalités étudiant
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Statut Mentor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Statut:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.mentor_status)}
                      <Badge className={getStatusColor(user.mentor_status)}>
                        {getStatusText(user.mentor_status)}
                      </Badge>
                    </div>
                  </div>
                  
                  {user.mentor_status === 'rejected' && (
                    <div className="text-sm text-red-600">
                      <p>Votre demande a été rejetée.</p>
                      {user.mentor_validation_notes && (
                        <p className="mt-1">Raison: {user.mentor_validation_notes}</p>
                      )}
                    </div>
                  )}
                  
                  {!user.is_mentor && (
                    <div className="text-sm text-gray-600">
                      <p>Pour devenir mentor, remplissez le formulaire dans l'onglet "Statut Mentor"</p>
                    </div>
                  )}
                  
                  {user.is_mentor && user.mentor_status === 'approved' && (
                    <div className="text-sm text-green-600">
                      ✅ Vous êtes mentor approuvé
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="student" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statut Étudiant</CardTitle>
              <CardDescription>
                Le statut étudiant vous donne accès à toutes les fonctionnalités d'apprentissage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Statut actuel:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(user.student_status)}
                    <Badge className={getStatusColor(user.student_status)}>
                      {getStatusText(user.student_status)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Fonctionnalités incluses:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Recherche et filtrage des bourses
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Liste de favoris pour les bourses
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Sessions de mentorat
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Accès aux forums étudiants
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Inscription aux événements
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Recommandations IA personnalisées
                    </li>
                  </ul>
                </div>

                {!user.is_student && (
                  <Button 
                    onClick={handleActivateStudent}
                    disabled={isLoading}
                    className="w-full mt-6"
                  >
                    {isLoading ? 'Activation...' : 'Activer le statut étudiant'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Devenir Mentor</CardTitle>
              <CardDescription>
                Rejoignez notre communauté de mentors et aidez les étudiants dans leur parcours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {user.mentor_status === 'pending' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Clock className="h-5 w-5" />
                      <span className="font-medium">Demande en cours d'examen</span>
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      Votre demande de statut mentor est en cours d'examen par nos administrateurs.
                      Vous recevrez une notification dès qu'une décision sera prise.
                    </p>
                  </div>
                )}

                {user.mentor_status === 'rejected' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Demande rejetée</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      Votre demande de statut mentor a été rejetée.
                      {user.mentor_validation_notes && (
                        <span className="block mt-2">Raison: {user.mentor_validation_notes}</span>
                      )}
                    </p>
                  </div>
                )}

                {user.mentor_status === 'approved' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Mentor approuvé</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      Félicitations ! Vous êtes maintenant mentor sur Traillearn.
                    </p>
                  </div>
                )}

                {!user.is_mentor && (
                  <form onSubmit={(e) => { e.preventDefault(); handleRequestMentor(); }} className="space-y-4">
                    <div>
                      <Label htmlFor="specialties">Domaines d'expertise</Label>
                      <div className="space-y-2">
                        {mentorData.specialties.map((specialty, index) => (
                          <Input
                            key={index}
                            value={specialty}
                            onChange={(e) => {
                              const newSpecialties = [...mentorData.specialties]
                              newSpecialties[index] = e.target.value
                              setMentorData({ ...mentorData, specialties: newSpecialties })
                            }}
                            placeholder="Ex: Data Science, Cybersécurité, Marketing Digital"
                            className="mt-1"
                          />
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMentorData({
                              ...mentorData,
                              specialties: [...mentorData.specialties, '']
                            })
                          }}
                        >
                          Ajouter un domaine
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="experience">Expérience professionnelle</Label>
                      <Textarea
                        id="experience"
                        value={mentorData.experience}
                        onChange={(e) => setMentorData({ ...mentorData, experience: e.target.value })}
                        placeholder="Décrivez votre expérience professionnelle..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="education">Formation</Label>
                      <Textarea
                        id="education"
                        value={mentorData.education}
                        onChange={(e) => setMentorData({ ...mentorData, education: e.target.value })}
                        placeholder="Décrivez votre parcours académique..."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="languages">Langues parlées</Label>
                      <div className="space-y-2">
                        {mentorData.languages.map((language, index) => (
                          <Input
                            key={index}
                            value={language}
                            onChange={(e) => {
                              const newLanguages = [...mentorData.languages]
                              newLanguages[index] = e.target.value
                              setMentorData({ ...mentorData, languages: newLanguages })
                            }}
                            placeholder="Ex: Français, Anglais, Espagnol"
                            className="mt-1"
                          />
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMentorData({
                              ...mentorData,
                              languages: [...mentorData.languages, '']
                            })
                          }}
                        >
                          Ajouter une langue
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="timezone">Fuseau horaire</Label>
                      <Select
                        value={mentorData.timezone}
                        onValueChange={(value) => setMentorData({ ...mentorData, timezone: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez votre fuseau horaire" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Europe/Paris">Europe/Paris (UTC+1)</SelectItem>
                          <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (UTC-5)</SelectItem>
                          <SelectItem value="America/Los_Angeles">America/Los_Angeles (UTC-8)</SelectItem>
                          <SelectItem value="Asia/Tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                          <SelectItem value="Asia/Shanghai">Asia/Shanghai (UTC+8)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="countries">Pays que vous pouvez aider</Label>
                      <div className="space-y-2">
                        {mentorData.countries_served.map((country, index) => (
                          <Input
                            key={index}
                            value={country}
                            onChange={(e) => {
                              const newCountries = [...mentorData.countries_served]
                              newCountries[index] = e.target.value
                              setMentorData({ ...mentorData, countries_served: newCountries })
                            }}
                            placeholder="Ex: France, Canada, Belgique"
                            className="mt-1"
                          />
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMentorData({
                              ...mentorData,
                              countries_served: [...mentorData.countries_served, '']
                            })
                          }}
                        >
                          Ajouter un pays
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="capacity">Capacité mensuelle (nombre d'étudiants)</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        max="50"
                        value={mentorData.capacity_per_month}
                        onChange={(e) => setMentorData({ ...mentorData, capacity_per_month: parseInt(e.target.value) || 5 })}
                        className="mt-1"
                      />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? 'Envoi en cours...' : 'Soumettre la demande'}
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
