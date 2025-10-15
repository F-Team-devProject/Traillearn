'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { jobAlertService } from '@/lib/jobAlertService'
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
  Briefcase, 
  MapPin, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Plus,
  Search,
  Filter,
  Award,
  Target,
  Calendar,
  Building,
  Globe,
  User,
  MessageSquare,
  Eye
} from 'lucide-react'
import { JobAlert, JobApplication } from '@/types'

export default function JobAlertsPage() {
  const { user } = useAuthStore()
  const [alerts, setAlerts] = useState<JobAlert[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [availableAlerts, setAvailableAlerts] = useState<JobAlert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<JobAlert | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    domain: '',
    country: '',
    experienceLevel: '',
    jobType: '',
    remote: undefined as boolean | undefined
  })
  const [newAlert, setNewAlert] = useState({
    country: '',
    domain: '',
    jobType: 'full_time' as 'full_time' | 'part_time' | 'internship' | 'contract',
    experienceLevel: 'entry' as 'entry' | 'mid' | 'senior' | 'executive',
    location: '',
    remote: false,
    salaryMin: '',
    salaryMax: '',
    currency: 'EUR',
    notes: ''
  })
  const [newApplication, setNewApplication] = useState({
    jobTitle: '',
    company: '',
    salary: '',
    currency: 'EUR',
    notes: ''
  })

  const domains = [
    'Développement Web', 'Data Science', 'Cybersécurité', 'Cloud Computing',
    'Intelligence Artificielle', 'DevOps', 'Mobile Development', 'UI/UX Design',
    'Product Management', 'Marketing Digital', 'Finance', 'Consulting',
    'Recherche', 'Éducation', 'Santé', 'Ingénierie'
  ]

  const countries = [
    'France', 'Canada', 'États-Unis', 'Royaume-Uni', 'Allemagne', 'Espagne',
    'Italie', 'Pays-Bas', 'Belgique', 'Suisse', 'Suède', 'Norvège',
    'Danemark', 'Finlande', 'Autriche', 'Portugal'
  ]

  const currencies = ['EUR', 'USD', 'CAD', 'GBP', 'CHF']

  useEffect(() => {
    if (user) {
      fetchUserAlerts()
      fetchUserApplications()
      if (user.is_mentor && user.mentor_status === 'approved') {
        fetchAvailableAlerts()
      }
    }
  }, [user])

  const fetchUserAlerts = async () => {
    if (!user) return

    try {
      const { alerts, error } = await jobAlertService.getUserJobAlerts(user.id)
      if (error) {
        console.error('Erreur lors du chargement des alertes:', error)
      } else {
        setAlerts(alerts)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error)
    }
  }

  const fetchUserApplications = async () => {
    if (!user) return

    try {
      const { applications, error } = await jobAlertService.getUserApplications(user.id)
      if (error) {
        console.error('Erreur lors du chargement des candidatures:', error)
      } else {
        setApplications(applications)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error)
    }
  }

  const fetchAvailableAlerts = async () => {
    if (!user || !user.is_mentor) return

    try {
      const { alerts, error } = await jobAlertService.getAvailableJobAlerts(user.id, searchFilters)
      if (error) {
        console.error('Erreur lors du chargement des alertes disponibles:', error)
      } else {
        setAvailableAlerts(alerts)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des alertes disponibles:', error)
    }
  }

  const handleCreateAlert = async () => {
    if (!user || !newAlert.country || !newAlert.domain) return

    setIsLoading(true)
    try {
      const alertData = {
        userId: user.id,
        country: newAlert.country,
        domain: newAlert.domain,
        jobType: newAlert.jobType,
        experienceLevel: newAlert.experienceLevel,
        location: newAlert.location || undefined,
        remote: newAlert.remote,
        salaryRange: (newAlert.salaryMin || newAlert.salaryMax) ? {
          min: newAlert.salaryMin ? parseInt(newAlert.salaryMin) : 0,
          max: newAlert.salaryMax ? parseInt(newAlert.salaryMax) : 0,
          currency: newAlert.currency
        } : undefined,
        notes: newAlert.notes || undefined
      }

      const { alert, error } = await jobAlertService.createJobAlert(alertData)
      
      if (error) {
        alert(`Erreur: ${error}`)
      } else {
        setAlerts(prev => [alert!, ...prev])
        setNewAlert({
          country: '',
          domain: '',
          jobType: 'full_time',
          experienceLevel: 'entry',
          location: '',
          remote: false,
          salaryMin: '',
          salaryMax: '',
          currency: 'EUR',
          notes: ''
        })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignMentor = async (alertId: string) => {
    if (!user || !user.is_mentor) return

    try {
      const { success, error } = await jobAlertService.assignMentorToAlert(alertId, user.id)
      
      if (error) {
        alert(`Erreur: ${error}`)
      } else if (success) {
        fetchAvailableAlerts()
        alert('Vous avez été assigné à cette alerte avec succès!')
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error)
    }
  }

  const handleCreateApplication = async () => {
    if (!selectedAlert || !newApplication.jobTitle || !newApplication.company) return

    setIsLoading(true)
    try {
      const applicationData = {
        alertId: selectedAlert.id,
        userId: selectedAlert.user_id,
        mentorId: selectedAlert.assigned_mentor_id || user?.id || '',
        jobTitle: newApplication.jobTitle,
        company: newApplication.company,
        status: 'applied' as const,
        applicationDate: new Date().toISOString(),
        salary: newApplication.salary ? parseInt(newApplication.salary) : undefined,
        currency: newApplication.currency,
        notes: newApplication.notes || undefined
      }

      const { success, error } = await jobAlertService.createJobApplication(applicationData)
      
      if (error) {
        alert(`Erreur: ${error}`)
      } else if (success) {
        fetchUserApplications()
        setNewApplication({
          jobTitle: '',
          company: '',
          salary: '',
          currency: 'EUR',
          notes: ''
        })
        setShowApplicationForm(false)
        setSelectedAlert(null)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la candidature:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'assigned':
        return <Users className="h-4 w-4 text-green-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'assigned':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'assigned':
        return 'Mentor assigné'
      case 'completed':
        return 'Terminée'
      case 'cancelled':
        return 'Annulée'
      default:
        return status
    }
  }

  const getApplicationStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'interview_scheduled':
        return <Calendar className="h-4 w-4 text-yellow-500" />
      case 'interview_completed':
        return <CheckCircle className="h-4 w-4 text-orange-500" />
      case 'offer_received':
        return <Award className="h-4 w-4 text-green-500" />
      case 'hired':
        return <Star className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800'
      case 'interview_scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'interview_completed':
        return 'bg-orange-100 text-orange-800'
      case 'offer_received':
        return 'bg-green-100 text-green-800'
      case 'hired':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getApplicationStatusText = (status: string) => {
    switch (status) {
      case 'applied':
        return 'Candidature envoyée'
      case 'interview_scheduled':
        return 'Entretien programmé'
      case 'interview_completed':
        return 'Entretien terminé'
      case 'offer_received':
        return 'Offre reçue'
      case 'hired':
        return 'Embauché'
      case 'rejected':
        return 'Refusé'
      default:
        return status
    }
  }

  const getJobTypeText = (type: string) => {
    switch (type) {
      case 'full_time':
        return 'CDI'
      case 'part_time':
        return 'CDD'
      case 'internship':
        return 'Stage'
      case 'contract':
        return 'Freelance'
      default:
        return type
    }
  }

  const getExperienceLevelText = (level: string) => {
    switch (level) {
      case 'entry':
        return 'Junior'
      case 'mid':
        return 'Intermédiaire'
      case 'senior':
        return 'Senior'
      case 'executive':
        return 'Direction'
      default:
        return level
    }
  }

  const activeAlerts = alerts.filter(alert => alert.status === 'active')
  const assignedAlerts = alerts.filter(alert => alert.status === 'assigned')
  const completedAlerts = alerts.filter(alert => alert.status === 'completed')

  const isMentor = user?.is_mentor && user?.mentor_status === 'approved'
  const isStudent = user?.is_student && user?.student_status === 'active'

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour accéder aux alertes emploi.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-blue-600" />
          Alertes Emploi
        </h1>
        <p className="text-gray-600 mt-2">
          Créez des alertes pour trouver un emploi ou aidez des étudiants à décrocher leur poste
        </p>
      </div>

      <Tabs defaultValue="my-alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-alerts">
            Mes Alertes ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="applications">
            Mes Candidatures ({applications.length})
          </TabsTrigger>
          {isMentor && (
            <TabsTrigger value="available-alerts">
              Alertes Disponibles ({availableAlerts.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-alerts" className="space-y-6">
          {!showCreateForm ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nouvelle Alerte Emploi
                </CardTitle>
                <CardDescription>
                  Créez une alerte pour signaler votre recherche d'emploi aux mentors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowCreateForm(true)} className="w-full">
                  Créer une alerte emploi
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Créer une Alerte Emploi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="country">Pays *</Label>
                    <Select
                      value={newAlert.country}
                      onValueChange={(value) => setNewAlert(prev => ({ ...prev, country: value }))}
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

                  <div>
                    <Label htmlFor="domain">Domaine *</Label>
                    <Select
                      value={newAlert.domain}
                      onValueChange={(value) => setNewAlert(prev => ({ ...prev, domain: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner un domaine" />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.map((domain) => (
                          <SelectItem key={domain} value={domain}>
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="jobType">Type d'emploi</Label>
                    <Select
                      value={newAlert.jobType}
                      onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, jobType: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">CDI</SelectItem>
                        <SelectItem value="part_time">CDD</SelectItem>
                        <SelectItem value="internship">Stage</SelectItem>
                        <SelectItem value="contract">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="experienceLevel">Niveau d'expérience</Label>
                    <Select
                      value={newAlert.experienceLevel}
                      onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, experienceLevel: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Junior</SelectItem>
                        <SelectItem value="mid">Intermédiaire</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="executive">Direction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Localisation (optionnel)</Label>
                    <Input
                      id="location"
                      value={newAlert.location}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Ex: Paris, France"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="remote"
                      checked={newAlert.remote}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, remote: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="remote" className="text-sm">
                      Télétravail accepté
                    </label>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-4 block">Fourchette salariale (optionnel)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="salaryMin">Salaire minimum</Label>
                      <Input
                        id="salaryMin"
                        type="number"
                        value={newAlert.salaryMin}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, salaryMin: e.target.value }))}
                        placeholder="3000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salaryMax">Salaire maximum</Label>
                      <Input
                        id="salaryMax"
                        type="number"
                        value={newAlert.salaryMax}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, salaryMax: e.target.value }))}
                        placeholder="5000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Devise</Label>
                      <Select
                        value={newAlert.currency}
                        onValueChange={(value) => setNewAlert(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger className="mt-1">
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
                </div>

                <div>
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    value={newAlert.notes}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Décrivez vos compétences, préférences, ou toute information utile..."
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={handleCreateAlert}
                    disabled={isLoading || !newAlert.country || !newAlert.domain}
                    className="flex-1"
                  >
                    {isLoading ? 'Création...' : 'Créer l\'alerte'}
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

          {alerts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune alerte emploi</h3>
                <p className="text-gray-600">
                  Créez votre première alerte pour commencer votre recherche d'emploi.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">{alert.domain}</h3>
                          <Badge className={getStatusColor(alert.status)}>
                            {getStatusIcon(alert.status)}
                            <span className="ml-1">{getStatusText(alert.status)}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{alert.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{getJobTypeText(alert.job_type)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            <span>{getExperienceLevelText(alert.experience_level)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(alert.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>

                        {alert.location && (
                          <div className="mt-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 inline mr-1" />
                            {alert.location}
                          </div>
                        )}

                        {alert.salary_range && (
                          <div className="mt-2 text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 inline mr-1" />
                            {alert.salary_range.min} - {alert.salary_range.max} {alert.salary_range.currency}
                          </div>
                        )}

                        {alert.remote && (
                          <Badge variant="outline" className="mt-2">
                            <Globe className="h-3 w-3 mr-1" />
                            Télétravail
                          </Badge>
                        )}

                        {alert.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">{alert.notes}</p>
                          </div>
                        )}

                        {alert.assigned_mentor_id && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                Mentor assigné - Prêt pour l'accompagnement
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <div className="flex gap-4">
                        <Button 
                          onClick={() => setSelectedAlert(alert)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir les détails
                        </Button>
                        {alert.assigned_mentor_id && (
                          <Button variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
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

        <TabsContent value="applications" className="space-y-6">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune candidature</h3>
                <p className="text-gray-600">
                  Vos candidatures à des emplois apparaîtront ici.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                          <h3 className="text-lg font-semibold">{application.jobTitle}</h3>
                          <Badge className={getApplicationStatusColor(application.status)}>
                            {getApplicationStatusIcon(application.status)}
                            <span className="ml-1">{getApplicationStatusText(application.status)}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{application.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(application.applicationDate).toLocaleDateString('fr-FR')}</span>
                          </div>
                          {application.salary && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>{application.salary} {application.currency}</span>
                            </div>
                          )}
                          {application.mentor_commission && (
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-green-500" />
                              <span>Commission: {application.mentor_commission}€</span>
                            </div>
                          )}
                        </div>

                        {application.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">{application.notes}</p>
                          </div>
                        )}

                        {application.status === 'hired' && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                Félicitations ! Vous avez été embauché !
                              </span>
                            </div>
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

        {isMentor && (
          <TabsContent value="available-alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtres de recherche
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="filter-domain">Domaine</Label>
                    <Select
                      value={searchFilters.domain}
                      onValueChange={(value) => setSearchFilters(prev => ({ ...prev, domain: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Tous les domaines" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tous les domaines</SelectItem>
                        {domains.map((domain) => (
                          <SelectItem key={domain} value={domain}>
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="filter-country">Pays</Label>
                    <Select
                      value={searchFilters.country}
                      onValueChange={(value) => setSearchFilters(prev => ({ ...prev, country: value }))}
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

                  <div>
                    <Label htmlFor="filter-experience">Niveau d'expérience</Label>
                    <Select
                      value={searchFilters.experienceLevel}
                      onValueChange={(value) => setSearchFilters(prev => ({ ...prev, experienceLevel: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Tous les niveaux" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tous les niveaux</SelectItem>
                        <SelectItem value="entry">Junior</SelectItem>
                        <SelectItem value="mid">Intermédiaire</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="executive">Direction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4">
                  <Button onClick={fetchAvailableAlerts} className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher des alertes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {availableAlerts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune alerte disponible</h3>
                  <p className="text-gray-600">
                    Aucune alerte ne correspond à vos critères de recherche.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {availableAlerts.map((alert) => (
                  <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Briefcase className="h-5 w-5 text-blue-600" />
                            <h3 className="text-lg font-semibold">{alert.domain}</h3>
                            <Badge className={getStatusColor(alert.status)}>
                              {getStatusIcon(alert.status)}
                              <span className="ml-1">{getStatusText(alert.status)}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{alert.country}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <span>{getJobTypeText(alert.job_type)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              <span>{getExperienceLevelText(alert.experience_level)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(alert.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>

                          {alert.location && (
                            <div className="mt-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4 inline mr-1" />
                              {alert.location}
                            </div>
                          )}

                          {alert.salary_range && (
                            <div className="mt-2 text-sm text-gray-600">
                              <DollarSign className="h-4 w-4 inline mr-1" />
                              {alert.salary_range.min} - {alert.salary_range.max} {alert.salary_range.currency}
                            </div>
                          )}

                          {alert.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-600">{alert.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t">
                        <div className="flex gap-4">
                          <Button 
                            onClick={() => handleAssignMentor(alert.id)}
                            className="flex-1"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            S'assigner cette alerte
                          </Button>
                          <Button variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contacter l'étudiant
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Formulaire de candidature */}
      {selectedAlert && showApplicationForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Nouvelle Candidature</CardTitle>
            <CardDescription>
              Créez une candidature pour l'alerte: {selectedAlert.domain} - {selectedAlert.country}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="jobTitle">Titre du poste *</Label>
                <Input
                  id="jobTitle"
                  value={newApplication.jobTitle}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="Ex: Développeur Full Stack"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="company">Entreprise *</Label>
                <Input
                  id="company"
                  value={newApplication.company}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Ex: Google"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="salary">Salaire (optionnel)</Label>
                <Input
                  id="salary"
                  type="number"
                  value={newApplication.salary}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="5000"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="currency">Devise</Label>
                <Select
                  value={newApplication.currency}
                  onValueChange={(value) => setNewApplication(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger className="mt-1">
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
              <Label htmlFor="applicationNotes">Notes (optionnel)</Label>
              <Textarea
                id="applicationNotes"
                value={newApplication.notes}
                onChange={(e) => setNewApplication(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Informations supplémentaires sur la candidature..."
                className="mt-1"
              />
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleCreateApplication}
                disabled={isLoading || !newApplication.jobTitle || !newApplication.company}
                className="flex-1"
              >
                {isLoading ? 'Création...' : 'Créer la candidature'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowApplicationForm(false)}
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
