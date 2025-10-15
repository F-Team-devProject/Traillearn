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
  MapPin, 
  Building, 
  GraduationCap,
  Plus,
  Search,
  Filter,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Laugh,
  AlertTriangle,
  Eye,
  Pin,
  User,
  Calendar,
  Globe,
  Lock,
  TrendingUp
} from 'lucide-react'
import { Forum, ForumPost } from '@/types'

export default function ForumsPage() {
  const { user } = useAuthStore()
  const [forums, setForums] = useState<Forum[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null)
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([])
  const [showPostForm, setShowPostForm] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    country: '',
    school: '',
    domain: '',
    search: ''
  })
  const [newForum, setNewForum] = useState({
    title: '',
    description: '',
    category: '',
    country: '',
    school: '',
    domain: '',
    isPrivate: false,
    tags: ['']
  })
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: ['']
  })

  const categories = [
    'Général',
    'Études et Bourses',
    'Carrière et Emploi',
    'Intégration et Vie Locale',
    'Technologies',
    'Langues',
    'Voyages et Culture',
    'Questions Administratives',
    'Mentorat',
    'Événements'
  ]

  const countries = [
    'France', 'Canada', 'États-Unis', 'Royaume-Uni', 'Allemagne', 'Espagne',
    'Italie', 'Pays-Bas', 'Belgique', 'Suisse', 'Suède', 'Norvège',
    'Danemark', 'Finlande', 'Autriche', 'Portugal'
  ]

  const domains = [
    'Informatique', 'Data Science', 'Cybersécurité', 'Intelligence Artificielle',
    'Marketing', 'Finance', 'Ingénierie', 'Médecine', 'Droit', 'Éducation',
    'Design', 'Communication', 'Commerce', 'Recherche'
  ]

  useEffect(() => {
    fetchForums()
  }, [filters])

  const fetchForums = async () => {
    setIsLoading(true)
    try {
      const { forums, error } = await forumService.getForums(filters)
      if (error) {
        console.error('Erreur lors du chargement des forums:', error)
      } else {
        setForums(forums)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des forums:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchForumPosts = async (forumId: string) => {
    try {
      const { posts, error } = await forumService.getForumPosts(forumId)
      if (error) {
        console.error('Erreur lors du chargement des posts:', error)
      } else {
        setForumPosts(posts)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error)
    }
  }

  const handleCreateForum = async () => {
    if (!user || !newForum.title.trim() || !newForum.description.trim()) return

    setIsLoading(true)
    try {
      const forumData = {
        title: newForum.title,
        description: newForum.description,
        category: newForum.category || 'Général',
        country: newForum.country || undefined,
        school: newForum.school || undefined,
        domain: newForum.domain || undefined,
        isPrivate: newForum.isPrivate,
        tags: newForum.tags.filter(tag => tag.trim() !== ''),
        createdBy: user.id
      }

      const { forum, error } = await forumService.createForum(forumData)
      
      if (error) {
        alert(`Erreur: ${error}`)
      } else {
        setForums(prev => [forum!, ...prev])
        setNewForum({
          title: '',
          description: '',
          category: '',
          country: '',
          school: '',
          domain: '',
          isPrivate: false,
          tags: ['']
        })
        setShowCreateForm(false)
        alert('Forum créé avec succès ! Il sera visible après validation par un administrateur.')
      }
    } catch (error) {
      console.error('Erreur lors de la création du forum:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!selectedForum || !newPost.title.trim() || !newPost.content.trim()) return

    setIsLoading(true)
    try {
      const postData = {
        forumId: selectedForum.id,
        title: newPost.title,
        content: newPost.content,
        authorId: user?.id || '',
        tags: newPost.tags.filter(tag => tag.trim() !== '')
      }

      const { post, error } = await forumService.createPost(postData)
      
      if (error) {
        alert(`Erreur: ${error}`)
      } else {
        setForumPosts(prev => [post!, ...prev])
        setNewPost({
          title: '',
          content: '',
          tags: ['']
        })
        setShowPostForm(false)
      }
    } catch (error) {
      console.error('Erreur lors de la création du post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Études et Bourses':
        return <GraduationCap className="h-4 w-4 text-blue-500" />
      case 'Carrière et Emploi':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'Intégration et Vie Locale':
        return <MapPin className="h-4 w-4 text-orange-500" />
      case 'Technologies':
        return <Building className="h-4 w-4 text-purple-500" />
      case 'Mentorat':
        return <Users className="h-4 w-4 text-pink-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Études et Bourses':
        return 'bg-blue-100 text-blue-800'
      case 'Carrière et Emploi':
        return 'bg-green-100 text-green-800'
      case 'Intégration et Vie Locale':
        return 'bg-orange-100 text-orange-800'
      case 'Technologies':
        return 'bg-purple-100 text-purple-800'
      case 'Mentorat':
        return 'bg-pink-100 text-pink-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'À l\'instant'
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`
    if (diffInMinutes < 10080) return `Il y a ${Math.floor(diffInMinutes / 1440)}j`
    return date.toLocaleDateString('fr-FR')
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <MessageSquare className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connexion requise</h2>
        <p className="text-gray-600">Vous devez être connecté pour accéder aux forums.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          Forums de Discussion
        </h1>
        <p className="text-gray-600 mt-2">
          Échangez avec la communauté sur vos études, carrière et intégration
        </p>
      </div>

      {!selectedForum ? (
        <>
          {/* Filtres */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres de recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Recherche</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Rechercher dans les forums..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Toutes les catégories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Select
                    value={filters.country}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Tous les pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les pays</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="domain">Domaine</Label>
                  <Select
                    value={filters.domain}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, domain: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Tous les domaines" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tous les domaines</SelectItem>
                      {domains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          {domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Créer un forum */}
          {!showCreateForm ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Créer un Nouveau Forum
                </CardTitle>
                <CardDescription>
                  Créez un forum de discussion pour votre communauté
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowCreateForm(true)} className="w-full">
                  Créer un forum
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Créer un Forum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="forumTitle">Titre du forum *</Label>
                    <Input
                      id="forumTitle"
                      value={newForum.title}
                      onChange={(e) => setNewForum(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Étudiants en Informatique à Paris"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="forumCategory">Catégorie</Label>
                    <Select
                      value={newForum.category}
                      onValueChange={(value) => setNewForum(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="forumCountry">Pays (optionnel)</Label>
                    <Select
                      value={newForum.country}
                      onValueChange={(value) => setNewForum(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner un pays" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun pays spécifique</SelectItem>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="forumDomain">Domaine (optionnel)</Label>
                    <Select
                      value={newForum.domain}
                      onValueChange={(value) => setNewForum(prev => ({ ...prev, domain: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner un domaine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Aucun domaine spécifique</SelectItem>
                        {domains.map((domain) => (
                          <SelectItem key={domain} value={domain}>
                            {domain}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="forumDescription">Description *</Label>
                  <Textarea
                    id="forumDescription"
                    value={newForum.description}
                    onChange={(e) => setNewForum(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Décrivez le but de ce forum et les sujets de discussion..."
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-4 block">Tags (optionnel)</Label>
                  <div className="space-y-2">
                    {newForum.tags.map((tag, index) => (
                      <Input
                        key={index}
                        value={tag}
                        onChange={(e) => {
                          const newTags = [...newForum.tags]
                          newTags[index] = e.target.value
                          setNewForum(prev => ({ ...prev, tags: newTags }))
                        }}
                        placeholder={`Tag ${index + 1}`}
                      />
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewForum(prev => ({ 
                        ...prev, 
                        tags: [...prev.tags, ''] 
                      }))}
                    >
                      Ajouter un tag
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newForum.isPrivate}
                    onChange={(e) => setNewForum(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="isPrivate" className="flex items-center gap-2 cursor-pointer">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Forum privé (accès restreint)</span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={handleCreateForum}
                    disabled={isLoading || !newForum.title.trim() || !newForum.description.trim()}
                    className="flex-1"
                  >
                    {isLoading ? 'Création...' : 'Créer le forum'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des forums */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Chargement des forums...</p>
            </div>
          ) : forums.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun forum trouvé</h3>
                <p className="text-gray-600">
                  Aucun forum ne correspond à vos critères de recherche.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {forums.map((forum) => (
                <Card key={forum.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                  setSelectedForum(forum)
                  fetchForumPosts(forum.id)
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getCategoryIcon(forum.category)}
                          <h3 className="text-lg font-semibold">{forum.title}</h3>
                          <Badge className={getCategoryColor(forum.category)}>
                            {forum.category}
                          </Badge>
                          {forum.is_private && (
                            <Badge variant="outline">
                              <Lock className="h-3 w-3 mr-1" />
                              Privé
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4">{forum.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                          {forum.country && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{forum.country}</span>
                            </div>
                          )}
                          {forum.school && (
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4" />
                              <span>{forum.school}</span>
                            </div>
                          )}
                          {forum.domain && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <span>{forum.domain}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{getRelativeTime(forum.updated_at)}</span>
                          </div>
                        </div>

                        {forum.tags && forum.tags.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {forum.tags.slice(0, 5).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {forum.tags.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{forum.tags.length - 5}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Créé par {forum.owner?.first_name} {forum.owner?.last_name}</span>
                          </div>
                          {forum.moderator && (
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              <span>Modéré par {forum.moderator.first_name} {forum.moderator.last_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* En-tête du forum */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedForum(null)
                    setForumPosts([])
                  }}
                  className="mb-4"
                >
                  ← Retour aux forums
                </Button>
                <Button onClick={() => setShowPostForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau post
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-4">
                {getCategoryIcon(selectedForum.category)}
                <h1 className="text-2xl font-bold">{selectedForum.title}</h1>
                <Badge className={getCategoryColor(selectedForum.category)}>
                  {selectedForum.category}
                </Badge>
                {selectedForum.is_private && (
                  <Badge variant="outline">
                    <Lock className="h-3 w-3 mr-1" />
                    Privé
                  </Badge>
                )}
              </div>

              <p className="text-gray-600 mb-4">{selectedForum.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {selectedForum.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedForum.country}</span>
                  </div>
                )}
                {selectedForum.school && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>{selectedForum.school}</span>
                  </div>
                )}
                {selectedForum.domain && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>{selectedForum.domain}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Créé par {selectedForum.owner?.first_name} {selectedForum.owner?.last_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Dernière activité: {getRelativeTime(selectedForum.updated_at)}</span>
                </div>
              </div>

              {selectedForum.tags && selectedForum.tags.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedForum.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulaire de nouveau post */}
          {showPostForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Nouveau Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="postTitle">Titre du post *</Label>
                  <Input
                    id="postTitle"
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Sujet de votre discussion..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="postContent">Contenu *</Label>
                  <Textarea
                    id="postContent"
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Décrivez votre question ou partagez votre expérience..."
                    className="mt-1"
                    rows={6}
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-4 block">Tags (optionnel)</Label>
                  <div className="space-y-2">
                    {newPost.tags.map((tag, index) => (
                      <Input
                        key={index}
                        value={tag}
                        onChange={(e) => {
                          const newTags = [...newPost.tags]
                          newTags[index] = e.target.value
                          setNewPost(prev => ({ ...prev, tags: newTags }))
                        }}
                        placeholder={`Tag ${index + 1}`}
                      />
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewPost(prev => ({ 
                        ...prev, 
                        tags: [...prev.tags, ''] 
                      }))}
                    >
                      Ajouter un tag
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={handleCreatePost}
                    disabled={isLoading || !newPost.title.trim() || !newPost.content.trim()}
                    className="flex-1"
                  >
                    {isLoading ? 'Publication...' : 'Publier le post'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowPostForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des posts */}
          {forumPosts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun post dans ce forum</h3>
                <p className="text-gray-600">
                  Soyez le premier à démarrer une discussion !
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {forumPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {post.is_pinned && (
                            <Pin className="h-4 w-4 text-blue-500" />
                          )}
                          <h3 className="text-lg font-semibold">{post.title}</h3>
                        </div>
                        
                        <p className="text-gray-600 mb-4 whitespace-pre-wrap">{post.content}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{post.author?.first_name} {post.author?.last_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{getRelativeTime(post.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span>{post.views || 0} vues</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.replies?.length || 0} réponses</span>
                          </div>
                        </div>

                        {post.tags && post.tags.length > 0 && (
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                              {post.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex items-center gap-4">
                          <Button variant="outline" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            J'aime
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Répondre
                          </Button>
                          <Button variant="outline" size="sm">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Signaler
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
