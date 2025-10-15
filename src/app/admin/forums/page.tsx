'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { forumService } from '@/lib/forumService'
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
  MessageSquare, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  User,
  Calendar,
  Shield,
  Eye,
  Trash2,
  Pin,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Laugh
} from 'lucide-react'
import { Forum, ForumPost } from '@/types'

export default function AdminForumsPage() {
  const { user } = useAuthStore()
  const [pendingForums, setPendingForums] = useState<Forum[]>([])
  const [postReports, setPostReports] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null)
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [validationNotes, setValidationNotes] = useState('')

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchPendingForums()
      fetchPostReports()
    }
  }, [user])

  const fetchPendingForums = async () => {
    setIsLoading(true)
    try {
      const { forums, error } = await forumService.getPendingForums()
      if (error) {
        console.error('Erreur lors du chargement des forums en attente:', error)
      } else {
        setPendingForums(forums)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des forums en attente:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPostReports = async () => {
    try {
      const { reports, error } = await forumService.getPostReports()
      if (error) {
        console.error('Erreur lors du chargement des signalements:', error)
      } else {
        setPostReports(reports)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error)
    }
  }

  const handleValidateForum = async (forumId: string, approved: boolean) => {
    if (!user || user.role !== 'admin') return

    setIsLoading(true)
    try {
      const { success, error } = await forumService.validateForum(
        forumId, 
        user.id, 
        approved, 
        validationNotes
      )
      
      if (error) {
        alert(`Erreur: ${error}`)
      } else if (success) {
        setPendingForums(prev => prev.filter(f => f.id !== forumId))
        setValidationNotes('')
        alert(approved ? 'Forum approuvé avec succès!' : 'Forum rejeté.')
      }
    } catch (error) {
      console.error('Erreur lors de la validation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResolveReport = async (reportId: string, action: 'dismiss' | 'delete_post') => {
    if (!user || user.role !== 'admin') return

    setIsLoading(true)
    try {
      const { success, error } = await forumService.resolveReport(
        reportId,
        action,
        user.id,
        validationNotes
      )
      
      if (error) {
        alert(`Erreur: ${error}`)
      } else if (success) {
        setPostReports(prev => prev.filter(r => r.id !== reportId))
        setValidationNotes('')
        alert(action === 'delete_post' ? 'Post supprimé!' : 'Signalement rejeté.')
      }
    } catch (error) {
      console.error('Erreur lors de la résolution du signalement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeratePost = async (postId: string, action: 'delete' | 'pin' | 'unpin') => {
    if (!user || user.role !== 'admin') return

    setIsLoading(true)
    try {
      const { success, error } = await forumService.moderatePost(
        postId,
        action,
        user.id,
        validationNotes
      )
      
      if (error) {
        alert(`Erreur: ${error}`)
      } else if (success) {
        alert('Action effectuée avec succès!')
        setValidationNotes('')
      }
    } catch (error) {
      console.error('Erreur lors de la modération:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente'
      case 'active':
        return 'Actif'
      case 'rejected':
        return 'Rejeté'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="container mx-auto p-6 text-center">
        <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
        <p className="text-gray-600">Seuls les administrateurs peuvent accéder à cette page.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-600" />
          Modération des Forums
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez les forums et modérez le contenu de la communauté
        </p>
      </div>

      <Tabs defaultValue="pending-forums" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending-forums">
            Forums en attente ({pendingForums.length})
          </TabsTrigger>
          <TabsTrigger value="reports">
            Signalements ({postReports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending-forums" className="space-y-6">
          {pendingForums.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun forum en attente</h3>
                <p className="text-gray-600">Tous les forums ont été traités.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {pendingForums.map((forum) => (
                <Card key={forum.id} className="border-yellow-200 bg-yellow-50/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-3">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                          {forum.title}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Créé par {forum.owner?.first_name} {forum.owner?.last_name} le {formatDate(forum.created_at)}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(forum.status)}>
                        {getStatusIcon(forum.status)}
                        <span className="ml-1">{getStatusText(forum.status)}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="font-medium">Description</Label>
                        <p className="text-gray-600 mt-1">{forum.description}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Catégorie:</span>
                          <p>{forum.category}</p>
                        </div>
                        {forum.country && (
                          <div>
                            <span className="font-medium">Pays:</span>
                            <p>{forum.country}</p>
                          </div>
                        )}
                        {forum.school && (
                          <div>
                            <span className="font-medium">École:</span>
                            <p>{forum.school}</p>
                          </div>
                        )}
                        {forum.domain && (
                          <div>
                            <span className="font-medium">Domaine:</span>
                            <p>{forum.domain}</p>
                          </div>
                        )}
                      </div>

                      {forum.tags && forum.tags.length > 0 && (
                        <div>
                          <Label className="font-medium">Tags</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {forum.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor={`notes-${forum.id}`} className="font-medium">
                          Notes de validation (optionnel)
                        </Label>
                        <Textarea
                          id={`notes-${forum.id}`}
                          value={validationNotes}
                          onChange={(e) => setValidationNotes(e.target.value)}
                          placeholder="Ajoutez des notes pour justifier votre décision..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-4 pt-4 border-t">
                        <Button 
                          onClick={() => handleValidateForum(forum.id, true)}
                          disabled={isLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approuver
                        </Button>
                        <Button 
                          onClick={() => handleValidateForum(forum.id, false)}
                          disabled={isLoading}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeter
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setSelectedForum(forum)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {postReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun signalement</h3>
                <p className="text-gray-600">Aucun contenu n'a été signalé.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {postReports.map((report) => (
                <Card key={report.id} className="border-red-200 bg-red-50/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          Signalement de contenu
                        </CardTitle>
                        <CardDescription className="mt-2">
                          Signalé par {report.reporter?.first_name} {report.reporter?.last_name} le {formatDate(report.created_at)}
                        </CardDescription>
                      </div>
                      <Badge className="bg-red-100 text-red-800">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Signalé
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Post signalé</span>
                        </div>
                        <h4 className="font-semibold mb-2">{report.post?.title}</h4>
                        <p className="text-gray-600 mb-2">{report.post?.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{report.post?.author?.first_name} {report.post?.author?.last_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{report.post?.forum?.title}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(report.post?.created_at || '')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium">Raison du signalement</span>
                        </div>
                        <p className="text-gray-700 mb-2">
                          <strong>{report.reason}</strong>
                        </p>
                        {report.description && (
                          <p className="text-gray-600 text-sm">{report.description}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor={`report-notes-${report.id}`} className="font-medium">
                          Notes de résolution (optionnel)
                        </Label>
                        <Textarea
                          id={`report-notes-${report.id}`}
                          value={validationNotes}
                          onChange={(e) => setValidationNotes(e.target.value)}
                          placeholder="Ajoutez des notes sur votre décision..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-4 pt-4 border-t">
                        <Button 
                          onClick={() => handleResolveReport(report.id, 'delete_post')}
                          disabled={isLoading}
                          variant="destructive"
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer le post
                        </Button>
                        <Button 
                          onClick={() => handleResolveReport(report.id, 'dismiss')}
                          disabled={isLoading}
                          variant="outline"
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Rejeter le signalement
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Détails du forum sélectionné */}
      {selectedForum && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Détails du Forum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedForum.title}</h3>
                <p className="text-gray-600">{selectedForum.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Créateur:</span>
                  <p>{selectedForum.owner?.first_name} {selectedForum.owner?.last_name}</p>
                </div>
                <div>
                  <span className="font-medium">Catégorie:</span>
                  <p>{selectedForum.category}</p>
                </div>
                <div>
                  <span className="font-medium">Statut:</span>
                  <Badge className={getStatusColor(selectedForum.status)}>
                    {getStatusText(selectedForum.status)}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setSelectedForum(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Détails du signalement sélectionné */}
      {selectedReport && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Détails du Signalement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Post signalé</h4>
                <p className="text-gray-600">{selectedReport.post?.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Auteur du post:</span>
                  <p>{selectedReport.post?.author?.first_name} {selectedReport.post?.author?.last_name}</p>
                </div>
                <div>
                  <span className="font-medium">Signaleur:</span>
                  <p>{selectedReport.reporter?.first_name} {selectedReport.reporter?.last_name}</p>
                </div>
                <div>
                  <span className="font-medium">Raison:</span>
                  <p>{selectedReport.reason}</p>
                </div>
                <div>
                  <span className="font-medium">Date:</span>
                  <p>{formatDate(selectedReport.created_at)}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => setSelectedReport(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
