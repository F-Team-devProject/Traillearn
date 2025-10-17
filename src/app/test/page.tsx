'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { localUserAPI, localSessionAPI, localMentorAPI, initDemoData } from '@/lib/localStorage'
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
    // Initialiser les données de test si nécessaire
    initDemoData()
    
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

  const handleInitDemoData = () => {
    // Vider le localStorage d'abord
    localStorage.clear()
    
    // Réinitialiser les données
    initDemoData()
    
    // Recharger les statistiques
    const users = localUserAPI.getAllUsers()
    const sessions = localSessionAPI.getSessionsByUser('', 'mentor')
    const mentors = localMentorAPI.getAllMentors()
    
    setStats({
      totalUsers: users.length,
      totalSessions: sessions.length,
      totalMentors: mentors.length
    })
    
    alert('✅ Données de test initialisées avec succès! Vous pouvez maintenant vous connecter avec les comptes de test.')
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
            <Button 
              variant="default" 
              onClick={handleInitDemoData}
              className="bg-green-600 hover:bg-green-700"
            >
              🚀 Initialiser les données de test
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
                <p><strong>Rôle de base:</strong> {user.role}</p>
                <div className="flex gap-2">
                  <span className="text-sm"><strong>Rôles activés:</strong></span>
                  {user.is_student && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Étudiant</span>}
                  {user.is_mentor && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Mentor</span>}
                  {!user.is_student && !user.is_mentor && <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">Visiteur uniquement</span>}
                </div>
                <p><strong>Niveau:</strong> {user.level} ({user.points} points)</p>
                <p><strong>Abonnement:</strong> {user.subscription_type}</p>
                <p><strong>Pays:</strong> {user.country_code || 'Non spécifié'}</p>
                {user.is_mentor && (
                  <p><strong>Statut mentor:</strong> {user.mentor_status}</p>
                )}
                {user.is_student && (
                  <p><strong>Statut étudiant:</strong> {user.student_status}</p>
                )}
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
            <CardTitle>Comptes de Test - Système Visiteur Multi-Rôles</CardTitle>
            <CardDescription>Comptes pré-créés pour tester le nouveau système</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-red-50">
                <h4 className="font-semibold text-red-800">👑 Administrateur</h4>
                <p><strong>Email:</strong> admin@traillearn.com</p>
                <p><strong>Mot de passe:</strong> AdminTraillearn2024!</p>
                <p className="text-sm text-red-600">Rôle: Admin - Accès complet à toutes les fonctionnalités</p>
              </div>
              
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-semibold text-blue-800">👤 Visiteur 1 (Rôles Activés)</h4>
                <p><strong>Email:</strong> visitor1@traillearn.com</p>
                <p><strong>Mot de passe:</strong> visitor123</p>
                <p className="text-sm text-blue-600">Rôles: Visiteur + Étudiant + Mentor (double profil)</p>
              </div>
              
              <div className="p-4 border rounded-lg bg-green-50">
                <h4 className="font-semibold text-green-800">🎓 Visiteur 2 (Mentor Validé)</h4>
                <p><strong>Email:</strong> mentor@traillearn.com</p>
                <p><strong>Mot de passe:</strong> mentor123</p>
                <p className="text-sm text-green-600">Rôles: Visiteur + Mentor (validé par admin)</p>
              </div>
              
              <div className="p-4 border rounded-lg bg-purple-50">
                <h4 className="font-semibold text-purple-800">📚 Visiteur 3 (Étudiant)</h4>
                <p><strong>Email:</strong> student@traillearn.com</p>
                <p><strong>Mot de passe:</strong> student123</p>
                <p className="text-sm text-purple-600">Rôles: Visiteur + Étudiant (apprendre d'un mentor)</p>
              </div>
              
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h4 className="font-semibold text-yellow-800">🔍 Visiteur 4 (Basique)</h4>
                <p><strong>Email:</strong> visitor@traillearn.com</p>
                <p><strong>Mot de passe:</strong> visitor123</p>
                <p className="text-sm text-yellow-600">Rôle: Visiteur uniquement (peut activer d'autres rôles)</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">💡 Comment tester le système :</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• <strong>Visiteur basique :</strong> Peut naviguer, voir bourses, événements</li>
                <li>• <strong>Activation étudiant :</strong> Aller dans Profil → Gestion des Rôles → Activer Étudiant</li>
                <li>• <strong>Demande mentor :</strong> Aller dans Profil → Gestion des Rôles → Demander Mentor</li>
                <li>• <strong>Validation admin :</strong> Se connecter en admin pour valider les demandes mentor</li>
                <li>• <strong>Double profil :</strong> Un visiteur peut être à la fois étudiant ET mentor</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Nouvelles fonctionnalités */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🚀 Nouvelles Fonctionnalités Implémentées</CardTitle>
            <CardDescription>Testez toutes les fonctionnalités de Traillearn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <h4 className="font-semibold text-blue-800">🎓 Système de Bourses</h4>
                <p className="text-sm text-blue-600">Filtres avancés, favoris, alertes deadlines</p>
                <Button size="sm" className="mt-2" onClick={() => window.location.href = '/scholarships'}>
                  Tester
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg bg-green-50">
                <h4 className="font-semibold text-green-800">🧠 IA d'Orientation</h4>
                <p className="text-sm text-green-600">Recommandations IKIGAI, parcours personnalisés</p>
                <Button size="sm" className="mt-2" onClick={() => window.location.href = '/ai-orientation'}>
                  Tester
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg bg-purple-50">
                <h4 className="font-semibold text-purple-800">💼 Alertes Emploi</h4>
                <p className="text-sm text-purple-600">Système de primes, commissions paramétrables</p>
                <Button size="sm" className="mt-2" onClick={() => window.location.href = '/job-alerts'}>
                  Tester
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg bg-orange-50">
                <h4 className="font-semibold text-orange-800">🏠 Aide Intégration</h4>
                <p className="text-sm text-orange-600">Aéroport, logement, contacts locaux</p>
                <Button size="sm" className="mt-2" onClick={() => window.location.href = '/integration'}>
                  Tester
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg bg-pink-50">
                <h4 className="font-semibold text-pink-800">💬 Forums</h4>
                <p className="text-sm text-pink-600">Création, modération, signalement</p>
                <Button size="sm" className="mt-2" onClick={() => window.location.href = '/forums'}>
                  Tester
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg bg-teal-50">
                <h4 className="font-semibold text-teal-800">📅 Événements</h4>
                <p className="text-sm text-teal-600">Inscriptions, rappels, replays</p>
                <Button size="sm" className="mt-2" onClick={() => window.location.href = '/events'}>
                  Tester
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg bg-indigo-50">
                <h4 className="font-semibold text-indigo-800">💳 Paiements PayPal</h4>
                <p className="text-sm text-indigo-600">Abonnements, commissions, primes</p>
                <Button size="sm" className="mt-2" onClick={() => window.location.href = '/payments'}>
                  Tester
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h4 className="font-semibold text-yellow-800">🔔 Notifications</h4>
                <p className="text-sm text-yellow-600">Email/SMS, préférences, queue</p>
                <Button size="sm" className="mt-2" onClick={() => window.location.href = '/notifications'}>
                  Tester
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold text-gray-800">📋 Checklists</h4>
                <p className="text-sm text-gray-600">Démarches administratives par destination</p>
                <Button size="sm" className="mt-2" onClick={() => window.location.href = '/checklists'}>
                  Tester
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
