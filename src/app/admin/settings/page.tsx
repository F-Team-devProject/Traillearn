'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Settings, Shield, Bell, Globe, Save } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    general: {
      siteName: 'TrailLearn',
      siteDescription: 'Plateforme de mentorat éducatif',
      contactEmail: 'contact@traillearn.com',
      supportEmail: 'support@traillearn.com'
    },
    security: {
      requireEmailVerification: true,
      allowRegistration: true,
      requireAdminApproval: false,
      sessionTimeout: 24
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: true,
      systemAlerts: true
    },
    features: {
      enableMessaging: true,
      enableVideoCalls: true,
      enableFileSharing: true,
      enableReviews: true
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/auth/login')
      return
    }

    // Simulation du chargement des paramètres
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error)
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [isAuthenticated, user, router])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulation de la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Ici, vous feriez un appel API pour sauvegarder les paramètres
      console.log('Paramètres sauvegardés:', settings)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des paramètres...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Paramètres Administrateur</h1>
              <p className="text-gray-600 mt-2">Configurez les paramètres de la plateforme</p>
            </div>
            <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Général
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Fonctionnalités
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres Généraux</CardTitle>
                <CardDescription>Configurez les informations de base de la plateforme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nom du site</Label>
                    <Input
                      id="siteName"
                      value={settings.general.siteName}
                      onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de contact</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.general.contactEmail}
                      onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Description du site</Label>
                  <Input
                    id="siteDescription"
                    value={settings.general.siteDescription}
                    onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email de support</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de Sécurité</CardTitle>
                <CardDescription>Configurez les paramètres de sécurité et d'authentification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireEmailVerification">Vérification email obligatoire</Label>
                      <p className="text-sm text-gray-600">Les utilisateurs doivent vérifier leur email</p>
                    </div>
                    <input
                      type="checkbox"
                      id="requireEmailVerification"
                      checked={settings.security.requireEmailVerification}
                      onChange={(e) => updateSetting('security', 'requireEmailVerification', e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowRegistration">Autoriser les inscriptions</Label>
                      <p className="text-sm text-gray-600">Permettre aux nouveaux utilisateurs de s'inscrire</p>
                    </div>
                    <input
                      type="checkbox"
                      id="allowRegistration"
                      checked={settings.security.allowRegistration}
                      onChange={(e) => updateSetting('security', 'allowRegistration', e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="requireAdminApproval">Approbation admin requise</Label>
                      <p className="text-sm text-gray-600">Les nouveaux comptes nécessitent une approbation</p>
                    </div>
                    <input
                      type="checkbox"
                      id="requireAdminApproval"
                      checked={settings.security.requireAdminApproval}
                      onChange={(e) => updateSetting('security', 'requireAdminApproval', e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Délai d'expiration de session (heures)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      min="1"
                      max="168"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de Notifications</CardTitle>
                <CardDescription>Configurez les notifications système</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Notifications email</Label>
                      <p className="text-sm text-gray-600">Envoyer des notifications par email</p>
                    </div>
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Notifications push</Label>
                      <p className="text-sm text-gray-600">Activer les notifications push</p>
                    </div>
                    <input
                      type="checkbox"
                      id="pushNotifications"
                      checked={settings.notifications.pushNotifications}
                      onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weeklyReports">Rapports hebdomadaires</Label>
                      <p className="text-sm text-gray-600">Envoyer des rapports hebdomadaires aux admins</p>
                    </div>
                    <input
                      type="checkbox"
                      id="weeklyReports"
                      checked={settings.notifications.weeklyReports}
                      onChange={(e) => updateSetting('notifications', 'weeklyReports', e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemAlerts">Alertes système</Label>
                      <p className="text-sm text-gray-600">Recevoir des alertes pour les problèmes système</p>
                    </div>
                    <input
                      type="checkbox"
                      id="systemAlerts"
                      checked={settings.notifications.systemAlerts}
                      onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Fonctionnalités</CardTitle>
                <CardDescription>Activez ou désactivez les fonctionnalités de la plateforme</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableMessaging">Messagerie</Label>
                      <p className="text-sm text-gray-600">Permettre la messagerie entre utilisateurs</p>
                    </div>
                    <input
                      type="checkbox"
                      id="enableMessaging"
                      checked={settings.features.enableMessaging}
                      onChange={(e) => updateSetting('features', 'enableMessaging', e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableVideoCalls">Appels vidéo</Label>
                      <p className="text-sm text-gray-600">Activer les appels vidéo pour les sessions</p>
                    </div>
                    <input
                      type="checkbox"
                      id="enableVideoCalls"
                      checked={settings.features.enableVideoCalls}
                      onChange={(e) => updateSetting('features', 'enableVideoCalls', e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableFileSharing">Partage de fichiers</Label>
                      <p className="text-sm text-gray-600">Permettre le partage de fichiers</p>
                    </div>
                    <input
                      type="checkbox"
                      id="enableFileSharing"
                      checked={settings.features.enableFileSharing}
                      onChange={(e) => updateSetting('features', 'enableFileSharing', e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableReviews">Système d'avis</Label>
                      <p className="text-sm text-gray-600">Permettre aux étudiants de noter les mentors</p>
                    </div>
                    <input
                      type="checkbox"
                      id="enableReviews"
                      checked={settings.features.enableReviews}
                      onChange={(e) => updateSetting('features', 'enableReviews', e.target.checked)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bouton de sauvegarde */}
        <div className="mt-8 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </Button>
        </div>
      </div>
    </div>
  )
}
