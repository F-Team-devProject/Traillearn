'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Clock, Plus, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function MentorAvailabilityPage() {
  const [availability, setAvailability] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSlot, setNewSlot] = useState({
    day: '',
    startTime: '',
    endTime: '',
    isRecurring: false
  })
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const daysOfWeek = [
    'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
  ]

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'mentor') {
      router.push('/auth/login')
      return
    }

    // Simulation du chargement de la disponibilité
    const loadAvailability = async () => {
      setIsLoading(true)
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Données simulées
        const mockAvailability = [
          {
            id: '1',
            day: 'Lundi',
            startTime: '09:00',
            endTime: '17:00',
            isRecurring: true,
            isActive: true
          },
          {
            id: '2',
            day: 'Mardi',
            startTime: '14:00',
            endTime: '18:00',
            isRecurring: true,
            isActive: true
          },
          {
            id: '3',
            day: 'Mercredi',
            startTime: '10:00',
            endTime: '16:00',
            isRecurring: true,
            isActive: true
          },
          {
            id: '4',
            day: 'Samedi',
            startTime: '09:00',
            endTime: '12:00',
            isRecurring: true,
            isActive: false
          }
        ]
        setAvailability(mockAvailability)
      } catch (error) {
        console.error('Erreur lors du chargement de la disponibilité:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAvailability()
  }, [isAuthenticated, user, router])

  const handleAddSlot = () => {
    if (newSlot.day && newSlot.startTime && newSlot.endTime) {
      const slot = {
        id: Date.now().toString(),
        ...newSlot,
        isActive: true
      }
      setAvailability([...availability, slot])
      setNewSlot({ day: '', startTime: '', endTime: '', isRecurring: false })
      setShowAddForm(false)
    }
  }

  const handleDeleteSlot = (id: string) => {
    setAvailability(availability.filter(slot => slot.id !== id))
  }

  const toggleSlotStatus = (id: string) => {
    setAvailability(availability.map(slot => 
      slot.id === id 
        ? { ...slot, isActive: !slot.isActive }
        : slot
    ))
  }

  const getDayColor = (day: string) => {
    const colors: { [key: string]: string } = {
      'Lundi': 'bg-blue-100 text-blue-800',
      'Mardi': 'bg-green-100 text-green-800',
      'Mercredi': 'bg-yellow-100 text-yellow-800',
      'Jeudi': 'bg-purple-100 text-purple-800',
      'Vendredi': 'bg-red-100 text-red-800',
      'Samedi': 'bg-orange-100 text-orange-800',
      'Dimanche': 'bg-gray-100 text-gray-800'
    }
    return colors[day] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la disponibilité...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Disponibilité</h1>
              <p className="text-gray-600 mt-2">Gérez vos créneaux de disponibilité</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/mentor/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Créneaux Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {availability.filter(slot => slot.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Heures/Semaine</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {availability
                      .filter(slot => slot.isActive)
                      .reduce((total, slot) => {
                        const start = new Date(`2000-01-01T${slot.startTime}`)
                        const end = new Date(`2000-01-01T${slot.endTime}`)
                        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                        return total + diff
                      }, 0)
                      .toFixed(1)
                    }h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Plus className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Créneaux</p>
                  <p className="text-2xl font-bold text-gray-900">{availability.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bouton d'ajout */}
        <div className="mb-6">
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un créneau
          </Button>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Nouveau Créneau</CardTitle>
              <CardDescription>Ajoutez un nouveau créneau de disponibilité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jour</label>
                  <select
                    value={newSlot.day}
                    onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Sélectionner un jour</option>
                    {daysOfWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Récurrent</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newSlot.isRecurring}
                      onChange={(e) => setNewSlot({ ...newSlot, isRecurring: e.target.checked })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-600">Créneau récurrent</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heure de début</label>
                  <input
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heure de fin</label>
                  <input
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleAddSlot} className="bg-green-600 hover:bg-green-700">
                  Ajouter
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des créneaux */}
        <Card>
          <CardHeader>
            <CardTitle>Mes Créneaux de Disponibilité</CardTitle>
            <CardDescription>
              Gérez vos créneaux de disponibilité pour les sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availability.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun créneau défini</h3>
                <p className="text-gray-600 mb-4">Ajoutez votre premier créneau de disponibilité</p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un créneau
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {availability.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDayColor(slot.day)}`}>
                        {slot.day}
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                      {slot.isRecurring && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Récurrent
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant={slot.isActive ? "default" : "outline"}
                        onClick={() => toggleSlotStatus(slot.id)}
                      >
                        {slot.isActive ? 'Actif' : 'Inactif'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSlot(slot.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
