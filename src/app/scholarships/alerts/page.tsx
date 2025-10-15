'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { scholarshipService } from '@/lib/scholarshipService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  GraduationCap, 
  DollarSign,
  Calendar,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { ScholarshipAlert } from '@/types'

export default function ScholarshipAlertsPage() {
  const { user } = useAuthStore()
  const [alerts, setAlerts] = useState<ScholarshipAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingAlert, setEditingAlert] = useState<ScholarshipAlert | null>(null)
  const [newAlert, setNewAlert] = useState({
    name: '',
    filters: {
      countries: [] as string[],
      levels: [] as string[],
      fields: [] as string[],
      languages: [] as string[],
      minAmount: '',
      maxAmount: '',
      deadlineBefore: ''
    }
  })

  useEffect(() => {
    if (user) {
      fetchAlerts()
    }
  }, [user])

  const fetchAlerts = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const { alerts: userAlerts, error } = await scholarshipService.getAlerts(user.id)
      if (error) {
        console.error('Erreur lors du chargement des alertes:', error)
      } else {
        setAlerts(userAlerts)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAlert = async () => {
    if (!user || !newAlert.name.trim()) return

    setIsCreating(true)
    try {
      // Nettoyer les filtres (supprimer les valeurs vides)
      const cleanFilters = {
        countries: newAlert.filters.countries.filter(c => c.trim() !== ''),
        levels: newAlert.filters.levels.filter(l => l.trim() !== ''),
        fields: newAlert.filters.fields.filter(f => f.trim() !== ''),
        languages: newAlert.filters.languages.filter(l => l.trim() !== ''),
        minAmount: newAlert.filters.minAmount ? parseInt(newAlert.filters.minAmount) : undefined,
        maxAmount: newAlert.filters.maxAmount ? parseInt(newAlert.filters.maxAmount) : undefined,
        deadlineBefore: newAlert.filters.deadlineBefore || undefined
      }

      const { alert, error } = await scholarshipService.createAlert(user.id, {
        name: newAlert.name,
        filters: cleanFilters
      })

      if (error) {
        alert(`Erreur: ${error}`)
      } else if (alert) {
        setAlerts(prev => [alert, ...prev])
        setNewAlert({
          name: '',
          filters: {
            countries: [],
            levels: [],
            fields: [],
            languages: [],
            minAmount: '',
            maxAmount: '',
            deadlineBefore: ''
          }
        })
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'alerte:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateAlert = async (alertId: string, updates: Partial<ScholarshipAlert>) => {
    try {
      const { success, error } = await scholarshipService.updateAlert(alertId, updates)
      if (error) {
        alert(`Erreur: ${error}`)
      } else if (success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, ...updates } : alert
        ))
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'alerte:', error)
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) return

    try {
      const { success, error } = await scholarshipService.deleteAlert(alertId)
      if (error) {
        alert(`Erreur: ${error}`)
      } else if (success) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'alerte:', error)
    }
  }

  const toggleAlertStatus = async (alertId: string, currentStatus: boolean) => {
    await handleUpdateAlert(alertId, { is_active: !currentStatus })
  }

  const getFilterDisplayText = (alert: ScholarshipAlert) => {
    const filters = alert.filters
    const parts = []

    if (filters.countries && filters.countries.length > 0) {
      parts.push(`Pays: ${filters.countries.join(', ')}`)
    }

    if (filters.levels && filters.levels.length > 0) {
      const levelNames = filters.levels.map(level => 
        level === 'undergraduate' ? 'Licence' :
        level === 'graduate' ? 'Master' : 'Doctorat'
      )
      parts.push(`Niveau: ${levelNames.join(', ')}`)
    }

    if (filters.minAmount || filters.maxAmount) {
      const min = filters.minAmount || 0
      const max = filters.maxAmount || '∞'
      parts.push(`Montant: ${min}€ - ${max}€`)
    }

    if (filters.deadlineBefore) {
      parts.push(`Deadline avant: ${new Date(filters.deadlineBefore).toLocaleDateString('fr-FR')}`)
    }

    return parts.join(' • ')
  }

  const activeAlerts = alerts.filter(alert => alert.is_active)
  const inactiveAlerts = alerts.filter(alert => !alert.is_active)

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour gérer vos alertes.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Alertes de Bourses</h1>
        <p className="text-gray-600 mt-2">
          Créez des alertes pour être notifié des nouvelles bourses correspondant à vos critères
        </p>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alerts">
            Mes Alertes ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="create">
            Créer une Alerte
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement des alertes...</p>
            </div>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune alerte créée</h3>
                <p className="text-gray-600 mb-4">
                  Créez votre première alerte pour être notifié des nouvelles bourses.
                </p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une alerte
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {activeAlerts.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Alertes Actives ({activeAlerts.length})
                  </h2>
                  <div className="space-y-4">
                    {activeAlerts.map((alert) => (
                      <Card key={alert.id} className="border-green-200 bg-green-50/50">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-green-600" />
                                {alert.name}
                              </CardTitle>
                              <CardDescription className="mt-2">
                                {getFilterDisplayText(alert)}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAlertStatus(alert.id, alert.is_active)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Désactiver
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingAlert(alert)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAlert(alert.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Créée le {new Date(alert.created_at).toLocaleDateString('fr-FR')}
                            </div>
                            {alert.last_triggered && (
                              <div className="flex items-center gap-1">
                                <Bell className="h-4 w-4" />
                                Dernière notification: {new Date(alert.last_triggered).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {inactiveAlerts.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-gray-500" />
                    Alertes Inactives ({inactiveAlerts.length})
                  </h2>
                  <div className="space-y-4">
                    {inactiveAlerts.map((alert) => (
                      <Card key={alert.id} className="border-gray-200 bg-gray-50/50">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-gray-500" />
                                {alert.name}
                              </CardTitle>
                              <CardDescription className="mt-2">
                                {getFilterDisplayText(alert)}
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleAlertStatus(alert.id, alert.is_active)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activer
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAlert(alert.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Créer une nouvelle alerte</CardTitle>
              <CardDescription>
                Configurez les critères pour recevoir des notifications sur les nouvelles bourses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="alertName">Nom de l'alerte *</Label>
                <Input
                  id="alertName"
                  value={newAlert.name}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Bourses France Master"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Pays</Label>
                  <Select onValueChange={(value) => {
                    if (value && !newAlert.filters.countries.includes(value)) {
                      setNewAlert(prev => ({
                        ...prev,
                        filters: {
                          ...prev.filters,
                          countries: [...prev.filters.countries, value]
                        }
                      }))
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
                      <SelectItem value="Espagne">Espagne</SelectItem>
                      <SelectItem value="Italie">Italie</SelectItem>
                      <SelectItem value="Pays-Bas">Pays-Bas</SelectItem>
                    </SelectContent>
                  </Select>
                  {newAlert.filters.countries.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newAlert.filters.countries.map(country => (
                        <Badge key={country} variant="secondary" className="cursor-pointer"
                          onClick={() => setNewAlert(prev => ({
                            ...prev,
                            filters: {
                              ...prev.filters,
                              countries: prev.filters.countries.filter(c => c !== country)
                            }
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
                    if (value && !newAlert.filters.levels.includes(value)) {
                      setNewAlert(prev => ({
                        ...prev,
                        filters: {
                          ...prev.filters,
                          levels: [...prev.filters.levels, value]
                        }
                      }))
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
                  {newAlert.filters.levels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newAlert.filters.levels.map(level => (
                        <Badge key={level} variant="secondary" className="cursor-pointer"
                          onClick={() => setNewAlert(prev => ({
                            ...prev,
                            filters: {
                              ...prev.filters,
                              levels: prev.filters.levels.filter(l => l !== level)
                            }
                          }))}>
                          {level === 'undergraduate' ? 'Licence' :
                           level === 'graduate' ? 'Master' : 'Doctorat'} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="minAmount">Montant minimum (EUR)</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    value={newAlert.filters.minAmount}
                    onChange={(e) => setNewAlert(prev => ({
                      ...prev,
                      filters: { ...prev.filters, minAmount: e.target.value }
                    }))}
                    placeholder="0"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxAmount">Montant maximum (EUR)</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    value={newAlert.filters.maxAmount}
                    onChange={(e) => setNewAlert(prev => ({
                      ...prev,
                      filters: { ...prev.filters, maxAmount: e.target.value }
                    }))}
                    placeholder="50000"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadlineBefore">Deadline avant le</Label>
                <Input
                  id="deadlineBefore"
                  type="date"
                  value={newAlert.filters.deadlineBefore}
                  onChange={(e) => setNewAlert(prev => ({
                    ...prev,
                    filters: { ...prev.filters, deadlineBefore: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleCreateAlert}
                  disabled={isCreating || !newAlert.name.trim()}
                  className="flex-1"
                >
                  {isCreating ? 'Création...' : 'Créer l\'alerte'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setNewAlert({
                    name: '',
                    filters: {
                      countries: [],
                      levels: [],
                      fields: [],
                      languages: [],
                      minAmount: '',
                      maxAmount: '',
                      deadlineBefore: ''
                    }
                  })}
                >
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
