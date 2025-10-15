'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  BookOpen, 
  Users, 
  Calendar, 
  Star, 
  TrendingUp,
  Target,
  Globe,
  MessageSquare,
  Settings,
  Search,
  Award,
  Bell,
  CreditCard,
  FileText,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  UserPlus,
  GraduationCap,
  Lightbulb
} from 'lucide-react'

interface UserStats {
  totalSessions: number
  completedSessions: number
  totalMentees: number
  averageRating: number
  points: number
  level: string
  upcomingEvents: number
  pendingRequests: number
}

export default function ProfileDashboard() {
  const { user, signOut } = useAuthStore()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    fetchStats()
  }, [user, router])

  const fetchStats = async () => {
    // Simulation de données pour la démonstration
    const mockStats: UserStats = {
      totalSessions: user?.is_mentor ? 24 : 8,
      completedSessions: user?.is_mentor ? 22 : 7,
      totalMentees: user?.is_mentor ? 12 : 0,
      averageRating: user?.is_mentor ? 4.8 : 0,
      points: user?.points || 0,
      level: user?.level || 'bronze',
      upcomingEvents: 3,
      pendingRequests: user?.is_mentor ? 2 : 0
    }
    setStats(mockStats)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-amber-100 text-amber-800'
      case 'silver': return 'bg-gray-100 text-gray-800'
      case 'gold': return 'bg-yellow-100 text-yellow-800'
      case 'platinum': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'bronze': return <Award className="h-4 w-4" />
      case 'silver': return <Award className="h-4 w-4" />
      case 'gold': return <Award className="h-4 w-4" />
      case 'platinum': return <Award className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour accéder à votre tableau de bord.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* En-tête du profil */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.first_name?.charAt(0) || user.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Bonjour, {user.first_name || user.name} !
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getLevelColor(user.level)}>
                  {getLevelIcon(user.level)}
                  <span className="ml-1 capitalize">{user.level}</span>
                </Badge>
                <Badge variant="outline">{user.points} points</Badge>
                {user.is_mentor && (
                  <Badge className="bg-green-100 text-green-800">
                    <UserPlus className="h-3 w-3 mr-1" />
                    Mentor
                  </Badge>
                )}
                {user.is_student && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Étudiant
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => signOut()}>
            Déconnexion
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="student-role">Rôle Étudiant</TabsTrigger>
          <TabsTrigger value="mentor-role">Rôle Mentor</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques principales */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Points Total</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.points}</div>
                  <p className="text-xs text-muted-foreground">
                    Niveau {stats.level}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    sur {stats.totalSessions} total
                  </p>
                </CardContent>
              </Card>

              {user.is_mentor && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mentorés</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalMentees}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.averageRating}/5 étoiles
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Événements</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                  <p className="text-xs text-muted-foreground">
                    à venir
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Actions rapides */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
                <CardDescription>
                  Accès direct aux fonctionnalités principales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  onClick={() => router.push('/scholarships')}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher des bourses
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/mentors')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Trouver un mentor
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/events')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Voir les événements
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/forums')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Participer aux forums
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestion des Rôles</CardTitle>
                <CardDescription>
                  Activez ou gérez vos rôles sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {!user.is_student && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => router.push('/profile/roles')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Activer le rôle Étudiant
                  </Button>
                )}
                {!user.is_mentor && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => router.push('/profile/roles')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Demander le rôle Mentor
                  </Button>
                )}
                {user.is_student && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('student-role')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Gérer le rôle Étudiant
                  </Button>
                )}
                {user.is_mentor && (
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setActiveTab('mentor-role')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Gérer le rôle Mentor
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activité récente */}
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>
                Vos dernières interactions sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Session de mentorat complétée</p>
                    <p className="text-sm text-gray-600">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Nouvelle bourse ajoutée à vos favoris</p>
                    <p className="text-sm text-gray-600">Il y a 1 jour</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Message reçu de votre mentor</p>
                    <p className="text-sm text-gray-600">Il y a 2 jours</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="student-role" className="space-y-6">
          {user.is_student ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Rôle Étudiant Actif
                  </CardTitle>
                  <CardDescription>
                    Vous pouvez apprendre auprès de mentors et accéder aux fonctionnalités étudiantes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      className="w-full justify-start" 
                      onClick={() => router.push('/mentoring/sessions')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Mes Sessions de Mentorat
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/ai-orientation')}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Orientation IA
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/checklists')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Checklists Administratives
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/job-alerts')}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Alertes Emploi
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mes Objectifs d'Apprentissage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">Préparation aux entretiens techniques</p>
                        <p className="text-sm text-gray-600">En cours</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">75%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">Apprentissage React.js</p>
                        <p className="text-sm text-gray-600">Complété</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">100%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Activer le Rôle Étudiant
                </CardTitle>
                <CardDescription>
                  Activez ce rôle pour apprendre auprès de mentors et accéder aux fonctionnalités d'apprentissage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Users className="h-6 w-6 text-blue-500" />
                    <div>
                      <h3 className="font-medium">Mentorat</h3>
                      <p className="text-sm text-gray-600">Apprenez auprès d'experts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Lightbulb className="h-6 w-6 text-yellow-500" />
                    <div>
                      <h3 className="font-medium">Orientation IA</h3>
                      <p className="text-sm text-gray-600">Recommandations personnalisées</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <FileText className="h-6 w-6 text-green-500" />
                    <div>
                      <h3 className="font-medium">Checklists</h3>
                      <p className="text-sm text-gray-600">Démarches administratives</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Briefcase className="h-6 w-6 text-purple-500" />
                    <div>
                      <h3 className="font-medium">Alertes Emploi</h3>
                      <p className="text-sm text-gray-600">Opportunités professionnelles</p>
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/profile/roles')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Activer le Rôle Étudiant
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mentor-role" className="space-y-6">
          {user.is_mentor ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Rôle Mentor Actif
                  </CardTitle>
                  <CardDescription>
                    Vous pouvez enseigner et accompagner d'autres utilisateurs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      className="w-full justify-start" 
                      onClick={() => router.push('/mentor/students')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Mes Mentorés
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/mentor/sessions/new')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle Session
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/admin/forums')}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Gérer les Forums
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => router.push('/feedback')}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Mes Évaluations
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Mentorés Actifs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalMentees}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.averageRating}/5</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Demandes en Attente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Demander le Rôle Mentor
                </CardTitle>
                <CardDescription>
                  Ce rôle nécessite une validation par nos administrateurs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Users className="h-6 w-6 text-blue-500" />
                    <div>
                      <h3 className="font-medium">Accompagnement</h3>
                      <p className="text-sm text-gray-600">Guidez d'autres utilisateurs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <MessageSquare className="h-6 w-6 text-green-500" />
                    <div>
                      <h3 className="font-medium">Modération</h3>
                      <p className="text-sm text-gray-600">Animez les forums</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    <Star className="h-6 w-6 text-yellow-500" />
                    <div>
                      <h3 className="font-medium">Récompenses</h3>
                      <p className="text-sm text-gray-600">Gagnez des points et primes</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800">
                      Validation requise par l'administrateur
                    </p>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Votre profil sera examiné et vous pourriez être contacté pour un entretien.
                  </p>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/profile/roles')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Demander le Rôle Mentor
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du Profil</CardTitle>
              <CardDescription>
                Gérez vos informations personnelles et préférences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/notifications')}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/subscriptions')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Abonnements
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/feedback')}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Feedback
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => router.push('/profile/roles')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Gestion des Rôles
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
