'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Home, 
  LogIn, 
  UserPlus, 
  TestTube, 
  Shield, 
  User, 
  BookOpen,
  Settings,
  Target,
  Plus
} from 'lucide-react'

export default function NavigationPage() {
  const router = useRouter()
  const { user, isAuthenticated, signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const navigationItems = [
    {
      title: 'Page d\'accueil',
      description: 'Retour à la page principale',
      icon: Home,
      path: '/',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Connexion',
      description: 'Se connecter à son compte',
      icon: LogIn,
      path: '/auth/login',
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Inscription',
      description: 'Créer un nouveau compte',
      icon: UserPlus,
      path: '/auth/register',
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: 'Mentors',
      description: 'Découvrir les mentors disponibles',
      icon: User,
      path: '/mentors',
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Messages',
      description: 'Communiquer avec les mentors',
      icon: MessageCircle,
      path: '/messages',
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Notifications',
      description: 'Voir vos notifications',
      icon: Bell,
      path: '/notifications',
      color: 'bg-yellow-50 text-yellow-600'
    },
    {
      title: 'Page de Test',
      description: 'Vérifier le fonctionnement',
      icon: TestTube,
      path: '/test',
      color: 'bg-orange-50 text-orange-600'
    }
  ]

  const dashboardItems = [
    {
      title: 'Dashboard Admin',
      description: 'Interface administrateur',
      icon: Shield,
      path: '/admin/dashboard',
      color: 'bg-red-50 text-red-600',
      role: 'admin'
    },
    {
      title: 'Dashboard Mentor',
      description: 'Interface mentor',
      icon: User,
      path: '/mentor/dashboard',
      color: 'bg-yellow-50 text-yellow-600',
      role: 'mentor'
    },
    {
      title: 'Dashboard Étudiant',
      description: 'Interface étudiant',
      icon: BookOpen,
      path: '/student/dashboard',
      color: 'bg-indigo-50 text-indigo-600',
      role: 'student'
    },
    {
      title: 'Profil Étudiant',
      description: 'Gérer son profil',
      icon: User,
      path: '/student/profile',
      color: 'bg-indigo-50 text-indigo-600',
      role: 'student'
    },
    {
      title: 'Objectifs Étudiant',
      description: 'Définir ses objectifs',
      icon: Target,
      path: '/student/goals',
      color: 'bg-indigo-50 text-indigo-600',
      role: 'student'
    },
    {
      title: 'Nouvelle Session',
      description: 'Créer une session',
      icon: Plus,
      path: '/mentor/sessions/new',
      color: 'bg-yellow-50 text-yellow-600',
      role: 'mentor'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🧭 Navigation - Traillearn</h1>
          <div className="flex space-x-2">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-500">
                  Connecté en tant que {user?.name} ({user?.role})
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <span className="text-sm text-gray-500">Non connecté</span>
            )}
          </div>
        </div>

        {/* Navigation générale */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Navigation Générale</CardTitle>
            <CardDescription>Pages accessibles à tous</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {navigationItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={index}
                    className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(item.path)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dashboards */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dashboards</CardTitle>
            <CardDescription>Interfaces selon le rôle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardItems.map((item, index) => {
                const Icon = item.icon
                const isAccessible = !isAuthenticated || user?.role === item.role || user?.role === 'admin'
                
                return (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      isAccessible 
                        ? 'hover:shadow-md' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => isAccessible && router.push(item.path)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                        {!isAccessible && (
                          <p className="text-xs text-red-500 mt-1">
                            Rôle {item.role} requis
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Comptes de test */}
        <Card>
          <CardHeader>
            <CardTitle>Comptes de Test</CardTitle>
            <CardDescription>Utilisez ces comptes pour tester les différents rôles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-red-50">
                <h4 className="font-semibold text-red-800">👑 Admin</h4>
                <p className="text-sm text-red-700">admin@traillearn.com</p>
                <p className="text-sm text-red-700">AdminTraillearn2024!</p>
              </div>
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h4 className="font-semibold text-yellow-800">🎓 Mentor 1</h4>
                <p className="text-sm text-yellow-700">mentor1@traillearn.com</p>
                <p className="text-sm text-yellow-700">password123</p>
              </div>
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h4 className="font-semibold text-yellow-800">🎓 Mentor 2</h4>
                <p className="text-sm text-yellow-700">mentor2@traillearn.com</p>
                <p className="text-sm text-yellow-700">password123</p>
              </div>
              <div className="p-4 border rounded-lg bg-indigo-50">
                <h4 className="font-semibold text-indigo-800">📚 Étudiant 1</h4>
                <p className="text-sm text-indigo-700">student1@traillearn.com</p>
                <p className="text-sm text-indigo-700">password123</p>
              </div>
              <div className="p-4 border rounded-lg bg-indigo-50">
                <h4 className="font-semibold text-indigo-800">📚 Étudiant 2</h4>
                <p className="text-sm text-indigo-700">student2@traillearn.com</p>
                <p className="text-sm text-indigo-700">password123</p>
              </div>
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-800">🆕 Nouveau Compte</h4>
                <p className="text-sm text-gray-700">Créez votre propre compte</p>
                <p className="text-sm text-gray-700">via l'inscription</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
