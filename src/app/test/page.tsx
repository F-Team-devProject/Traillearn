'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { localUserAPI, localSessionAPI, localMentorAPI } from '@/lib/localStorage'
import { config } from '@/lib/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  const { user, isAuthenticated, signOut } = useAuthStore()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalMentors: 0
  })

  useEffect(() => {
    // Charger les statistiques
    const users = localUserAPI.getAllUsers()
    const sessions = localSessionAPI.getSessionsByUser('', 'mentor')
    const mentors = localMentorAPI.getAllMentors()
    
    setStats({
      totalUsers: users.length,
      totalSessions: sessions.length,
      totalMentors: mentors.length
    })
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🧪 Page de Test - Traillearn</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Retour à l'accueil
            </Button>
            {isAuthenticated && (
              <Button variant="outline" onClick={handleSignOut}>
                Déconnexion
              </Button>
            )}
          </div>
        </div>
        
        {/* Informations système */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuration Système</CardTitle>
            <CardDescription>État actuel de l'application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800">Mode</h3>
                <p className="text-blue-600">
                  {config.useSupabase() ? '🔗 Supabase' : '💾 LocalStorage'}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">Développement</h3>
                <p className="text-green-600">
                  {config.DEV_MODE ? '✅ Activé' : '❌ Désactivé'}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800">Supabase Configuré</h3>
                <p className="text-purple-600">
                  {config.isSupabaseConfigured() ? '✅ Oui' : '❌ Non'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Utilisateur actuel */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Utilisateur Actuel</CardTitle>
            <CardDescription>Informations de la session</CardDescription>
          </CardHeader>
          <CardContent>
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <p><strong>Nom:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Rôle:</strong> {user.role}</p>
                <p><strong>Pays:</strong> {user.country_code || 'Non spécifié'}</p>
                <p><strong>Profil complété:</strong> {user.profile_completed ? '✅' : '❌'}</p>
                <Button onClick={handleSignOut} variant="outline" className="mt-4">
                  Se déconnecter
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">Aucun utilisateur connecté</p>
            )}
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
            <CardDescription>Données actuelles dans le système</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <h3 className="text-2xl font-bold text-blue-600">{stats.totalUsers}</h3>
                <p className="text-blue-800">Utilisateurs</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <h3 className="text-2xl font-bold text-green-600">{stats.totalSessions}</h3>
                <p className="text-green-800">Sessions</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <h3 className="text-2xl font-bold text-purple-600">{stats.totalMentors}</h3>
                <p className="text-purple-800">Mentors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comptes de test */}
        <Card>
          <CardHeader>
            <CardTitle>Comptes de Test</CardTitle>
            <CardDescription>Comptes pré-créés pour les tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">👑 Administrateur</h4>
                <p><strong>Email:</strong> admin@traillearn.com</p>
                <p><strong>Mot de passe:</strong> AdminTraillearn2024!</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">🎓 Mentor 1</h4>
                <p><strong>Email:</strong> mentor1@traillearn.com</p>
                <p><strong>Mot de passe:</strong> password123</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">🎓 Mentor 2</h4>
                <p><strong>Email:</strong> mentor2@traillearn.com</p>
                <p><strong>Mot de passe:</strong> password123</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">📚 Étudiant 1</h4>
                <p><strong>Email:</strong> student1@traillearn.com</p>
                <p><strong>Mot de passe:</strong> password123</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold">📚 Étudiant 2</h4>
                <p><strong>Email:</strong> student2@traillearn.com</p>
                <p><strong>Mot de passe:</strong> password123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
