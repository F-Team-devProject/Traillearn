'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Users, BookOpen, Globe } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated, getCurrentUser, initDemoData } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialiser les données de démonstration
    initDemoData()
    
    // Récupérer l'utilisateur actuel
    getCurrentUser().finally(() => setIsLoading(false))
  }, [getCurrentUser, initDemoData])

  useEffect(() => {
    if (isAuthenticated && user) {
      // Rediriger vers le dashboard approprié selon le rôle
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard')
          break
        case 'mentor':
          router.push('/mentor/dashboard')
          break
        case 'student':
          router.push('/student/dashboard')
          break
        default:
          router.push('/auth/login')
      }
    }
  }, [isAuthenticated, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirection en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Traillearn</h1>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.push('/nav')}>
                Navigation
              </Button>
              <Button variant="outline" onClick={() => router.push('/test')}>
                Test
              </Button>
              <Button variant="outline" onClick={() => router.push('/auth/login')}>
                Connexion
              </Button>
              <Button onClick={() => router.push('/auth/register')}>
                S'inscrire
              </Button>
            </div>
          </div>
        </div>
      </header>


      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Votre avenir académique
              <span className="text-primary block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">commence ici</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Plateforme de réseautage académique international pour accompagner les jeunes 
              dans leur orientation et faciliter la mobilité internationale.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay">
            <Button 
              size="lg" 
              onClick={() => router.push('/auth/register')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
            >
              Commencer maintenant
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => router.push('/mentors')}
              className="border-2 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
            >
              Découvrir les mentors
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="hover-lift group cursor-pointer">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="group-hover:text-blue-600 transition-colors">Réseautage</CardTitle>
              <CardDescription>
                Connectez-vous avec des mentors, étudiants et professionnels du monde entier
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift group cursor-pointer">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="group-hover:text-purple-600 transition-colors">Orientation</CardTitle>
              <CardDescription>
                Recevez des conseils personnalisés pour votre orientation académique et professionnelle
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift group cursor-pointer">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="group-hover:text-green-600 transition-colors">Mobilité Internationale</CardTitle>
              <CardDescription>
                Découvrez les opportunités d'études et de carrière à l'international
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover-lift group cursor-pointer">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="group-hover:text-orange-600 transition-colors">IA Intelligente</CardTitle>
              <CardDescription>
                Bénéficiez de recommandations personnalisées grâce à l'intelligence artificielle
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-primary rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer votre parcours ?</h2>
          <p className="text-xl mb-6 opacity-90">
            Rejoignez des milliers d'étudiants qui ont trouvé leur voie grâce à Traillearn
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => router.push('/auth/register')}
          >
            Créer mon compte gratuit
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-primary mr-2" />
              <h3 className="text-2xl font-bold">Traillearn</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Plateforme de réseautage académique international
            </p>
            <p className="text-sm text-gray-500">
              © 2024 Traillearn. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
