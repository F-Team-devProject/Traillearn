'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Target,
  ArrowLeft,
  Plus,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  BookOpen
} from 'lucide-react'

interface Goal {
  id: string
  title: string
  description: string
  category: 'academic' | 'career' | 'personal' | 'skill'
  priority: 'low' | 'medium' | 'high'
  deadline: string
  status: 'not_started' | 'in_progress' | 'completed'
  created_at: string
}

export default function StudentGoalsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'academic' as Goal['category'],
    priority: 'medium' as Goal['priority'],
    deadline: ''
  })

  const categories = [
    { value: 'academic', label: 'Académique', icon: BookOpen, color: 'bg-blue-100 text-blue-800' },
    { value: 'career', label: 'Carrière', icon: TrendingUp, color: 'bg-green-100 text-green-800' },
    { value: 'personal', label: 'Personnel', icon: Target, color: 'bg-purple-100 text-purple-800' },
    { value: 'skill', label: 'Compétences', icon: CheckCircle, color: 'bg-orange-100 text-orange-800' }
  ]

  const priorities = [
    { value: 'low', label: 'Faible', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Moyenne', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'Élevée', color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      router.push('/')
      return
    }
    loadGoals()
  }, [user])

  const loadGoals = async () => {
    try {
      setLoading(true)
      // Simuler des objectifs existants
      const mockGoals: Goal[] = [
        {
          id: '1',
          title: 'Réussir mon baccalauréat avec mention',
          description: 'Obtenir une mention bien ou très bien pour accéder aux meilleures formations',
          category: 'academic',
          priority: 'high',
          deadline: '2024-06-15',
          status: 'in_progress',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Apprendre le développement web',
          description: 'Maîtriser HTML, CSS, JavaScript et React pour créer des applications web',
          category: 'skill',
          priority: 'medium',
          deadline: '2024-12-31',
          status: 'not_started',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Améliorer mon niveau d\'anglais',
          description: 'Atteindre le niveau B2 en anglais pour les études à l\'étranger',
          category: 'academic',
          priority: 'medium',
          deadline: '2024-08-30',
          status: 'in_progress',
          created_at: new Date().toISOString()
        }
      ]
      setGoals(mockGoals)
    } catch (error) {
      console.error('Erreur lors du chargement des objectifs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      priority: newGoal.priority,
      deadline: newGoal.deadline,
      status: 'not_started',
      created_at: new Date().toISOString()
    }

    setGoals(prev => [...prev, goal])
    setNewGoal({
      title: '',
      description: '',
      category: 'academic',
      priority: 'medium',
      deadline: ''
    })
    setShowAddForm(false)
  }

  const updateGoalStatus = (goalId: string, status: Goal['status']) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, status } : goal
    ))
  }

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId))
  }

  const getCategoryInfo = (category: Goal['category']) => {
    return categories.find(cat => cat.value === category) || categories[0]
  }

  const getPriorityInfo = (priority: Goal['priority']) => {
    return priorities.find(pri => pri.value === priority) || priorities[1]
  }

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'not_started': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: Goal['status']) => {
    switch (status) {
      case 'completed': return 'Terminé'
      case 'in_progress': return 'En cours'
      case 'not_started': return 'Non commencé'
      default: return 'Non commencé'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des objectifs...</p>
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
                <h1 className="text-3xl font-bold text-gray-900">Mes Objectifs</h1>
                <p className="text-gray-600 mt-2">Définissez et suivez vos objectifs académiques</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel objectif
              </Button>
              <Button variant="outline" onClick={() => router.push('/nav')}>
                Navigation
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Terminés</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {goals.filter(g => g.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {goals.filter(g => g.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Urgents</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {goals.filter(g => g.priority === 'high').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nouvel objectif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre de l'objectif</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Réussir mon baccalauréat avec mention"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre objectif en détail..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Catégorie</Label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value as Goal['category'] }))}
                    className="w-full p-2 border rounded-md"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Priorité</Label>
                  <select
                    value={newGoal.priority}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value as Goal['priority'] }))}
                    className="w-full p-2 border rounded-md"
                  >
                    {priorities.map(pri => (
                      <option key={pri.value} value={pri.value}>{pri.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="deadline">Date limite</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddGoal}>
                  Ajouter l'objectif
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des objectifs */}
        <div className="space-y-6">
          {goals.map((goal) => {
            const categoryInfo = getCategoryInfo(goal.category)
            const priorityInfo = getPriorityInfo(goal.priority)
            const CategoryIcon = categoryInfo.icon

            return (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <CategoryIcon className="h-5 w-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                        <Badge className={categoryInfo.color}>
                          {categoryInfo.label}
                        </Badge>
                        <Badge className={priorityInfo.color}>
                          {priorityInfo.label}
                        </Badge>
                        <Badge className={getStatusColor(goal.status)}>
                          {getStatusLabel(goal.status)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{goal.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Échéance: {new Date(goal.deadline).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Créé le {new Date(goal.created_at).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant={goal.status === 'not_started' ? 'default' : 'outline'}
                          onClick={() => updateGoalStatus(goal.id, 'not_started')}
                        >
                          Non commencé
                        </Button>
                        <Button
                          size="sm"
                          variant={goal.status === 'in_progress' ? 'default' : 'outline'}
                          onClick={() => updateGoalStatus(goal.id, 'in_progress')}
                        >
                          En cours
                        </Button>
                        <Button
                          size="sm"
                          variant={goal.status === 'completed' ? 'default' : 'outline'}
                          onClick={() => updateGoalStatus(goal.id, 'completed')}
                        >
                          Terminé
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {goals.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun objectif défini
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par définir vos premiers objectifs
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer mon premier objectif
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}


